package com.meal.even.dto;

import com.meal.product.constant.Type;
import com.meal.product.entity.Category;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductEvent {
    String eventType;

    String id;

    String name;

    String position;

    String timeWork;

    String description;

    BigDecimal price;

    List<String> images;

    Type type;

    Set<Category> categories;
}
