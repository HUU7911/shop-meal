package com.meal.product.dto.request;

import com.meal.contract.constant.Type;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;

public record FoodRequest(
        String id, String name, String position, String timeWork,
        String description, List<String> size, List<BigDecimal> price,
        List<String> images, Type type, Set<String> categories, Instant createdDate)
{}
