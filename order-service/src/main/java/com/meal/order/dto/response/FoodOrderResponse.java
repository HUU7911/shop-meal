package com.meal.order.dto.response;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record FoodOrderResponse(
        String productId,
        String size,
        BigDecimal price,
        String images
) {}
