package com.meal.product.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record FoodSnapshotResponse(
        String id, String name,
        String image, List<String> size ,List<BigDecimal> price
) {}
