package com.meal.identity.mapper;

import com.meal.identity.dto.request.RoleRequest;
import com.meal.identity.dto.response.RoleResponse;
import com.meal.identity.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
