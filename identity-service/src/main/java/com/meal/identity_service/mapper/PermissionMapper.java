package com.meal.identity_service.mapper;

import com.meal.identity_service.dto.request.PermissionRequest;
import com.meal.identity_service.dto.response.PermissionResponse;
import com.meal.identity_service.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);
    PermissionResponse toPermissionResponse(Permission permission);
}
