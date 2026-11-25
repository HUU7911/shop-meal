package com.meal.gateway.configuration;

import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PreAuthenticationFilter implements GlobalFilter, Ordered {

    static final int TOO_MANY_REQUESTS_CODE = 1429;

    static final DefaultRedisScript<Long> COUNTER_SCRIPT = new DefaultRedisScript<>(
            "local c = redis.call('INCR', KEYS[1]) "
                    + "if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end "
                    + "return c",
            Long.class);

    ReactiveStringRedisTemplate redis;
    KeyResolver ipKeyResolver;

    @NonFinal
    @Value("${app.api-prefix}")
    String apiPrefix;

    @NonFinal
    @Value("${app.pre-auth.limit:600}")
    int limit;

    @NonFinal
    @Value("${app.pre-auth.window-seconds:60}")
    int windowSeconds;

    @NonFinal
    @Value("${app.pre-auth.blocked-paths:/notification/email/send}")
    String[] blockedPaths;

    @NonFinal
    @Value("${app.pre-auth.skip-paths:/file/media/download}")
    String[] skipPaths;

    @PostConstruct
    void logEffectiveConfig() {
        log.info("Pre-auth limiter config: limit={} per {}s, skip={}, blocked={}",
                limit, windowSeconds, String.join(",", skipPaths), String.join(",", blockedPaths));
    }

    @NullMarked
    @Override
    public Mono<Void> filter(ServerWebExchange original, GatewayFilterChain chain) {
        ServerWebExchange exchange = withJsonTooManyRequests(original);

        String path = exchange.getRequest().getURI().getPath().toLowerCase(Locale.ROOT);

        if (isBlocked(path)) {
            return reject(exchange, HttpStatus.NOT_FOUND, null);
        }

        if (matchesAny(path, skipPaths)) {
            return chain.filter(exchange);
        }

        return ipKeyResolver.resolve(exchange)
                .defaultIfEmpty("unknown")
                .flatMap(ip -> isAllowed(ip).flatMap(allowed -> {
                    if (allowed) {
                        return chain.filter(exchange);
                    }
                    log.warn("Pre-auth limit exceeded: ip={}, limit={} per {}s", ip, limit, windowSeconds);
                    exchange.getResponse().getHeaders().set("X-Limited-By", "pre-auth");
                    return reject(exchange, HttpStatus.TOO_MANY_REQUESTS, windowSeconds);
                }));
    }

    @Override
    public int getOrder() {
        return -2;
    }

    private boolean isBlocked(String path) {
        return matchesAny(path, blockedPaths);
    }

    private boolean matchesAny(String path, String[] prefixes) {
        for (String prefix : prefixes) {
            String full = (apiPrefix + prefix.trim()).toLowerCase(Locale.ROOT);
            if (path.equals(full) || path.startsWith(full + "/")) {
                return true;
            }
        }
        return false;
    }

    private Mono<Boolean> isAllowed(String ip) {
        return redis.execute(COUNTER_SCRIPT, List.of("pre-auth:" + ip), List.of(String.valueOf(windowSeconds)))
                .next()
                .map(count -> count <= limit)
                .onErrorResume(e -> {
                    log.warn("Pre-auth limiter unavailable, allowing request: {}", e.getMessage());
                    return Mono.just(true);
                })
                .defaultIfEmpty(true);
    }

    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status, Integer retryAfterSeconds) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        if (retryAfterSeconds != null) {
            response.getHeaders().set("Retry-After", String.valueOf(retryAfterSeconds));
        }
        return response.setComplete();
    }

    private ServerWebExchange withJsonTooManyRequests(ServerWebExchange exchange) {
        ServerHttpResponse decorated = new ServerHttpResponseDecorator(exchange.getResponse()) {

            @NullMarked
            @Override
            public Mono<Void> setComplete() {
                if (getStatusCode() != null && getStatusCode().value() == 429 && !isCommitted()) {
                    HttpHeaders headers = getHeaders();
                    long retryAfter = resolveRetryAfter(headers);
                    log.debug("Writing JSON body for 429 response, retryAfter={}s", retryAfter);

                    headers.set(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter));
                    headers.set(HttpHeaders.CONTENT_TYPE, "application/json;charset=UTF-8");

                    String json = "{\"code\":" + TOO_MANY_REQUESTS_CODE
                            + ",\"message\":\"Quá nhiều yêu cầu, vui lòng thử lại sau "
                            + retryAfter + " giây\""
                            + ",\"results\":{\"retryAfterSeconds\":" + retryAfter + "}}";

                    return writeWith(Mono.just(bufferFactory().wrap(json.getBytes(StandardCharsets.UTF_8))));
                }
                return super.setComplete();
            }
        };
        return exchange.mutate().response(decorated).build();
    }

    static long resolveRetryAfter(HttpHeaders headers) {
        String existing = headers.getFirst(HttpHeaders.RETRY_AFTER);
        if (existing != null) {
            try {
                return Math.max(1, Long.parseLong(existing));
            } catch (NumberFormatException ignored) {
            }
        }
        try {
            long remaining = Long.parseLong(Objects.requireNonNull(headers.getFirst("X-RateLimit-Remaining")));
            long requested = Long.parseLong(Objects.requireNonNull(headers.getFirst("X-RateLimit-Requested-Tokens")));
            long rate = Long.parseLong(Objects.requireNonNull(headers.getFirst("X-RateLimit-Replenish-Rate")));
            if (rate > 0) {
                return Math.max(1, (long) Math.ceil((requested - remaining) / (double) rate));
            }
        } catch (NumberFormatException ignored) {
        }
        return 1;
    }
}