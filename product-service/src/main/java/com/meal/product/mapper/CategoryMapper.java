package com.meal.product.mapper;

import com.meal.product.dto.request.CategoryRequest;
import com.meal.product.dto.response.CategoryResponse;
import com.meal.product.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toCategory(CategoryRequest request);
    CategoryResponse toCategoryResponse(Category category);
}
