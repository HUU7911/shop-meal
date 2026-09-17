package com.meal.identity_service.controller;

import com.meal.identity_service.dto.ApiResponse;
import com.meal.identity_service.dto.request.RoleRequest;
import com.meal.identity_service.dto.response.RoleResponse;
import com.meal.identity_service.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {

    RoleService roleService;

    @PostMapping("/create")
    ApiResponse<RoleResponse> create(@RequestBody RoleRequest request) throws  Exception {
        return ApiResponse.<RoleResponse>builder()
                .results(roleService.create(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.<List<RoleResponse>>builder()
                .results(roleService.getAll())
                .build();
    }

    @DeleteMapping("/delete/{name}")
    ApiResponse<Void> delete(@PathVariable String name) throws  Exception {
        roleService.deleteById(name);
        return ApiResponse.<Void>builder()
                .message("role deleted successfully")
                .build();
    }
}
