package com.meal.file.repository;

import com.meal.file.dto.FileInfor;
import com.meal.file.entity.FileMgmt;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Repository;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;
import java.util.UUID;

@Repository
public class FileRepository {

    private final MinioClient minioClient;

    @Value("${minio.config.bucket}")
    private String bucket;

    @Value("${app.download}")
    private String download;

    public FileRepository(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    public FileInfor store(MultipartFile file) throws IOException {

        String extension = StringUtils.getFilenameExtension(
                file.getOriginalFilename()
        );

        String fileName = Objects.isNull(extension)
                ? UUID.randomUUID().toString()
                : UUID.randomUUID() + "." + extension;

        String objectName = "products/" + fileName;

        // Calculate MD5 checksum
        String md5;
        try (InputStream inputStream = file.getInputStream()) {
            md5 = DigestUtils.md5DigestAsHex(inputStream);
        }

        // Upload image to MinIO
        try (InputStream inputStream = file.getInputStream()) {

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .stream(
                                    inputStream,
                                    file.getSize(),
                                    -1
                            )
                            .contentType(file.getContentType())
                            .build()
            );

        } catch (Exception e) {
            throw new IOException("Failed to upload file to MinIO", e);
        }

        return FileInfor.builder()
                .name(fileName)
                .size(file.getSize())
                .contentType(file.getContentType())
                .md5Checksum(md5)
                .path(objectName)
                .url(download + fileName)
                .build();
    }

    public Resource read(FileMgmt fileMgmt) throws IOException {

        try (InputStream inputStream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucket)
                        .object(fileMgmt.getPath())
                        .build()
        )) {

            byte[] data = inputStream.readAllBytes();

            return new ByteArrayResource(data);

        } catch (Exception e) {
            throw new IOException("Failed to download file from MinIO", e);
        }
    }

    public void delete(FileMgmt fileMgmt) throws IOException {

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(fileMgmt.getPath())
                            .build()
            );
        } catch (Exception e) {
            throw new IOException("Failed to delete file from MinIO", e);
        }
    }
}
