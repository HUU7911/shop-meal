package com.meal.search.controller;

import com.meal.search.document.ProductDocument;
import com.meal.search.dto.ApiResponse;
import com.meal.search.service.ProductSearchService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchController {

    ProductSearchService searchService;

    @PostMapping
    public ApiResponse<List<ProductDocument>> searchProduct(
            @RequestParam("keyWord") String keyWord,
            @RequestParam(required = false) String id) {

        return ApiResponse.<List<ProductDocument>>builder()
                .results(searchService.searchProduct(keyWord, id))
                .build();
    }
}
