package com.meal.identity.controller;

import com.meal.identity.dto.ApiResponse;
import com.meal.identity.dto.request.UserCreationRequest;
import com.meal.identity.dto.request.UserUpdateRequest;
import com.meal.identity.dto.response.UserResponse;
import com.meal.identity.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .results(userService.getAllUsers())
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
