package com.meal.file.repository;

import com.meal.file.dto.FileInfo;
import com.meal.file.service.ImageConverter;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class FileRepository {
    private final MinioClient minioClient;

    @Value("${minio.config.bucket}")
    private String bucket;

    @Value("${app.file.download-prefix}")
    private String urlPrefix;

    @NonFinal
    private static final Set<String> SUPPORTED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/bmp"
    );

    @Autowired
    private final ImageConverter imageConverter;

    public FileInfo store(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        boolean isImage = isImage(file);

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + (isImage ? ".webp" : extension == null ? "" : "." + extension);
        String objectKey = "products/" + fileName;

        String contentType;
        byte[] fileBytes;

        if (isImage) {
            try (InputStream input = file.getInputStream()) {
                fileBytes = imageConverter.convertToWebP(input);
            }
            contentType = "image/webp";
        } else {
            fileBytes = file.getBytes();
            contentType = file.getContentType() != null
                    ? file.getContentType()
                    : "application/octet-stream";
        }

        String md5Checksum = DigestUtils.md5DigestAsHex(fileBytes);

        try (InputStream input = new ByteArrayInputStream(fileBytes)) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .stream(input, (long) fileBytes.length, (long)-1)
                    .contentType(contentType)
                    .build());
        }

        return FileInfo.builder()
                .name(fileName)
                .size(fileBytes.length)
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

    private boolean isImage(MultipartFile file) throws IOException {
        try (InputStream input = file.getInputStream()) {
            String mimeType = new Tika().detect(input);
            return SUPPORTED_IMAGE_TYPES.contains(mimeType);
        }
    }
}