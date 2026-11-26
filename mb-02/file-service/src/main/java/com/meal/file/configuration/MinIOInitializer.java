package com.meal.file.configuration;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MinIOInitializer {

    @Value("${minio.config.bucket}")
    String bucket;

    @Bean
    public ApplicationRunner applicationRunner(MinioClient minioClient) {
        return _ -> {
            try {
                boolean existed = minioClient.bucketExists(BucketExistsArgs.builder()
                        .bucket(bucket)
                        .build());

                if (!existed) {
                    minioClient.makeBucket(MakeBucketArgs.builder()
                            .bucket(bucket)
                            .build());
                    log.info("Bucket created successfully: {}", bucket);
                } else {
                    log.info("Bucket already exists: {}", bucket);
                }
            } catch (Exception e) {
                log.error("Failed to initialize MinIO bucket: {}", bucket, e);
                throw new IllegalStateException("Cannot initialize MinIO bucket: " + bucket, e);
            }
        };
    }
}
