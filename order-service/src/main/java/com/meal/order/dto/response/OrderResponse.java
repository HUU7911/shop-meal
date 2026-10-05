package com.meal.order.dto.response;

import com.meal.order.constants.OrderStatus;
import com.meal.order.constants.PaymentMethod;
import com.meal.order.constants.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        String id,
        String orderCode,
        String userId,
        String receiverName,
        String phone,
        String address,
        String note,
        OrderStatus status,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        BigDecimal totalAmount,
        Instant createdAt,
        List<OrderItemResponse> items) {
}
