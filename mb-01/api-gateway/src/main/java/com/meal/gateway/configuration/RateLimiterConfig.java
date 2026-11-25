package com.meal.gateway.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.support.ipresolver.XForwardedRemoteAddressResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;

@Configuration
public class RateLimiterConfig {

    private final XForwardedRemoteAddressResolver forwardedResolver;

    public RateLimiterConfig(@Value("${app.rate-limit.trusted-proxies:0}") int trustedProxies) {
        this.forwardedResolver = trustedProxies > 0
                ? XForwardedRemoteAddressResolver.maxTrustedIndex(trustedProxies)
                : null;
    }

    @Bean
    @Primary
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just(clientIp(exchange));
    }

    @Bean
    public KeyResolver baselineKeyResolver() {
        return exchange -> Mono.just("baseline:" + clientIp(exchange));
    }

    private String clientIp(ServerWebExchange exchange) {
        InetSocketAddress address = forwardedResolver != null
                ? forwardedResolver.resolve(exchange)
                : exchange.getRequest().getRemoteAddress();

        if (address == null || address.getAddress() == null) {
            return "unknown";
        }
        return address.getAddress().getHostAddress();
    }
}