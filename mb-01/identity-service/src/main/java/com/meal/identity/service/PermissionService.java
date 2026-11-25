package com.meal.identity.service;

import com.meal.identity.dto.request.PermissionRequest;
import com.meal.identity.dto.response.PermissionResponse;
import com.meal.identity.entity.Permission;
import com.meal.identity.mapper.PermissionMapper;
import com.meal.identity.repository.PermissionRepository;
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
