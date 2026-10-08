package com.meal.payment.service;

import com.meal.payment.constant.PaymentStatus;
import com.meal.payment.dto.request.CreatePaymentRequest;
import com.meal.payment.dto.response.PaymentResponse;
import com.meal.payment.entity.Payment;
import com.meal.payment.exception.AppException;
import com.meal.payment.exception.ErrorCode;
import com.meal.payment.properties.PayOSProperties;
import com.meal.payment.repository.PaymentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {

    PayOS payOS;
    PayOSProperties properties;
    PaymentRepository paymentRepository;

    public PaymentResponse createPayment(CreatePaymentRequest request) {

        Long orderCode = System.currentTimeMillis() / 1000;

        CreatePaymentLinkRequest paymentRequest =
                CreatePaymentLinkRequest.builder()
                        .orderCode(orderCode)
                        .amount(Long.valueOf(String.valueOf(request.amount())))
                        .description("Thanh toan " + request.orderId())
                        .cancelUrl(properties.getCancelUrl())
                        .returnUrl(properties.getReturnUrl())
                        .build();

        try {
            CreatePaymentLinkResponse response =
                    payOS.paymentRequests().create(paymentRequest);

            Payment payment = Payment.builder()
                    .orderId(request.orderId())
                    .orderCode(orderCode)
                    .amount(request.amount())
                    .paymentLinkId(response.getPaymentLinkId())
                    .checkoutUrl(response.getCheckoutUrl())
                    .status(PaymentStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();

            paymentRepository.save(payment);

            return new PaymentResponse(
                    payment.getId().toString(),
                    payment.getOrderId(),
                    payment.getOrderCode(),
                    payment.getAmount(),
                    payment.getCheckoutUrl(),
                    payment.getStatus().name()
            );

        } catch (Exception e) {
            throw new AppException(ErrorCode.PAID_NOT_SEND);
        }
    }
}