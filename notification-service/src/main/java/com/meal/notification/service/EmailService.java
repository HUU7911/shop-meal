package com.meal.notification.service;

import com.meal.notification.dto.request.EmailRequest;
import com.meal.notification.dto.request.SendEmailRequest;
import com.meal.notification.dto.request.Sender;
import com.meal.notification.dto.response.EmailResponse;
import com.meal.notification.exception.AppException;
import com.meal.notification.exception.ErrorCode;
import com.meal.notification.repository.EmailClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {

    EmailClient emailClient;

    @NonFinal
    @Value("${brev.apiKey}")
    String API_KEY;

    public EmailResponse sendEmail(SendEmailRequest request) {

        EmailRequest emailRequest = EmailRequest.builder()
                .sender(Sender.builder()
                        .name("HUU_MOD")
                        .email("on2318800@gmail.com")
                        .build())
                .to(request.getTo())
                .subject(request.getSubject())
                .htmlContent(request.getHtmlContent())
                .build();
        try {
            return emailClient.sendEmail(API_KEY, emailRequest);
        }catch (FeignException e) {
            throw new AppException(ErrorCode.EMAIL_NOT_SEND);
        }
    }
}
