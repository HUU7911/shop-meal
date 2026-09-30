package com.meal.product.entity;

import com.meal.product.constant.Type;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@Table(name = "food")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String name;

    String position;

    String timeWork;

    String description;

    BigDecimal price;

    List<String> images;

    Type type;

    @ManyToMany(fetch = FetchType.EAGER)
    Set<Category> categories;
}