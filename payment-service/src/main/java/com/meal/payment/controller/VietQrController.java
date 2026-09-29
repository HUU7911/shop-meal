package com.meal.payment.controller;

import com.meal.payment.dto.ApiResponse;
import com.meal.payment.service.VietQrService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/qrcode")
@RequiredArgsConstructor
public class VietQrController {

    private final VietQrService vietQrService;

    @GetMapping
    public ApiResponse<String> createPaymentQr(
            @RequestParam long amount,
            @RequestParam(required = false, defaultValue = "Thanh toan don hang") String description
    ) {
        String base64Qr = vietQrService.generatePaymentQr(amount, description);
        return ApiResponse.<String>builder()
                .results(base64Qr)
                .build();
    }
}