package com.meal.product.service;

import com.meal.product.dto.request.CategoryRequest;
import com.meal.product.dto.response.CategoryResponse;
import com.meal.product.mapper.CategoryMapper;
import com.meal.product.repository.CategoriesRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryService {

    CategoriesRepository categoriesRepository;
    CategoryMapper categoryMapper;

    public CategoryResponse create(CategoryRequest request) {
        var category = categoryMapper.toCategory(request);

        return categoryMapper.toCategoryResponse(categoriesRepository.save(category));
    }

    public List<CategoryResponse> getAll() {
        return categoriesRepository.findAll()
                .stream().map(categoryMapper::toCategoryResponse)
                .toList();
    }

    public void deleteById(String id) {
        categoriesRepository.deleteById(id);
    }
}
