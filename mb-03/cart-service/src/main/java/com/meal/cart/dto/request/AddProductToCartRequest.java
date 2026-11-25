package com.meal.cart.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddProductToCartRequest(
        @NotBlank @Size(max = 64) String productId,
        @Min(1) @Max(99) Integer quantity,
        @Size(max = 32) String size
) {}