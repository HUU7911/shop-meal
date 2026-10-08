package com.meal.order.dto.client;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record CreatePaymentRequest(

        @NotBlank
        String orderId,

        @Min(1000)
        BigDecimal amount

) {
}