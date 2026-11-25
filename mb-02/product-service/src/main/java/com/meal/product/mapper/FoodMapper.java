package com.meal.product.mapper;

import com.meal.product.dto.request.FoodRequest;
import com.meal.product.dto.request.FoodUpdateRequest;
import com.meal.product.dto.response.FoodResponse;
import com.meal.product.entity.Food;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FoodMapper {

    @Mapping(target = "categories", ignore = true)
    Food toFood(FoodRequest request);

    FoodResponse toFoodResponse(Food food);

    @Mapping(target = "categories", ignore = true)
    void updateFood(@MappingTarget Food food, FoodUpdateRequest request);
}
