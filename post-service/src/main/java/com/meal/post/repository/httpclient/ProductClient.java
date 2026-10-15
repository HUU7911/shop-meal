package com.meal.post.repository.httpclient;

import com.meal.post.dto.ApiResponse;
import com.meal.post.dto.response.FoodInfoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", url = "http://localhost:8084")
public interface ProductClient {
    @GetMapping(value = "/product/food/info/{Id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<FoodInfoResponse> getFoodInfo(@PathVariable("Id") String Id);
}
