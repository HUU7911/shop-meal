package com.meal.order.repository.httpclient;

import com.meal.contract.common.ApiResponse;
import com.meal.contract.dto.ProfileResponse;
import com.meal.order.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "profile-service",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface ProfileClient {

    @GetMapping(value = "/profile/my-profile", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ProfileResponse> getMyProfile();

    @GetMapping(value = "/profile/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ProfileResponse> getProfileById(@PathVariable("id") String id);
}
