package com.meal.identity.controller;

import com.meal.identity.dto.ApiResponse;
import com.meal.identity.dto.request.UserCreationRequest;
import com.meal.identity.dto.response.UserResponse;
import com.meal.identity.service.UserService;
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
