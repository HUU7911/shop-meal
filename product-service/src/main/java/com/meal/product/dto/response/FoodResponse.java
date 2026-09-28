package com.meal.product.dto.response;

import com.meal.product.constant.Type;
import com.meal.product.entity.Category;
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
public class FoodResponse {

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
