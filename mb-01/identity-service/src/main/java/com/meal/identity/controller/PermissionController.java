package com.meal.identity.controller;

import com.meal.identity.dto.ApiResponse;
import com.meal.identity.dto.request.PermissionRequest;
import com.meal.identity.dto.response.PermissionResponse;
import com.meal.identity.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionController {

    PermissionService permissionService;

    @PostMapping("/create")
    ApiResponse<PermissionResponse> create(@RequestBody PermissionRequest request){
        return ApiResponse.<PermissionResponse>builder()
                .results(permissionService.create(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<PermissionResponse>> getAll() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .results(permissionService.getAll())
                .build();
    }

    @DeleteMapping("/delete/{Id}")
    ApiResponse<Void> delete(@PathVariable String Id){
        permissionService.deleteById(Id);
        return ApiResponse.<Void>builder()
                .message("permission deleted successfully")
                .build();
    }
}
