package com.meal.identity.mapper;

import com.meal.identity.dto.request.PermissionRequest;
import com.meal.identity.dto.response.PermissionResponse;
import com.meal.identity.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);
    PermissionResponse toPermissionResponse(Permission permission);
}
