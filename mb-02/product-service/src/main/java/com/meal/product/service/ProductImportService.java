package com.meal.product.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meal.even.dto.ProductEvent;
import com.meal.product.dto.request.CategoryRequest;
import com.meal.product.dto.request.FoodRequest;
import com.meal.product.entity.Category;
import com.meal.product.entity.Food;
import com.meal.product.exception.AppException;
import com.meal.product.exception.ErrorCode;
import com.meal.product.repository.CategoryRepository;
import com.meal.product.repository.FoodRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductImportService {

    FoodRepository foodRepository;
    CategoryRepository categoryRepository;
    ObjectMapper objectMapper;
    KafkaTemplate<String, ProductEvent> kafkaTemplate;

    @NonFinal
    private static final Path PRODUCT_DATA_PATH = Path.of("../../data-source/product/products.json");

    @NonFinal
    private static final Path CATEGORY_DATA_PATH = Path.of("../../data-source/product/products.json");

    @Transactional
    public void importCategories() {
        try (InputStream inputStream = Files.newInputStream(CATEGORY_DATA_PATH)) {
            List<CategoryRequest> categories = objectMapper.readValue(inputStream, new TypeReference<>() {
            });
            List<Category> newCategories = categories.stream()
                    .filter(dto -> !categoryRepository.existsById(dto.name()))
                    .map(dto -> Category.builder().name(dto.name()).description(dto.description()).build())
                    .toList();

            categoryRepository.saveAll(newCategories);
            log.info("Imported {} categories", newCategories.size());
        } catch (Exception e) {
            log.error("Error importing categories", e);
            throw new RuntimeException("Lỗi khi import Category từ JSON", e);
        }
    }

    @Transactional
    public void importFoods() {
        try (InputStream inputStream = Files.newInputStream(PRODUCT_DATA_PATH)) {
            List<FoodRequest> foodDtos = objectMapper.readValue(inputStream, new TypeReference<>() {
            });
            List<Food> foods = foodDtos.stream().map(dto -> {
                Set<Category> categories = dto.categories().stream()
                        .map(name -> categoryRepository.findById(name).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)))
                        .collect(Collectors.toSet());

                return Food.builder()
                        .name(dto.name())
                        .position(dto.position())
                        .timeWork(dto.timeWork())
                        .description(dto.description())
                        .size(dto.size())
                        .price(dto.price())
                        .images(dto.images())
                        .type(dto.type())
                        .createdDate(Objects.nonNull(dto.createdDate()) ? dto.createdDate() : Instant.now())
                        .categories(categories)
                        .build();
            }).toList();

            List<Food> savedFoods = foodRepository.saveAll(foods);

            for (Food food : savedFoods) {
                ProductEvent event = ProductEvent.builder()
                        .eventType("CREATED")
                        .id(food.getId())
                        .name(food.getName())
                        .size(food.getSize())
                        .price(food.getPrice())
                        .type(food.getType())
                        .timeWork(food.getTimeWork())
                        .description(food.getDescription())
                        .images(food.getImages())
                        .position(food.getPosition())
                        .categories(food.getCategories())
                        .build();

                try {
                    kafkaTemplate.send("product-event", food.getId(), event)
                            .whenComplete((result, exception) -> {
                                if (exception != null) {
                                    log.error("Kafka publish failed for food: {}", food.getId(), exception);
                                } else {
                                    log.info("Published product event: {}", food.getId());
                                }
                            });
                } catch (Exception e) {
                    log.error("Kafka publish failed: {}", food.getId(), e);
                    throw new AppException(ErrorCode.KAFKA_NO_AVAILABLE);
                }
            }

            log.info("Imported {} products", savedFoods.size());
        } catch (Exception e) {
            log.error("Error importing foods", e);
            throw new RuntimeException("Lỗi khi import dữ liệu Food từ JSON", e);
        }
    }
}
