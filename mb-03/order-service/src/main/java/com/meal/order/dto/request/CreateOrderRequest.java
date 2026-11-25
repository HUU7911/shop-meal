package com.meal.order.dto.request;

import com.meal.order.constants.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
        @NotBlank(message = "receiverName is required")
        @Size(max = 100, message = "receiverName must be at most 100 characters")
        String receiverName,

        @NotBlank(message = "phone is required")
        @Pattern(regexp = "^(0|\\+84)\\d{9}$", message = "phone is invalid")
        String phone,

        @NotBlank(message = "address is required")
        @Size(max = 500, message = "address must be at most 500 characters")
        String address,

        @Size(max = 255, message = "note must be at most 255 characters")
        String note,

        @NotNull(message = "paymentMethod is required")
        PaymentMethod paymentMethod) {
}
