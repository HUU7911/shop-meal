package com.meal.notification.controller;

import com.meal.notification.dto.ApiResponse;
import com.meal.notification.dto.request.SendEmailRequest;
import com.meal.notification.dto.response.EmailResponse;
import com.meal.notification.service.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailController {

    EmailService emailService;

    @PostMapping("/send")
    ApiResponse<EmailResponse> sendEmail(@RequestBody SendEmailRequest request) {
        return ApiResponse.<EmailResponse>builder()
                .results(emailService.sendEmail(request))
                .build();
    }
}
