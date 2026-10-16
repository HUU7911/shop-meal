package com.meal.identity.mapper;

import com.meal.identity.dto.request.RoleRequest;
import com.meal.identity.dto.request.RoleUpdateRequest;
import com.meal.identity.dto.response.RoleResponse;
import com.meal.identity.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);

    @Mapping(target = "permissions", ignore = true)
    void updateRole(@MappingTarget Role role, RoleUpdateRequest request);
}
