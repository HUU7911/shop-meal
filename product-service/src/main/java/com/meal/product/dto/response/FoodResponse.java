package com.meal.product.dto.response;

import com.meal.product.constant.Type;
import com.meal.product.entity.Category;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record FoodResponse(
        String id, String name, String position, String timeWork,
        BigDecimal price, List<String> images, Type type, Set<Category> categories)
{}
