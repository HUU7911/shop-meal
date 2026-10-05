package com.meal.identity.controller;

import com.meal.identity.dto.ApiResponse;
import com.meal.identity.dto.request.AuthenticationRequest;
import com.meal.identity.dto.request.IntrospectRequest;
import com.meal.identity.dto.request.LogoutRequest;
import com.meal.identity.dto.request.RefreshRequest;
import com.meal.identity.dto.response.AuthenticationResponse;
import com.meal.identity.dto.response.IntrospectResponse;
import com.meal.identity.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/login")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .results(authenticationService.authenticate(request))
                .build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        return ApiResponse.<IntrospectResponse>builder()
                .results(authenticationService.introspect(request))
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder()
                .message("logout success")
                .build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refreshToken(@RequestBody RefreshRequest refreshRequest)
            throws ParseException, JOSEException {
        return ApiResponse.<AuthenticationResponse>builder()
                .results(authenticationService.refreshToken(refreshRequest))
                .build();
    }

    @PostMapping("/outbound/identity")
    ApiResponse<AuthenticationResponse> outboundIdentityClient(@RequestParam("code") String code){
        return ApiResponse.<AuthenticationResponse>builder()
                .results(authenticationService.outboundIdentityClient(code))
                .build();
    }
}
