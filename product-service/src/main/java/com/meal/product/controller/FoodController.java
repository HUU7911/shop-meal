package com.meal.product.controller;

import com.meal.product.dto.ApiResponse;
import com.meal.product.dto.request.FoodRequest;
import com.meal.product.dto.response.FoodResponse;
import com.meal.product.service.FoodService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/food")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FoodController {

    FoodService foodService;

    @PostMapping("/create")
    ApiResponse<FoodResponse> create(@RequestBody FoodRequest foodRequest) {
        return ApiResponse.<FoodResponse>builder()
                .results(foodService.create(foodRequest))
                .build();
    }

    @GetMapping
    ApiResponse<List<FoodResponse>> findAll() {
        return ApiResponse.<List<FoodResponse>>builder()
                .results(foodService.findAll())
                .build();
    }

    @DeleteMapping("{Id}")
    ApiResponse<Void> delete(@PathVariable String id) {
        foodService.deleteById(id);
        return ApiResponse.<Void>builder()
                .message("delete success")
                .build();
    }
}
