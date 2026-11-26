package com.meal.order.dto.request;

import com.meal.contract.constant.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "status is required") OrderStatus status) {
}
