package com.meal.identity_service.repository.httpclient;

import com.meal.identity_service.configuration.AuthenticationRequestInterceptor;
import com.meal.identity_service.dto.ApiResponse;
import com.meal.identity_service.dto.request.ProfileCreationRequest;
import com.meal.identity_service.dto.response.ProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "profile-service", url = "${app.config.url}",
        configuration = {AuthenticationRequestInterceptor.class}
)
public interface ProfileClient {
    @PostMapping(value = "/profile/create", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ProfileResponse> create(@RequestBody ProfileCreationRequest request);

    @DeleteMapping(value = "/profile/delete", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> delete();
}
