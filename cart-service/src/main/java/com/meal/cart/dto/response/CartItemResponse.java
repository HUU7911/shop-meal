package com.meal.cart.dto.response;

import java.math.BigDecimal;

public record CartItemResponse(
        String itemId,
        String foodId,
        String name,
        String image,
        BigDecimal unitPrice,
        int quantity,
        String note,
        BigDecimal subtotal) {
}
