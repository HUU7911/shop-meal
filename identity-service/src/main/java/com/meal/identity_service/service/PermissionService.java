package com.meal.identity_service.service;

import com.meal.identity_service.dto.request.PermissionRequest;
import com.meal.identity_service.dto.response.PermissionResponse;
import com.meal.identity_service.entity.Permission;
import com.meal.identity_service.mapper.PermissionMapper;
import com.meal.identity_service.repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionService {

    PermissionMapper permissionMapper;
    PermissionRepository permissionRepository;

    public PermissionResponse create(PermissionRequest request) {
        Permission permission = permissionMapper.toPermission(request);

        return permissionMapper.toPermissionResponse(permissionRepository.save(permission));
    }

    public List<PermissionResponse> getAll() {
        return permissionRepository
                .findAll().stream()
                .map(permissionMapper::toPermissionResponse)
                .toList();
    }

    public void deleteById(String id) {
        permissionRepository.deleteById(id);
    }
}
