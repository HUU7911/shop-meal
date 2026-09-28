package com.meal.product.dto.request;

import com.meal.product.constant.Type;
import com.meal.product.entity.Category;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FoodRequest {

    String id;

    String name;

    String position;

    String timeWork;

    String description;

    BigDecimal price;

    List<String> images;

    Type type;

    Set<String> categories;
}
