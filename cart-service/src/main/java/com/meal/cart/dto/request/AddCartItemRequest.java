package com.meal.cart.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddCartItemRequest(
        @NotBlank(message = "FOOD_ID_REQUIRED") String foodId,
        @Min(value = 1, message = "INVALID_QUANTITY") int quantity,
        @Size(max = 255, message = "NOTE_TOO_LONG") String note) {
}