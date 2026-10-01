package com.meal.cart.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateCartItemRequest(
        @Min(value = 1, message = "INVALID_QUANTITY") int quantity,
        @Size(max = 255, message = "NOTE_TOO_LONG") String note) {
}