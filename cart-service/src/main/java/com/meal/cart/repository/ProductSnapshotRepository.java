package com.meal.cart.repository;

import com.meal.cart.entity.ProductSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductSnapshotRepository extends JpaRepository<ProductSnapshot, String> {
}
