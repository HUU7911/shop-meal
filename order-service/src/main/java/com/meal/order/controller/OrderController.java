package com.meal.order.controller;

import com.meal.order.dto.ApiResponse;
import com.meal.order.dto.PageResponse;
import com.meal.order.dto.request.CreateOrderRequest;
import com.meal.order.dto.response.OrderResponse;
import com.meal.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    OrderService orderService;

    @PostMapping("/create")
    ApiResponse<OrderResponse> create(@RequestBody @Valid CreateOrderRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .results(orderService.createOrder(request))
                .build();
    }

    @GetMapping("/my-orders")
    ApiResponse<PageResponse<OrderResponse>> myOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<OrderResponse>>builder()
                .results(orderService.getMyOrders(page, size))
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<OrderResponse> getOne(@PathVariable String id) {
        return ApiResponse.<OrderResponse>builder()
                .results(orderService.getMyOrder(id))
                .build();
    }

    @PatchMapping("/{id}/cancel")
    ApiResponse<OrderResponse> cancel(@PathVariable String id) {
        return ApiResponse.<OrderResponse>builder()
                .results(orderService.cancelMyOrder(id))
                .build();
    }
}
