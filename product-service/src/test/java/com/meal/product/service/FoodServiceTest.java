package com.meal.product.service;

import com.meal.event.dto.ProductEvent;
import com.meal.product.dto.request.FoodRequest;
import com.meal.product.dto.response.FoodResponse;
import com.meal.product.entity.Category;
import com.meal.product.entity.Food;
import com.meal.product.exception.AppException;
import com.meal.product.mapper.FoodMapper;
import com.meal.product.repository.CategoriesRepository;
import com.meal.product.repository.FoodRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FoodServiceTest {

    @Mock
    private FoodRepository foodRepository;

    @Mock
    private FoodMapper foodMapper;

    @Mock
    private CategoriesRepository categoriesRepository;

    @Mock
    private KafkaTemplate<String, ProductEvent> kafkaTemplate;

    @InjectMocks
    private FoodService foodService;

    private FoodRequest request;
    private Food food;
    private FoodResponse foodResponse;
    private Category category;

    @BeforeEach
    void setUp() {

        category = new Category();
        category.setName("Pizza");

        request = FoodRequest.builder()
                .id("food-001")
                .name("Pizza Hải Sản")
                .position("MAIN")
                .timeWork("20 minutes")
                .description("Pizza hải sản")
                .price(new BigDecimal("150000"))
                .images(List.of("pizza.jpg"))
                .type(null)
                .categories(Set.of("Pizza"))
                .build();

        food = new Food();
        food.setId("food-001");
        food.setName("Pizza Hải Sản");
        food.setPrice(new BigDecimal("150000"));
        food.setCategories(Set.of(category));

        foodResponse = FoodResponse.builder()
                .id("food-001")
                .name("Pizza Hải Sản")
                .price(new BigDecimal("150000"))
                .build();
    }

    @Test
    void create_shouldCreateFoodSuccessfully() {

        // Arrange
        when(foodRepository.existsByName(request.getName()))
                .thenReturn(false);

        when(foodMapper.toFood(request))
                .thenReturn(food);

        when(categoriesRepository.findAllById(request.getCategories()))
                .thenReturn(List.of(category));

        when(foodRepository.save(food))
                .thenReturn(food);

        when(foodMapper.toFoodResponse(food))
                .thenReturn(foodResponse);

        // Act
        FoodResponse result = foodService.create(request);

        // Assert
        assertNotNull(result);
        assertEquals("food-001", result.getId());
        assertEquals("Pizza Hải Sản", result.getName());
        assertEquals(new BigDecimal("150000"), result.getPrice());

        verify(foodRepository).existsByName(request.getName());
        verify(foodMapper).toFood(request);
        verify(categoriesRepository).findAllById(request.getCategories());
        verify(foodRepository).save(food);
        verify(foodMapper).toFoodResponse(food);

        verify(kafkaTemplate).send(
                eq("product-event"),
                any(ProductEvent.class)
        );
    }

    @Test
    void create_shouldThrowException_whenFoodAlreadyExists() {

        // Arrange
        when(foodRepository.existsByName(request.getName()))
                .thenReturn(true);

        // Act & Assert
        assertThrows(
                AppException.class,
                () -> foodService.create(request)
        );

        verify(foodRepository).existsByName(request.getName());

        verify(foodMapper, never()).toFood(any());
        verify(categoriesRepository, never()).findAllById(any());
        verify(foodRepository, never()).save(any());
        verify(kafkaTemplate, never()).send(anyString(), any());
    }

    @Test
    void create_shouldSetCategoriesBeforeSave() {

        // Arrange
        when(foodRepository.existsByName(request.getName()))
                .thenReturn(false);

        when(foodMapper.toFood(request))
                .thenReturn(food);

        when(categoriesRepository.findAllById(request.getCategories()))
                .thenReturn(List.of(category));

        when(foodRepository.save(any(Food.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(foodMapper.toFoodResponse(any(Food.class)))
                .thenReturn(foodResponse);

        // Act
        foodService.create(request);

        // Assert
        ArgumentCaptor<Food> foodCaptor =
                ArgumentCaptor.forClass(Food.class);

        verify(foodRepository).save(foodCaptor.capture());

        Food savedFood = foodCaptor.getValue();

        assertNotNull(savedFood.getCategories());
        assertEquals(1, savedFood.getCategories().size());
        assertTrue(savedFood.getCategories().contains(category));
    }

    @Test
    void create_shouldPublishCorrectProductEvent() {

        // Arrange
        when(foodRepository.existsByName(request.getName()))
                .thenReturn(false);

        when(foodMapper.toFood(request))
                .thenReturn(food);

        when(categoriesRepository.findAllById(request.getCategories()))
                .thenReturn(List.of(category));

        when(foodRepository.save(food))
                .thenReturn(food);

        when(foodMapper.toFoodResponse(food))
                .thenReturn(foodResponse);

        ArgumentCaptor<ProductEvent> eventCaptor =
                ArgumentCaptor.forClass(ProductEvent.class);

        // Act
        foodService.create(request);

        // Assert
        verify(kafkaTemplate).send(
                eq("product-event"),
                eventCaptor.capture()
        );

        ProductEvent event = eventCaptor.getValue();

        assertEquals("CREATED", event.getEventType());
        assertEquals("food-001", event.getId());
        assertEquals("Pizza Hải Sản", event.getName());
        assertEquals(new BigDecimal("150000"), event.getPrice());
        assertEquals(food.getType(), event.getType());
        assertEquals(food.getImages(), event.getImages());
    }

    @Test
    void findAll_shouldReturnAllFoods() {

        // Arrange
        Food food2 = new Food();
        food2.setId("food-002");
        food2.setName("Coca Cola");
        food2.setPrice(new BigDecimal("20000"));

        FoodResponse response2 = FoodResponse.builder()
                .id("food-002")
                .name("Coca Cola")
                .price(new BigDecimal("20000"))
                .build();

        when(foodRepository.findAll())
                .thenReturn(List.of(food, food2));

        when(foodMapper.toFoodResponse(food))
                .thenReturn(foodResponse);

        when(foodMapper.toFoodResponse(food2))
                .thenReturn(response2);

        // Act
        List<FoodResponse> result = foodService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());

        assertEquals("food-001", result.get(0).getId());
        assertEquals("food-002", result.get(1).getId());

        verify(foodRepository).findAll();
        verify(foodMapper).toFoodResponse(food);
        verify(foodMapper).toFoodResponse(food2);
    }

    @Test
    void findAll_shouldReturnEmptyList_whenNoFood() {

        // Arrange
        when(foodRepository.findAll())
                .thenReturn(List.of());

        // Act
        List<FoodResponse> result = foodService.findAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(foodRepository).findAll();

        verify(foodMapper, never())
                .toFoodResponse(any());
    }

    @Test
    void deleteById_shouldDeleteFoodAndPublishEvent() {

        // Arrange
        String foodId = "food-001";

        // Act
        foodService.deleteById(foodId);

        // Assert
        verify(foodRepository).deleteById(foodId);

        ArgumentCaptor<ProductEvent> eventCaptor =
                ArgumentCaptor.forClass(ProductEvent.class);

        verify(kafkaTemplate).send(
                eq("product-event"),
                eventCaptor.capture()
        );

        ProductEvent event = eventCaptor.getValue();

        assertEquals("DELETED", event.getEventType());
        assertEquals(foodId, event.getId());
    }

    @Test
    void deleteById_shouldStillDelete_whenKafkaSendFails() {

        // Arrange
        String foodId = "food-001";

        doThrow(new RuntimeException("Kafka unavailable"))
                .when(kafkaTemplate)
                .send(eq("product-event"), any(ProductEvent.class));

        // Act & Assert
        assertDoesNotThrow(
                () -> foodService.deleteById(foodId)
        );

        verify(foodRepository).deleteById(foodId);

        verify(kafkaTemplate).send(
                eq("product-event"),
                any(ProductEvent.class)
        );
    }
}