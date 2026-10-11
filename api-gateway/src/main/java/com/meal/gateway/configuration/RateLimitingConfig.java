package com.meal.gateway.configuration;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.Principal;
import java.util.Objects;

@Configuration
public class RateLimitingConfig {

    @Bean
    public KeyResolver userNameKeyResolver() {
        return exchange -> {
            String ip = (!Objects.isNull(exchange.getRequest().getRemoteAddress()))
                    ? exchange
                        .getRequest()
                        .getRemoteAddress()
                        .getAddress()
                        .getHostAddress()
                    : "unknown";

            return exchange.getPrincipal()
                    .map(Principal::getName)
                    .filter(name -> !name.isBlank())
                    .map(name -> "user:" + name)
                    .defaultIfEmpty("ip:" + ip);
        };
    }
}
