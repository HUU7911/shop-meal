package com.meal.identity_service.mapper;

import com.meal.identity_service.dto.request.ProfileCreationRequest;
import com.meal.identity_service.dto.request.UserCreationRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request);
}
