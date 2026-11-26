package com.meal.contract.event;

import com.meal.contract.constant.Type;
import com.meal.contract.dto.Category;
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

    List<String> size;

    List<BigDecimal> price;

    List<String> images;

    Type type;

    Set<CategoryEvent> categories;
}
