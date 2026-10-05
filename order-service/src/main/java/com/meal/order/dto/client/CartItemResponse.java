package com.meal.order.dto.client;

import java.math.BigDecimal;

public record CartItemResponse(
        String id,
        String productId,
        String productName,
        BigDecimal price,
        String image,
        Integer quantity) {
}
