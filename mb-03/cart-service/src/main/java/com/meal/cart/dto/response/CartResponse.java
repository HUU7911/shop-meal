package com.meal.cart.dto.response;

import com.meal.cart.entity.CartItem;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartResponse {

    String id;

    String userId;

    Set<CartItemResponse> items;

    BigDecimal totalPrice;
}