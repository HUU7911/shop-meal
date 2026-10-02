package com.meal.cart.controller;

import com.meal.cart.dto.ApiResponse;
import com.meal.cart.dto.response.CartResponse;
import com.meal.cart.service.CartService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartController {

    CartService cartService;

    @PostMapping("/add/{productId}")
    public ApiResponse<CartResponse> addProductToCart(@PathVariable String productId) {
        return ApiResponse.<CartResponse>builder()
                .results(cartService.addProductToCart(productId))
                .build();
    }

    @GetMapping("/my-cart")
    public ApiResponse<CartResponse> getMyCart() {
        return ApiResponse.<CartResponse>builder()
                .results(cartService.getMyCart())
                .build();
    }

    @PatchMapping("/items/{itemId}/increase")
    public ApiResponse<CartResponse> increaseQuantity(@PathVariable String itemId) {
        return ApiResponse.<CartResponse>builder()
                .results(cartService.increaseQuantity(itemId))
                .build();
    }

    @PatchMapping("/items/{itemId}/decrease")
    public ApiResponse<CartResponse> decreaseQuantity(@PathVariable String itemId) {
        return ApiResponse.<CartResponse>builder()
                .results(cartService.decreaseQuantity(itemId))
                .build();
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<CartResponse> removeItem(@PathVariable String itemId) {
        return ApiResponse.<CartResponse>builder()
                .results(cartService.removeItem(itemId))
                .build();
    }
}