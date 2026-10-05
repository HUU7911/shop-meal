package com.meal.order.repository.httpclient;

import com.meal.order.configuration.AuthenticationRequestInterceptor;
import com.meal.order.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "payment-service",
        url = "${app.services.payment-url}",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface PaymentClient {
    @GetMapping(value = "/payment/qrcode", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<String> createQr(
            @RequestParam long amount, @RequestParam(required = false, defaultValue = "Thanh toan don hang") String description);
}
