package com.meal.cart.mapper;

import com.meal.cart.dto.request.CartItemRequest;
import com.meal.cart.dto.response.CartResponse;
import com.meal.cart.entity.CartItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CartItemMapper {
    CartItem toCartItem(CartItemRequest request);
    CartResponse toCartResponse(CartItem cartItem);
}
