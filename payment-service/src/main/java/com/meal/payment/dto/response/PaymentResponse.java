package com.meal.payment.dto.response;

import java.math.BigDecimal;

public record PaymentResponse(

        String paymentId,

        String orderId,

        Long orderCode,

        BigDecimal amount,

        String checkoutUrl,

        String status

) {
}