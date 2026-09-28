package com.meal.product.controller;

import com.meal.product.dto.ApiResponse;
import com.meal.product.dto.request.CategoryRequest;
import com.meal.product.dto.response.CategoryResponse;
import com.meal.product.service.CategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {

    CategoryService categoryService;

    @PostMapping("/create")
    public ApiResponse<CategoryResponse> create(@RequestBody CategoryRequest request){
        return ApiResponse.<CategoryResponse>builder()
                .results(categoryService.create(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> list(){
        return ApiResponse.<List<CategoryResponse>>builder()
                .results(categoryService.getAll())
                .build();
    }

    @DeleteMapping("/delete/{name}")
    public ApiResponse<Void> delete(@PathVariable String name){
        categoryService.deleteById(name);
        return ApiResponse.<Void>builder()
                .message("category deleted successfully")
                .build();
    }
}
