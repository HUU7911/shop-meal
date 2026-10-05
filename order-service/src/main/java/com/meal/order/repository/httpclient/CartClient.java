package com.meal.order.repository.httpclient;

import com.meal.order.configuration.AuthenticationRequestInterceptor;
import com.meal.order.dto.ApiResponse;
import com.meal.order.dto.client.CartResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(
        name = "cart-service",
        url = "${app.services.cart-url}",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface CartClient {

    @GetMapping(value = "/cart/my-cart", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<CartResponse> getMyCart();

    @DeleteMapping(value = "/cart/my-cart", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> clearMyCart();
}
