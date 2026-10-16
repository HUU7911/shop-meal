package com.meal.event.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentPaidEvent(
        String orderId,
        Long orderCode,
        BigDecimal amount,
        LocalDateTime paidAt
) {
}
