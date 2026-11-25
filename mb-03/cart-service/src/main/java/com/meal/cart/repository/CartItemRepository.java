package com.meal.cart.repository;

import com.meal.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteAllByCartId(@Param("cartId") String cartId);
}