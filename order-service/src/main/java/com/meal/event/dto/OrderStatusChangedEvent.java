package com.meal.event.dto;

import com.meal.order.constants.OrderStatus;

public record OrderStatusChangedEvent(
        String orderId,
        String orderCode,
        String userId,
        OrderStatus status) {
}
