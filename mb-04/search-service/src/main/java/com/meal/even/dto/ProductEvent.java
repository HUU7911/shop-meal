package com.meal.even.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.meal.search.constants.Type;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
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
    List<CategoryEvent> categories;
}