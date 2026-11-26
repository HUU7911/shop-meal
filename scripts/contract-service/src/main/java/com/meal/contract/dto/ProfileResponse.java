package com.meal.contract.dto;

public record ProfileResponse(
        String userId,
        String firstName,
        String lastName,
        String email,
        String address) {
}
