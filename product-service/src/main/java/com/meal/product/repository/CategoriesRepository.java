package com.meal.product.repository;

import com.meal.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriesRepository extends JpaRepository<Category, String> {
    Optional<Category> findByName(String name);
}
