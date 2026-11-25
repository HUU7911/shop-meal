package com.meal.post.repository.httpclient;

import com.meal.post.configuration.AuthenticationRequestInterceptor;
import com.meal.post.dto.ApiResponse;
import com.meal.post.dto.response.ProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "profile-service",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface ProfileClient {
    @GetMapping(value = "/profile/users/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ProfileResponse> getProfile(@PathVariable String id);
}
