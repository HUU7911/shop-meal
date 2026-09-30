package com.meal.product.service;

import com.meal.product.dto.request.CategoryRequest;
import com.meal.product.dto.response.CategoryResponse;
import com.meal.product.mapper.CategoryMapper;
import com.meal.product.repository.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryService {

    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    public CategoryResponse create(CategoryRequest categoryRequest) {
        var category = categoryMapper.toCategory(categoryRequest);

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toCategoryResponse).toList();
    }

    public void deleteById(String id) {
        categoryRepository.deleteById(id);
    }
}
