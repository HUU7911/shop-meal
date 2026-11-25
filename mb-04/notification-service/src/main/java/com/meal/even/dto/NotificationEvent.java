package com.meal.even.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEvent {
    String chanel;
    String recipient;
    String templateCode;
    Map<String, Object> parameters;
    String subject;
    String body;
}
