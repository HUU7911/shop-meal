package com.meal.order.dto.client;

import java.math.BigDecimal;

public record FoodSnapshotResponse(
        String id,
        String name,
        String image,
        BigDecimal price) {
}
