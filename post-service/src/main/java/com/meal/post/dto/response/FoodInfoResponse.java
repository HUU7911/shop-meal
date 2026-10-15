package com.meal.post.dto.response;

import lombok.Builder;

@Builder
public record FoodInfoResponse(String id, String name) {}
