package com.meal.cart.repository;

import com.meal.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, String> {
    @Modifying
    @Query("delete from CartItem i where i.foodId = :foodId")
    void deleteByFoodId(@Param("foodId") String foodId);
}
