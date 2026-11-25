package com.meal.cart.dto.request;

import java.math.BigDecimal;

public record CartItemRequest(
        String id,
        String productId,
        String productName,
        BigDecimal price,
        String image,
        Integer quantity) {
}