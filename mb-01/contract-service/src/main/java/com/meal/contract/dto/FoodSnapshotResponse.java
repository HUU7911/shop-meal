package com.meal.contract.dto;

import java.math.BigDecimal;
import java.util.List;

public record FoodSnapshotResponse(
        String id,
        String name,
        String image,
        List<String> size,
        List<BigDecimal> price) {
}
