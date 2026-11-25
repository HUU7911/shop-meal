package com.meal.cart.mapper;

import com.meal.cart.dto.response.CartResponse;
import com.meal.cart.entity.Cart;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CartMapper {
    CartResponse toCartResponse(Cart cart);
}