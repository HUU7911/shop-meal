package com.meal.cart.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSnapshot {
    @Id
    private String foodId;

    private String name;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    private String image;
}
