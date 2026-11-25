package com.meal.identity.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.Locale;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LoginAttemptService {

    static final String FAIL_PREFIX = "login:fail:";
    static final String LOCK_PREFIX = "login:lock:";

    StringRedisTemplate redis;

    @NonFinal
    @Value("${security.login.max-attempts:5}")
    int maxAttempts;

    @NonFinal
    @Value("${security.login.window-minutes:15}")
    long windowMinutes;

    @NonFinal
    @Value("${security.login.lock-minutes:15}")
    long lockMinutes;

    public long getLockRemainingSeconds(String username) {
        Long ttl = redis.getExpire(LOCK_PREFIX + normalize(username));
        return (ttl != null && ttl > 0) ? ttl : 0;
    }

    public void recordFailure(String username) {
        String key = normalize(username);
        String failKey = FAIL_PREFIX + key;

        Long count = redis.opsForValue().increment(failKey);
        redis.expire(failKey, Duration.ofMinutes(windowMinutes));

        if (!Objects.isNull(count) && count >= maxAttempts) {
            redis.opsForValue().set(LOCK_PREFIX + key, "1", Duration.ofMinutes(lockMinutes));
            redis.delete(failKey);
            log.warn("Login locked for {} minutes after {} failed attempts", lockMinutes, count);
        }
    }

    public void recordSuccess(String username) {
        redis.delete(FAIL_PREFIX + normalize(username));
    }

    private String normalize(String username) {
        String name = StringUtils.isEmpty(username)
                ? ""
                : username.trim().toLowerCase(Locale.ROOT);
        return name.length() > 100
                ? name.substring(0, 100)
                : name;
    }
}