package com.meal.order.dto.client;

import java.math.BigDecimal;

public record FoodOrderRequest(
        String productId,
        Integer quantity,
        String size,
        BigDecimal price,
        String images
) {}
