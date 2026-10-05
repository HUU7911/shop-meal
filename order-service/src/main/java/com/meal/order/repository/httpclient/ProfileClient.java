package com.meal.order.repository.httpclient;

import com.meal.order.configuration.AuthenticationRequestInterceptor;
import com.meal.order.dto.ApiResponse;
import com.meal.order.dto.client.ProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(
        name = "profile-service",
        url = "${app.services.profile-url}",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface ProfileClient {

    @GetMapping(value = "/profile/my-profile", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ProfileResponse> getMyProfile();
}
