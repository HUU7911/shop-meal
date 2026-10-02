package com.meal.cart.repository.httpclient;

import com.meal.cart.configuration.AuthenticationRequestInterceptor;
import com.meal.cart.dto.ApiResponse;
import com.meal.cart.dto.response.FoodSnapshotResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "product-service", url = "${app.url}",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface ProductItemClient {
    @GetMapping(value = "/product/food/snapshot/{Id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<FoodSnapshotResponse> getFoodById(@PathVariable String Id);
}
