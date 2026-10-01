package com.meal.cart.service;

import com.meal.cart.exception.AppException;
import com.meal.cart.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    @Value("${app.jwt.user-id-claim:sub}")
    private String userIdClaim;

    public String id() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            String id = jwt.getClaimAsString(userIdClaim);
            if (id != null && !id.isBlank()) return id;
        }
        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
}
