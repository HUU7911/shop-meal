package com.meal.gateway.configuration;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

import java.util.Objects;

@Configuration
public class RateLimiterConfig {

    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            var remoteAddress = exchange.getRequest().getRemoteAddress();

            if (Objects.isNull(remoteAddress) || Objects.isNull(remoteAddress.getAddress()) ) {
                return Mono.just("unknown");
            }

            return Mono.just(remoteAddress.getAddress().getHostAddress());
        };
    }
}
