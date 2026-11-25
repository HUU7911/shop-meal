package com.meal.cart.dto.response;

import java.math.BigDecimal;

public record AddProductToCartResponse(
        String productId,
        String size,
        BigDecimal price,
        String images)
{}
