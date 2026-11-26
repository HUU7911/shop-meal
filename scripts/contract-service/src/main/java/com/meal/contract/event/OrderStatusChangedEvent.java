package com.meal.contract.event;

import com.meal.contract.constant.OrderStatus;

public record OrderStatusChangedEvent(
        String orderId,
        String orderCode,
        String userId,
        OrderStatus status) {
}
