package com.meal.gateway.configuration;

import com.meal.gateway.dto.ApiResponse;
import com.meal.gateway.service.IdentityService;
import lombok.AccessLevel;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.jspecify.annotations.NullMarked;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationFilter implements GlobalFilter, Ordered {

    IdentityService identityService;
    ObjectMapper objectMapper;

    @NonNull
    final String[] PUBLIC_ENDPOINT = {
            "/identity/users/create",
            "/identity/auth/login",
            "/identity/auth/introspect",
            "/identity/auth/forgot-password",
            "/identity/auth/reset-password",
            "/identity/auth/verify-otp",
            "/search/product",
            "/product/food",
            "/product/category",
            "/identity/auth/outbound/identity",
            "/file/media/download",
            "/post/banner/getAll",
            "/payment/paid/payos-webhook",
            "/file/media/download/.*",
            "/post/getAllPost"
    };

    @Value("${app.api-prefix}")
    @NonFinal
    private String API_PREFIX;

    @NullMarked
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        if (isPubLicEndpoint(exchange.getRequest()))
            return chain.filter(exchange);

        String authHeaders = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (Objects.isNull(authHeaders)) {
            return unauthenticated(exchange.getResponse());
        }

        String token = authHeaders.substring(7);

        return identityService.introspect(token)
                .map(response ->
                        !Objects.isNull(response.getResults()) && response.getResults().isValid())
                .onErrorReturn(false)
                .flatMap(valid -> valid
                        ? chain.filter(exchange)
                        : unauthenticated(exchange.getResponse()));
    }

    @Override
    public int getOrder() {
        return 0;
    }

    private boolean isPubLicEndpoint(ServerHttpRequest request) {
        return Arrays.stream(PUBLIC_ENDPOINT)
                .anyMatch(s -> request.getURI().getPath().matches(API_PREFIX + s));
    }

    private Mono<Void> unauthenticated(ServerHttpResponse response) {
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(1401)
                .message("unauthenticated")
                .build();

        String body;
        try {
            body = objectMapper.writeValueAsString(apiResponse);
        } catch (JacksonException e) {
            body = "{\"code\":1401,\"message\":\"unauthenticated\"}";
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        return response.writeWith(
                Mono.just(response.bufferFactory()
                        .wrap(body.getBytes(StandardCharsets.UTF_8))));
    }
}
