package com.meal.post.repository.httpclient;

import com.meal.post.dto.ApiResponse;
import com.meal.post.dto.response.FileResponse;
import com.meal.post.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@FeignClient(
        name = "file-service",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface FileClient {
    @PostMapping(value = "/file/media/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<FileResponse> uploadMedia(@RequestPart("file") MultipartFile file) throws IOException;
}
