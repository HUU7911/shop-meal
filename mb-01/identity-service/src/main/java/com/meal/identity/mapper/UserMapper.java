package com.meal.identity.mapper;

import com.meal.identity.dto.request.UserCreationRequest;
import com.meal.identity.dto.request.UserUpdateRequest;
import com.meal.identity.dto.response.UserResponse;
import com.meal.identity.entity.User;
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
