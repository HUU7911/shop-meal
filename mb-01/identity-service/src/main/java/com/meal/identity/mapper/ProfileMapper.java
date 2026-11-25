package com.meal.identity.mapper;

import com.meal.identity.dto.request.ProfileCreationRequest;
import com.meal.identity.dto.request.UserCreationRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request);
}
