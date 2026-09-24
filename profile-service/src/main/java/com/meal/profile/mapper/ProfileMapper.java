package com.meal.profile.mapper;

import com.meal.profile.dto.request.ProfileCreationRequest;
import com.meal.profile.dto.request.ProfileUpdateRequest;
import com.meal.profile.dto.response.ProfileResponse;
import com.meal.profile.entity.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    Profile toProfile(ProfileCreationRequest request);
    ProfileResponse toProfileResponse(Profile profile);
    void updateProfile(@MappingTarget Profile profile, ProfileUpdateRequest request);
}
