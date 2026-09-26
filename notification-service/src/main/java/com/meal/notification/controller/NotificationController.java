package com.meal.notification.controller;

import com.meal.even.dto.NotificationEvent;
import com.meal.notification.dto.request.Recipient;
import com.meal.notification.dto.request.SendEmailRequest;
import com.meal.notification.service.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    EmailService emailService;

    @KafkaListener(topics = "create-user")
    public void listenCreateUsers(NotificationEvent event) {
        log.info("receive notification event:{}", event);
        emailService.sendEmail(
          SendEmailRequest.builder()
                  .to(List.of(Recipient.builder()
                                  .email(event.getRecipient())
                          .build()))
                  .subject(event.getSubject())
                  .htmlContent(event.getBody())
                  .build()
        );
    }
}
