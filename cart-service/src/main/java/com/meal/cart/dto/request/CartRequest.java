package com.meal.cart.dto.request;

import com.meal.cart.entity.CartItem;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartRequest {
    String id;
    String userId;
    List<CartItem> item;
    BigDecimal totalPrice;
}
