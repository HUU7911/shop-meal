package com.meal.product.controller;

import com.meal.product.dto.ApiResponse;
import com.meal.product.dto.PageResponse;
import com.meal.product.dto.request.FoodRequest;
import com.meal.product.dto.response.FoodResponse;
import com.meal.product.dto.response.FoodSnapshotResponse;
import com.meal.product.service.FoodService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/food")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FoodController {

    FoodService foodService;

    @PostMapping("/create")
    ApiResponse<FoodResponse> create(@RequestBody FoodRequest foodRequest) {
        return ApiResponse.<FoodResponse>builder()
                .results(foodService.createFood(foodRequest))
                .build();
    }

    @GetMapping
    ApiResponse<PageResponse<FoodResponse>> findAll(
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "5") int size
    ) {
        return ApiResponse.<PageResponse<FoodResponse>>builder()
                .results(foodService.findAllFood(page, size))
                .build();
    }

    @DeleteMapping("/delete/{Id}")
    ApiResponse<Void> delete(@PathVariable("Id") String Id) {
        foodService.deleteFoodById(Id);
        return ApiResponse.<Void>builder()
                .message("Product deleted successfully")
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<FoodResponse> findById(@PathVariable String id) {
        return ApiResponse.<FoodResponse>builder()
                .results(foodService.getFoodById(id))
                .build();
    }

    @GetMapping("/snapshot/{Id}")
    ApiResponse<FoodSnapshotResponse> getFoodSnapshotById(@PathVariable String Id) {
        return ApiResponse.<FoodSnapshotResponse>builder()
                .results(foodService.getFoodSnapshotById(Id))
                .build();
    }
}
