package com.meal.contract.dto;

import java.math.BigDecimal;
import java.util.Set;

public record CartResponse(
        String id,
        String userId,
        Set<CartItemResponse> items,
        BigDecimal totalPrice) {
}
