package com.meal.even.dto;

import com.meal.search.constants.Type;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

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

    String categories;
}
