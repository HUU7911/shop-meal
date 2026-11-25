package com.meal.search.controller;

import com.meal.search.constants.Type;
import com.meal.search.document.ProductDocument;
import com.meal.search.dto.ApiResponse;
import com.meal.search.dto.PageResponse;
import com.meal.search.service.ProductSearchService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchController {

    ProductSearchService searchService;

    @GetMapping
    public ApiResponse<PageResponse<ProductDocument>> searchProduct(
            @RequestParam(required = false) @Size(max = 100) String keyword,
            @RequestParam(required = false) @Size(max = 100) String category,
            @RequestParam(required = false) Type type,
            @RequestParam(required = false) @PositiveOrZero BigDecimal minPrice,
            @RequestParam(required = false) @PositiveOrZero BigDecimal maxPrice,
            @RequestParam(defaultValue = "RELEVANCE") ProductSearchService.SortOption sort,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int size) {

        return ApiResponse.<PageResponse<ProductDocument>>builder()
                .results(searchService.searchProduct(keyword, category, type, minPrice, maxPrice, sort, page, size))
                .build();
    }
}
