package com.meal.cart.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"cart_id", "foodId"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id")
    private Cart cart;

    @Column(nullable = false)
    private String foodId;

    @Column(nullable = false)
    private int quantity;

    @Column(length = 255)
    private String note;
}
