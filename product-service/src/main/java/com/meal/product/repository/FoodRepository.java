package com.meal.product.repository;

import com.meal.product.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodRepository extends JpaRepository<Food, String> {
    boolean existsByName(String name);
}
