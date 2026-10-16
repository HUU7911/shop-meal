package com.meal.payment.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record PaymentResponse(
        String paymentId,
        String orderId,
        Long orderCode,
        BigDecimal amount,
        String checkoutUrl,
        String status,
        LocalDateTime expiredAt
) {
}