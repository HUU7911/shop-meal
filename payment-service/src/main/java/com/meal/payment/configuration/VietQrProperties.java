package com.meal.payment.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "vietqr")
@Data
public class VietQrProperties {
    private String bankBin;
    private String accountNumber;
    private String accountName;
    private String apiUrl;
}