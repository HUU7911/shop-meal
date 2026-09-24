package com.meal.profile.controller;

import com.meal.profile.dto.ApiResponse;
import com.meal.profile.dto.request.ProfileCreationRequest;
import com.meal.profile.dto.request.ProfileUpdateRequest;
import com.meal.profile.dto.response.ProfileResponse;
import com.meal.profile.service.ProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileController {

    ProfileService profileService;

    @PostMapping("/create")
    ApiResponse<ProfileResponse> create(@RequestBody ProfileCreationRequest request) {
        return ApiResponse.<ProfileResponse>builder()
                .results(profileService.createProfile(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<ProfileResponse>> getAll() {
        return ApiResponse.<List<ProfileResponse>>builder()
                .results(profileService.getAllProfile())
                .build();
    }

    @GetMapping("/my-profile")
    ApiResponse<ProfileResponse> getMyProfile() {
        return ApiResponse.<ProfileResponse>builder()
                .results(profileService.getMyProfile())
                .build();
    }

    @PutMapping("/update")
    ApiResponse<ProfileResponse> update(@RequestBody ProfileUpdateRequest request) {
        return ApiResponse.<ProfileResponse>builder()
                .results(profileService.updateProfile(request))
                .build();
    }

    @DeleteMapping("/delete")
    ApiResponse<Void> delete() {
        profileService.deleteProfile();

        return ApiResponse.<Void>builder()
                .message("delete profile success")
                .build();
    }
}
