package com.meal.file.configuration;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinIOConfig {

    @Value("${minio.config.endpoint}")
    private String endpoint;

    @Value("${minio.config.accessKey}")
    private String accessKey;

    @Value("${minio.config.secretKey}")
    private String secretKey;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}