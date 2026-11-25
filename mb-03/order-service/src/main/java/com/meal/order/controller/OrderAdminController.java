package com.meal.order.controller;

import com.meal.order.constants.OrderStatus;
import com.meal.order.dto.ApiResponse;
import com.meal.order.dto.PageResponse;
import com.meal.order.dto.request.UpdateOrderStatusRequest;
import com.meal.order.dto.response.OrderResponse;
import com.meal.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderAdminController {

    OrderService orderService;

    @GetMapping
    ApiResponse<PageResponse<OrderResponse>> getAll(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<OrderResponse>>builder()
                .results(orderService.getAllOrders(status, page, size))
                .build();
    }

    @PatchMapping("/{id}/status")
    ApiResponse<OrderResponse> updateStatus(
            @PathVariable String id,
            @RequestBody @Valid UpdateOrderStatusRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .results(orderService.updateStatus(id, request.status()))
                .build();
    }

    @PatchMapping("/{id}/confirm-payment")
    ApiResponse<OrderResponse> confirmPayment(@PathVariable String id) {
        return ApiResponse.<OrderResponse>builder()
                .results(orderService.confirmPayment(id))
                .build();
    }
}
