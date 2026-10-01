package com.meal.cart.controller;

import com.meal.cart.dto.ApiResponse;
import com.meal.cart.dto.request.AddCartItemRequest;
import com.meal.cart.dto.request.UpdateCartItemRequest;
import com.meal.cart.dto.response.CartResponse;
import com.meal.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getMyCart() {
        return ApiResponse.<CartResponse>builder().results(cartService.getMyCart()).build();
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addItem(@RequestBody @Valid AddCartItemRequest request) {
        return ApiResponse.<CartResponse>builder().results(cartService.addItem(request)).build();
    }

    @PutMapping("/items/{itemId}")
    public ApiResponse<CartResponse> updateItem(@PathVariable String itemId,
                                                @RequestBody @Valid UpdateCartItemRequest request) {
        return ApiResponse.<CartResponse>builder().results(cartService.updateItem(itemId, request)).build();
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<CartResponse> removeItem(@PathVariable String itemId) {
        return ApiResponse.<CartResponse>builder().results(cartService.removeItem(itemId)).build();
    }

    @DeleteMapping
    public ApiResponse<Void> clear() {
        cartService.clear();
        return ApiResponse.<Void>builder().message("Cart cleared successfully").build();
    }
}
