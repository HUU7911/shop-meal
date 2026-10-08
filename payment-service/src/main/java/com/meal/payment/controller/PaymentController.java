package com.meal.payment.controller;

import com.meal.payment.dto.ApiResponse;
import com.meal.payment.dto.request.CreatePaymentRequest;
import com.meal.payment.dto.response.PaymentResponse;
import com.meal.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/paid")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {

    PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentResponse> createPayment(@Valid @RequestBody CreatePaymentRequest request) {

        return ApiResponse.<PaymentResponse>builder()
                .results(paymentService.createPayment(request))
                .build();
    }
}