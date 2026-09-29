package com.meal.identity.service;

import com.meal.identity.dto.request.RoleRequest;
import com.meal.identity.dto.response.RoleResponse;
import com.meal.identity.mapper.RoleMapper;
import com.meal.identity.repository.PermissionRepository;
import com.meal.identity.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {

    RoleMapper roleMapper;
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;

    public RoleResponse create(RoleRequest request) {
        var role = roleMapper.toRole(request);

        var permissions = permissionRepository.findAllById(request.getPermissions());
        role.setPermissions(new HashSet<>(permissions));

        role = roleRepository.save(role);
        return roleMapper.toRoleResponse(role);
    }

    public List<RoleResponse> getAll() {
        return roleRepository
                .findAll().stream()
                .map(roleMapper::toRoleResponse)
                .toList();
    }

    public void deleteById(String name) {
        roleRepository.deleteById(name);
    }
}
