package com.meal.event.dto;

public record OrderCreatedEvent(String orderId, String orderCode) {
}
