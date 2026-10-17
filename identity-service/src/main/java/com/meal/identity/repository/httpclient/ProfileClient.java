package com.meal.identity.repository.httpclient;

import com.meal.identity.configuration.AuthenticationRequestInterceptor;
import com.meal.identity.dto.ApiResponse;
import com.meal.identity.dto.request.ProfileCreationRequest;
import com.meal.identity.dto.response.ProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "profile-service",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface ProfileClient {
    @PostMapping(value = "/profile/create", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ProfileResponse> create(@RequestBody ProfileCreationRequest request);

    @DeleteMapping(value = "/profile/delete/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> delete(@PathVariable String userId);
}
