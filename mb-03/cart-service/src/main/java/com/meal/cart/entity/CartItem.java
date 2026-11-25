package com.meal.cart.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "cart_items",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_cart_items_cart_product_size",
                columnNames = {"cart_id", "product_id", "size"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    Cart cart;

    @Column(name = "product_id", nullable = false, length = 64)
    String productId;

    @Column(name = "product_name", nullable = false)
    String productName;

    @Column(name = "size", nullable = false, length = 32)
    String size;

    @Column(name = "price", nullable = false, precision = 19, scale = 2)
    BigDecimal price;

    @Column(name = "image", length = 1000)
    String image;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CartItem other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}