package com.meal.identity_service.controller;

import com.meal.identity_service.dto.ApiResponse;
import com.meal.identity_service.dto.request.UserCreationRequest;
import com.meal.identity_service.dto.response.UserResponse;
import com.meal.identity_service.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalUserController {

    UserService userService;

    @PostMapping("/create")
    ApiResponse<UserResponse> createUser(@RequestBody UserCreationRequest request) throws Exception {
        return ApiResponse.<UserResponse>builder()
                .results(userService.internalCreateUser(request))
                .build();
    }
}
