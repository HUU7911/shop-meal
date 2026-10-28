package com.meal.cart.dto.request;

import java.math.BigDecimal;

public record AddProductToCartRequest(
        String productId,
        String size,
        BigDecimal price,
        String images
) {}
