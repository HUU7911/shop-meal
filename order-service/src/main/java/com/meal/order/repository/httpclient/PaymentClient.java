package com.meal.order.repository.httpclient;

import com.meal.order.configuration.AuthenticationRequestInterceptor;
import com.meal.order.dto.ApiResponse;
import com.meal.order.dto.client.CreatePaymentRequest;
import com.meal.order.dto.client.PaymentResponse;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "payment-service",
        url = "${app.services.payment-url}",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface PaymentClient {
    @GetMapping(value = "/payment/paid", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<PaymentResponse> createPayment(@RequestBody @Valid CreatePaymentRequest request);
}
