package com.meal.order.repository.httpclient;

import com.meal.contract.common.ApiResponse;
import com.meal.contract.dto.IntrospectRequest;
import com.meal.contract.dto.IntrospectResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "identity-service")
public interface IdentityClient {
    @PostMapping("/identity/auth/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request);
}
