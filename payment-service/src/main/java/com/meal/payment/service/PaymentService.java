package com.meal.payment.service;

import com.meal.event.dto.PaymentPaidEvent;
import com.meal.payment.constant.PaymentStatus;
import com.meal.payment.dto.request.CreatePaymentRequest;
import com.meal.payment.dto.response.PaymentResponse;
import com.meal.payment.entity.Payment;
import com.meal.payment.exception.AppException;
import com.meal.payment.exception.ErrorCode;
import com.meal.payment.repository.PaymentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Predicate;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {
    static final int PAYOS_DESCRIPTION_MAX_LENGTH = 25;

    private static final Map<PaymentStatus, Predicate<Payment>> REUSABLE = Map.of(
            PaymentStatus.PAID, p -> true,
            PaymentStatus.PENDING, p -> p.getExpiredAt() != null
                    && p.getExpiredAt().isAfter(LocalDateTime.now())
    );

    public static final long EXPIRE_GRACE_MINUTES = 1;

    PayOS payOS;
    PaymentRepository paymentRepository;
    ApplicationEventPublisher eventPublisher;

    @NonFinal
    @Value("${payos.cancel-url}")
    private String cancelUrl;

    @NonFinal
    @Value("${payos.return-url}")
    private String returnUrl;

    @NonFinal
    @Value("${payos.expire-minutes:15}")
    private long expireMinutes;

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        Payment payment = paymentRepository.findByOrderIdForUpdate(request.orderId()).orElse(null);

        if (payment != null
                && REUSABLE.getOrDefault(payment.getStatus(), p -> false).test(payment)) {
            return toResponse(payment);
        }

        Long orderCode = generateOrderCode();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiredAt = now.plusMinutes(expireMinutes);
        long expiredAtEpochSeconds = expiredAt.atZone(ZoneId.systemDefault()).toEpochSecond();

        CreatePaymentLinkResponse link;
        try {
            link = payOS.paymentRequests().create(
                    CreatePaymentLinkRequest.builder()
                            .orderCode(orderCode)
                            .amount(request.amount().longValueExact())
                            .description(buildDescription(orderCode))
                            .cancelUrl(cancelUrl)
                            .returnUrl(returnUrl)
                            .expiredAt(expiredAtEpochSeconds)
                            .build());
        } catch (Exception e) {
            log.error("Create PayOS payment link failed, orderId={}", request.orderId(), e);
            throw new AppException(ErrorCode.PAID_NOT_SEND);
        }

        if (payment == null) {
            payment = Payment.builder().orderId(request.orderId()).build();
        }
        payment.setOrderCode(orderCode);
        payment.setAmount(request.amount());
        payment.setPaymentLinkId(link.getPaymentLinkId());
        payment.setCheckoutUrl(link.getCheckoutUrl());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionReference(null);
        payment.setPaidAt(null);
        payment.setCreatedAt(now);
        payment.setExpiredAt(expiredAt);

        try {
            paymentRepository.saveAndFlush(payment);
        } catch (RuntimeException e) {
            log.error("Save payment failed, orderId={}, orderCode={}", request.orderId(), orderCode, e);
            cancelRemoteQuietly(orderCode);
            if (e instanceof DataIntegrityViolationException) {
                throw new AppException(ErrorCode.PAYMENT_IN_PROGRESS);
            }
            throw new AppException(ErrorCode.PAID_NOT_SEND);
        }

        return toResponse(payment);
    }

    @Transactional
    public void handleWebhook(Webhook body) {
        WebhookData data;
        try {
            data = payOS.webhooks().verify(body);
        } catch (Exception e) {
            log.warn("Invalid PayOS webhook signature", e);
            throw new AppException(ErrorCode.INVALID_WEBHOOK_SIGNATURE);
        }

        Payment payment = paymentRepository
                .findByOrderCodeForUpdate(data.getOrderCode())
                .orElse(null);
        if (payment == null) {
            log.warn("Webhook for unknown orderCode={} (bỏ qua nếu là request test)", data.getOrderCode());
            return;
        }

        if (payment.getStatus() == PaymentStatus.PAID) return;

        if (payment.getAmount().compareTo(BigDecimal.valueOf(data.getAmount())) != 0) {
            log.error("Amount mismatch, orderCode={}, expected={}, received={}",
                    data.getOrderCode(), payment.getAmount(), data.getAmount());
            return;
        }

        if (!"00".equals(data.getCode())) {
            log.info("Ignore webhook with code={}, orderCode={}", data.getCode(), data.getOrderCode());
            return;
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            log.warn("Payment received after status={}, orderCode={}",
                    payment.getStatus(), payment.getOrderCode());
        }
        markPaid(payment, data.getReference());
    }

    @Transactional
    public void expireIfNeeded(Long orderCode) {
        Payment payment = paymentRepository.findByOrderCodeForUpdate(orderCode).orElse(null);

        if (payment == null
                || payment.getStatus() != PaymentStatus.PENDING
                || payment.getExpiredAt() == null
                || payment.getExpiredAt().isAfter(LocalDateTime.now().minusMinutes(EXPIRE_GRACE_MINUTES))) {
            return;
        }

        PaymentLinkStatus remote = fetchRemoteStatus(orderCode);
        applyRemoteStatus(payment, remote);
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return;
        }

        if (remote == PaymentLinkStatus.PENDING) {
            cancelRemoteQuietly(orderCode);
            payment.setStatus(PaymentStatus.CANCELLED);
            log.info("Payment expired, orderCode={}", orderCode);
        } else {
            log.warn("Expired payment still {} at PayOS, orderCode={}", remote, orderCode);
        }
    }

    private void markPaid(Payment payment, String reference) {
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        if (reference != null) {
            payment.setTransactionReference(reference);
        }
        paymentRepository.save(payment);

        eventPublisher.publishEvent(new PaymentPaidEvent(
                payment.getOrderId(), payment.getOrderCode(), payment.getAmount(), payment.getPaidAt()));
    }

    private void applyRemoteStatus(Payment payment, PaymentLinkStatus remote) {
        switch (remote) {
            case PAID -> markPaid(payment, null);
            case CANCELLED, EXPIRED -> payment.setStatus(PaymentStatus.CANCELLED);
            case FAILED -> payment.setStatus(PaymentStatus.FAILED);
            default -> {
            }
        }
    }

    private PaymentLinkStatus fetchRemoteStatus(Long orderCode) {
        try {
            return payOS.paymentRequests().get(orderCode).getStatus();
        } catch (Exception e) {
            log.error("Fetch PayOS payment status failed, orderCode={}", orderCode, e);
            throw new AppException(ErrorCode.PAYOS_UNAVAILABLE);
        }
    }

    private void cancelRemoteQuietly(Long orderCode) {
        try {
            payOS.paymentRequests().cancel(orderCode, "Cancelled by payment-service");
        } catch (Exception e) {
            log.warn("Cancel PayOS payment link failed (ignored), orderCode={}", orderCode, e);
        }
    }

    private Long generateOrderCode() {
        return System.currentTimeMillis() * 1000 + ThreadLocalRandom.current().nextInt(1000);
    }

    private String buildDescription(Long orderCode) {
        String description = "DH" + orderCode;
        return description.length() > PAYOS_DESCRIPTION_MAX_LENGTH
                ? description.substring(0, PAYOS_DESCRIPTION_MAX_LENGTH)
                : description;
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .orderId(payment.getOrderId())
                .orderCode(payment.getOrderCode())
                .amount(payment.getAmount())
                .paymentId(payment.getPaymentLinkId())
                .checkoutUrl(payment.getCheckoutUrl())
                .status(String.valueOf(payment.getStatus()))
                .expiredAt(payment.getExpiredAt())
                .build();
    }
}