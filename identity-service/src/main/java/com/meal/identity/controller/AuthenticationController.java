package com.meal.identity.controller;

import com.meal.identity.dto.ApiResponse;
import com.meal.identity.dto.request.*;
import com.meal.identity.dto.response.AuthenticationResponse;
import com.meal.identity.dto.response.IntrospectResponse;
import com.meal.identity.dto.response.ResetPasswordResponse;
import com.meal.identity.service.AuthenticationService;
import com.meal.identity.service.PasswordResetService;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
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
    PasswordResetService passwordResetService;

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

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        passwordResetService.forgotPassword(request);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("If the email exists, an OTP has been sent")
                .build();
    }

    @PostMapping("/verify-otp")
    public ApiResponse<ResetPasswordResponse> verifyOtp(@RequestBody @Valid VerifyOtpRequest request) {
        String resetToken = passwordResetService.verifyOtp(request);
        return ApiResponse.<ResetPasswordResponse>builder()
                .code(1000)
                .results(ResetPasswordResponse.builder()
                        .resetToken(resetToken)
                        .build())
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Password reset successfully")
                .build();
    }
}
