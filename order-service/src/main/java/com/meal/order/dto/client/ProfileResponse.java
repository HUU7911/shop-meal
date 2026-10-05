package com.meal.order.dto.client;

public record ProfileResponse(
        String userId,
        String firstName,
        String lastName,
        String email,
        String address) {
}
