package com.meal.product.dto.request;

import com.meal.product.constant.Type;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record FoodRequest(
        String id, String name, String position, String timeWork,
        BigDecimal price, List<String> images, Type type, Set<String> categories)
{}
