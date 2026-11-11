package com.meal.file.repository;

import com.meal.file.dto.FileInfo;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class FileRepository {
    private final MinioClient minioClient;

    @Value("${minio.config.bucket}")
    private String bucket;

    @Value("${app.file.download-prefix}")
    private String urlPrefix;

    public FileInfo store(MultipartFile file) throws Exception {
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + (extension == null ? "" : "." + extension);
        String objectKey = "products/" + fileName;
        String contentType = file.getContentType();
        String md5Checksum;

        try (InputStream stream = file.getInputStream()) {
            md5Checksum = DigestUtils.md5DigestAsHex(stream);
        }

        try (InputStream stream = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .stream(stream, file.getSize(), -1)
                    .contentType(contentType)
                    .build()
            );
        }

        return FileInfo.builder()
                .name(fileName)
                .size(file.getSize())
                .contentType(contentType)
                .md5Checksum(md5Checksum)
                .path(objectKey)
                .url(urlPrefix + fileName)
                .build();
    }

    public InputStream read(String objectKey) throws Exception {
        return minioClient.getObject(GetObjectArgs.builder()
                .bucket(bucket)
                .object(objectKey)
                .build()
        );
    }
}