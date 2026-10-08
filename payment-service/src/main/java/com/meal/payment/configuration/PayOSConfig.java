package com.meal.payment.configuration;

import com.meal.payment.properties.PayOSProperties;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@EnableConfigurationProperties(PayOSProperties.class)
public class PayOSConfig {

    PayOSProperties properties;

    @Bean
    public PayOS payOS() {
        return new PayOS(
                properties.getClientId(),
                properties.getApiKey(),
                properties.getChecksumKey()
        );
    }
}