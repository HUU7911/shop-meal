package com.meal.post.controller;

import com.meal.post.dto.ApiResponse;
import com.meal.post.dto.response.BannerResponse;
import com.meal.post.service.BannerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/banner")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BannerController {

    BannerService bannerService;

    @PostMapping("/create")
    ApiResponse<BannerResponse> postBanner(@RequestPart("file") MultipartFile file) throws IOException {
        return ApiResponse.<BannerResponse>builder()
                .results(bannerService.postBanner(file))
                .build();
    }

    @DeleteMapping("/delete/{Id}")
    ApiResponse<Void> deleteBanner(@PathVariable("Id") String Id) {
        bannerService.deleteBanner(Id);
        return ApiResponse.<Void>builder()
                .message("delete banner success")
                .build();
    }
}
