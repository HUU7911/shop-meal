package com.meal.product.service;

import com.meal.product.dto.request.FoodRequest;
import com.meal.product.dto.response.FoodResponse;
import com.meal.product.entity.Category;
import com.meal.product.exception.AppException;
import com.meal.product.exception.ErrorCode;
import com.meal.product.mapper.FoodMapper;
import com.meal.product.repository.CategoriesRepository;
import com.meal.product.repository.FoodRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FoodService {

    FoodRepository foodRepository;
    FoodMapper foodMapper;
    CategoriesRepository categoriesRepository;

    public FoodResponse create(FoodRequest request) {
        if (foodRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.PRODUCT_EXISTED);
        }

        var food = foodMapper.toFood(request);

        HashSet<Category> categories = new HashSet<>(
                categoriesRepository.findAllById(request.getCategories()));
        food.setCategories(categories);

        return foodMapper.toFoodResponse(foodRepository.save(food));
    }

    public List<FoodResponse> findAll() {
        return foodRepository.findAll()
                .stream().map(foodMapper::toFoodResponse)
                .toList();
    }

    public void deleteById(String id) {
        foodRepository.deleteById(id);
    }
}
