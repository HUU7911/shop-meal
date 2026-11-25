package com.meal.event.dto;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
public class PaymentEventListener {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaymentPaid(PaymentPaidEvent event) {
        log.info("Payment PAID: orderId={}, orderCode={}, amount={}",
                event.orderId(), event.orderCode(), event.amount());
    }
}
