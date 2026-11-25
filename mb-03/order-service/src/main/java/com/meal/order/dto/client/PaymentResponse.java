package com.meal.order.dto.client;

import lombok.Builder;

@Builder
public record PaymentResponse(

        String paymentId,

        String orderId,

        Long orderCode,

        Long amount,

        String checkoutUrl,

        String status

) {
}