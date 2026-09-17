package com.api.api_gateway.service;

import com.api.api_gateway.dto.ApiResponse;
import com.api.api_gateway.dto.request.IntrospectRequest;
import com.api.api_gateway.dto.response.IntrospectResponse;
import com.api.api_gateway.repository.HttpClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IdentityService {

    HttpClient httpClient;

    public Mono<ApiResponse<IntrospectResponse>> introspect(String token) {
        return httpClient.introspect(IntrospectRequest.builder()
                        .token(token)
                .build());
    }
}
