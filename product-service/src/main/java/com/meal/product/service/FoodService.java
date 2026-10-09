package com.meal.product.service;

import com.meal.even.dto.ProductEvent;
import com.meal.product.dto.PageResponse;
import com.meal.product.dto.request.FoodRequest;
import com.meal.product.dto.response.FoodResponse;
import com.meal.product.dto.response.FoodSnapshotResponse;
import com.meal.product.entity.Category;
import com.meal.product.exception.AppException;
import com.meal.product.exception.ErrorCode;
import com.meal.product.mapper.FoodMapper;
import com.meal.product.repository.CategoryRepository;
import com.meal.product.repository.FoodRepository;
import com.meal.product.repository.httpclient.FileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FoodService {

    FoodMapper foodMapper;
    CategoryRepository categoryRepository;
    FoodRepository foodRepository;
    FileClient fileClient;
    KafkaTemplate<String, ProductEvent> kafkaTemplate;

    public FoodResponse createFood(FoodRequest request, MultipartFile file) {
        if (foodRepository.existsByName(request.name())){
            throw new AppException(ErrorCode.PRODUCT_EXIST);
        }

        var food = foodMapper.toFood(request);
        HashSet<Category> categories = new HashSet<>(
                categoryRepository.findAllById(request.categories()));
        food.setCategories(categories);
        food.setCreatedDate(Instant.now());

        var response = fileClient.upload(file);
        food.setImages(List.of(response.getResults().getUrl()));

        food = foodRepository.save(food);

        ProductEvent productEvent = ProductEvent.builder()
                .eventType("CREATED")
                .id(food.getId())
                .name(food.getName())
                .price(food.getPrice())
                .type(food.getType())
                .timeWork(food.getTimeWork())
                .description(food.getDescription())
                .images(food.getImages())
                .position(food.getPosition())
                .categories(food.getCategories())
                .build();

        publishProductEvent(productEvent);

        return foodMapper.toFoodResponse(food);
    }

    public FoodResponse getFoodById(String id) {
        var food = foodRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.PRODUCT_NOT_FOUND)
        );

        return foodMapper.toFoodResponse(food);
    }

    public FoodSnapshotResponse getFoodSnapshotById(String id) {
        var food = foodRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.PRODUCT_NOT_FOUND)
        );

        food = foodRepository.save(food);

        return FoodSnapshotResponse.builder()
                .id(id)
                .name(food.getName())
                .price(food.getPrice())
                .image(food.getImages().getFirst())
                .price(food.getPrice())
                .build();
    }

    public PageResponse<FoodResponse> findAllFood(int page, int size) {

        Sort sort = Sort.by(Sort.Direction.DESC, "createdDate").descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = foodRepository.findAll(pageable);

        return PageResponse.<FoodResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPage(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream()
                        .map(foodMapper::toFoodResponse).toList()
                )
                .build();
    }

    public void deleteFoodById(String id) {
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
        }catch (Exception e){
            e.printStackTrace();
            log.error("publish product event error: {}", productEvent);
        }
    }
}
