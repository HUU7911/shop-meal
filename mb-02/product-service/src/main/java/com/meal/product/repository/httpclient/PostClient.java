package com.meal.product.repository.httpclient;

import com.meal.product.configuration.AuthenticationRequestInterceptor;
import com.meal.product.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "post-service", configuration = {AuthenticationRequestInterceptor.class})
public interface PostClient {
    @DeleteMapping("/post/delete/product/{productId}")
    ApiResponse<Void> deleteProduct(@PathVariable String productId);
}
