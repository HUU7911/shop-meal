package com.meal.profile.service;

import com.meal.profile.dto.request.ProfileCreationRequest;
import com.meal.profile.dto.request.ProfileUpdateRequest;
import com.meal.profile.dto.response.ProfileResponse;
import com.meal.profile.entity.Profile;
import com.meal.profile.exception.AppException;
import com.meal.profile.exception.ErrorCode;
import com.meal.profile.mapper.ProfileMapper;
import com.meal.profile.repository.ProfileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileService {

    ProfileMapper profileMapper;
    ProfileRepository profileRepository;

    public ProfileResponse createProfile(ProfileCreationRequest request) {
        Profile profile = profileMapper.toProfile(request);

        return profileMapper.toProfileResponse(profileRepository.save(profile));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<ProfileResponse> getAllProfile() {
        return profileRepository.findAll().stream()
                .map(profileMapper::toProfileResponse).toList();
    }

    public ProfileResponse getMyProfile() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        Profile profile = profileRepository.findByUserId(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND)
        );

        return profileMapper.toProfileResponse(profile);
    }

    public ProfileResponse updateProfile(ProfileUpdateRequest request) {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();

        var profile = profileRepository.findByUserId(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND)
        );

        profileMapper.updateProfile(profile, request);

        return profileMapper.toProfileResponse(profileRepository.save(profile));
    }

    public void deleteProfile() {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        profileRepository.deleteByUserId(userId);
    }
}
