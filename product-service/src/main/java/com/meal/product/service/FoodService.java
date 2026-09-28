package com.meal.product.service;

import com.meal.event.dto.ProductEvent;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FoodService {

    FoodRepository foodRepository;
    FoodMapper foodMapper;
    CategoriesRepository categoriesRepository;
    KafkaTemplate<String, ProductEvent> kafkaTemplate;

    public FoodResponse create(FoodRequest request) {
        if (foodRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.PRODUCT_EXISTED);
        }

        var food = foodMapper.toFood(request);

        HashSet<Category> categories = new HashSet<>(
                categoriesRepository.findAllById(request.getCategories()));
        food.setCategories(categories);

        food = foodRepository.save(food);

        ProductEvent productEvent = ProductEvent.builder()
                .eventType("CREATED")
                .id(food.getId())
                .name(food.getName())
                .price(food.getPrice())
                .type(food.getType())
                .images(food.getImages())
                .categories(food.getCategories().toString())
                .build();

        publishProductEvent(productEvent);

        return foodMapper.toFoodResponse(food);
    }

    public List<FoodResponse> findAll() {
        return foodRepository.findAll()
                .stream().map(foodMapper::toFoodResponse)
                .toList();
    }

    public void deleteById(String id) {
        foodRepository.deleteById(id);

        ProductEvent productEvent = ProductEvent.builder()
                .eventType("DELETED")
                .id(id)
                .build();

        publishProductEvent(productEvent);
    }

    private void publishProductEvent(ProductEvent productEvent) {
        try {
            kafkaTemplate.send("product-event", productEvent);
            log.info("publish product event success: {}", productEvent);
        }catch (Exception e) {
            e.printStackTrace();
            log.error("publish product event error: {}", productEvent);
        }
    }
}
