package com.meal.order.dto.response;

import java.math.BigDecimal;

public record OrderItemResponse(
        String id,
        String productId,
        String productName,
        String image,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal subTotal) {
}
