package com.meal.product.repository;

import com.meal.product.dto.response.FoodInfoResponse;
import com.meal.product.entity.Food;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FoodRepository extends JpaRepository<Food, String> {
    boolean existsByName(String name);

    @Query(
            "SELECT new com.meal.product.dto.response.FoodInfoResponse(f.id, f.name) FROM Food f WHERE f.id = :id"
    )
    Optional<FoodInfoResponse> findFoodInfoById(@Param("id") String id);
}
