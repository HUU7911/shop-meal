package com.meal.file.controller;

import com.meal.file.dto.ApiResponse;
import com.meal.file.dto.response.FileResponse;
import com.meal.file.service.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileController {
    FileService fileService;

    @PostMapping("/upload")
    ApiResponse<FileResponse> uploadMedia(@RequestParam("file") MultipartFile file) throws Exception {
        return ApiResponse.<FileResponse>builder()
                .results(fileService.uploadFile(file))
                .build();
    }

    @GetMapping("/download/{fileId}")
    ResponseEntity<StreamingResponseBody> downloadMedia(@PathVariable String fileId) throws Exception {
        var fileData = fileService.download(fileId);
        StreamingResponseBody body = outputStream -> {
            try (var inputStream = fileData.resource()) {
                inputStream.transferTo(outputStream);
            }
        };
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileData.contentType()))
                .body(body);
    }
}
