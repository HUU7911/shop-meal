package com.meal.order.repository.httpclient;

import com.meal.order.dto.ApiResponse;
import com.meal.order.dto.client.IntrospectRequest;
import com.meal.order.dto.client.IntrospectResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "identity-service")
public interface IdentityClient {
    @PostMapping("/identity/auth/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request);
}
