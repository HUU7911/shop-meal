package com.meal.payment.properties;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "payos")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PayOSProperties {

    String clientId;
    String apiKey;
    String checksumKey;
    String returnUrl;
    String cancelUrl;
}