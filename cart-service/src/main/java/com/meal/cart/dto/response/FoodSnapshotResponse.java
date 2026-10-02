package com.meal.cart.dto.response;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record FoodSnapshotResponse(
        String id, String name,
        String image, BigDecimal price
) {}
