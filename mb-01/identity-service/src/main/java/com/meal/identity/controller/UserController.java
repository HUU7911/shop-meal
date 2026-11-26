package com.meal.identity.controller;

import com.meal.contract.common.ApiResponse;
import com.meal.contract.common.PageResponse;
import com.meal.identity.dto.request.UserCreationRequest;
import com.meal.identity.dto.request.UserUpdateRequest;
import com.meal.identity.dto.response.UserResponse;
import com.meal.identity.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @PostMapping("/create")
    ApiResponse<UserResponse> createUser(@RequestBody UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .results(userService.createUser(request))
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<UserResponse> getUser(@PathVariable String id) {
        return ApiResponse.<UserResponse>builder()
                .results(userService.getUserById(id))
                .build();
    }

    @PutMapping("/update/{userId}")
    ApiResponse<UserResponse> updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .results(userService.updateUser(userId, request))
                .build();
    }

    @PutMapping("/update/myself")
    ApiResponse<UserResponse> updateMySelf(@RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .results(userService.updateMySelf(request))
                .build();
    }

    @GetMapping
    ApiResponse<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(value = "page", required = false, defaultValue = "10") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        return ApiResponse.<PageResponse<UserResponse>>builder()
                .results(userService.getAllUsers(page, size))
                .build();
    }

    @GetMapping("/myInfor")
    ApiResponse<UserResponse> getMyInfor() {
        return ApiResponse.<UserResponse>builder()
                .results(userService.getMyInfor())
                .build();
    }

    @DeleteMapping("/delete/{id}")
    ApiResponse<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder()
                .message("user has been deleted")
                .build();
    }
}
