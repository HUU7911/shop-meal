package com.meal.identity_service.mapper;

import com.meal.identity_service.dto.request.UserCreationRequest;
import com.meal.identity_service.dto.request.UserUpdateRequest;
import com.meal.identity_service.dto.response.UserResponse;
import com.meal.identity_service.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", ignore = true)
    User toUser(UserCreationRequest request);

    @Mapping(target = "roles")
    UserResponse toResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(UserUpdateRequest request, @MappingTarget User user);
}
