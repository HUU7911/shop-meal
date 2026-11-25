package com.meal.cart.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "carts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_id", nullable = false, unique = true, length = 64)
    String userId;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    Set<CartItem> items = new HashSet<>();

    @Column(name = "total_price", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    BigDecimal totalPrice = BigDecimal.ZERO;

    @Version
    Long version;

    public void addItem(CartItem item) {
        item.setCart(this);
        items.add(item);
        recalculateTotal();
    }

    public void recalculateTotal() {
        this.totalPrice = items.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}