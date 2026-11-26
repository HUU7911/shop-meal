package com.meal.order.service;

import com.meal.contract.dto.IntrospectRequest;
import com.meal.contract.dto.IntrospectResponse;
import com.meal.order.repository.httpclient.IdentityClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IdentityService {

    IdentityClient identityClient;

    public IntrospectResponse introspectResponse(IntrospectRequest request) {
        try {
            var result = identityClient.introspect(request).getResults();
            if (Objects.isNull(result)) {
                return IntrospectResponse.builder().valid(false).build();
            }
            return result;
        } catch (FeignException e) {
            log.error("Identity service returned error: status={}", e.status(), e);
            return IntrospectResponse.builder().valid(false).build();
        } catch (Exception e) {
            log.error("Unexpected error when calling identity-service", e);
            return IntrospectResponse.builder().valid(false).build();
        }
    }
}
