package com.meal.event.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductEvent {
    private String eventType; // CREATED | DELETED
    private String id;
    private String name;
    private BigDecimal price;
    private List<String> images;
}
