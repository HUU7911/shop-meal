package com.meal.post.service;

import com.meal.post.dto.response.BannerResponse;
import com.meal.post.entity.Banner;
import com.meal.post.repository.BannerRepository;
import com.meal.post.repository.httpclient.FileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BannerService {

    FileClient fileClient;
    BannerRepository bannerRepository;

    public BannerResponse postBanner(MultipartFile file) throws IOException {

        var bannerUrl = fileClient.uploadMedia(file);

        Banner banner = Banner.builder()
                .url(bannerUrl.getResults().getUrl())
                .build();

        banner = bannerRepository.save(banner);

        return BannerResponse.builder()
                .id(banner.getId())
                .url(banner.getUrl())
                .build();
    }

    @Cacheable(cacheNames = "banner")
    public List<BannerResponse> getAll() {
        return bannerRepository.findAll()
                .stream().map(banner -> {
                    var response = BannerResponse.builder()
                            .id(banner.getId())
                            .url(banner.getUrl())
                            .build();
                    return response;
                }).collect(Collectors.toCollection(ArrayList::new));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteBanner(String id) {
        bannerRepository.deleteById(id);
    }
}
