package com.meal.payment.service;

import com.meal.payment.constant.PaymentStatus;
import com.meal.payment.entity.Payment;
import com.meal.payment.repository.PaymentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentExpirationScheduler {

    PaymentRepository paymentRepository;
    PaymentService paymentService;

    @Scheduled(fixedDelay = 60_000)
    public void expirePendingPayments() {
        List<Payment> due = paymentRepository
                .findTop100ByStatusAndExpiredAtBeforeOrderByExpiredAtAsc(
                        PaymentStatus.PENDING,
                        LocalDateTime.now().minusMinutes(PaymentService.EXPIRE_GRACE_MINUTES));

        for (Payment payment : due) {
            try {
                paymentService.expireIfNeeded(payment.getOrderCode());
            } catch (Exception e) {
                log.error("Expire payment failed, orderCode={}", payment.getOrderCode(), e);
            }
        }
    }
}
