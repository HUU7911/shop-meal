package com.meal.search.configuration;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager redisCacheManager(RedisConnectionFactory factory) {
        var serializer = GenericJacksonJsonRedisSerializer.builder()
                .enableUnsafeDefaultTyping()
                .build();

        var config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(serializer));

        Map<String, RedisCacheConfiguration> redisCacheConfigurations = new HashMap<>();

        redisCacheConfigurations.put("search", config.entryTtl(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(factory)
                .withInitialCacheConfigurations(redisCacheConfigurations)
                .build();
    }
}
