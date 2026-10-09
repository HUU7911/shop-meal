package com.meal.product.repository.httpclient;

import com.meal.product.configuration.AuthenticationRequestInterceptor;
import com.meal.product.dto.ApiResponse;
import com.meal.product.dto.response.FileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(name = "file-service",
        url = "${app.config.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface FileClient {
    @PostMapping(value = "/file/media/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<FileResponse> upload(@RequestParam("file") MultipartFile file);
}
