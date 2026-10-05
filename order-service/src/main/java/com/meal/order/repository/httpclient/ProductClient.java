package com.meal.order.repository.httpclient;

import com.meal.order.configuration.AuthenticationRequestInterceptor;
import com.meal.order.dto.ApiResponse;
import com.meal.order.dto.client.FoodSnapshotResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "product-service",
        url = "${app.services.product-url}",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface ProductClient {

    @GetMapping(value = "/product/food/snapshot/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<FoodSnapshotResponse> getFoodSnapshot(@PathVariable("id") String id);
}
