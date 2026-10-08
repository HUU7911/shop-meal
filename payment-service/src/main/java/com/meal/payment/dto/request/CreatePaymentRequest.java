package com.meal.payment.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record CreatePaymentRequest(

        @NotBlank
        String orderId,

        @Min(1000)
        BigDecimal amount

) {
}