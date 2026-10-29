package com.meal.identity.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Locale;

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

    /** Số giây còn bị khóa; 0 nếu tài khoản không bị khóa. */
    public long getLockRemainingSeconds(String username) {
        Long ttl = redis.getExpire(LOCK_PREFIX + normalize(username));
        return (ttl != null && ttl > 0) ? ttl : 0;
    }

    /** Gọi mỗi khi đăng nhập thất bại (kể cả khi username không tồn tại). */
    public void recordFailure(String username) {
        String key = normalize(username);
        String failKey = FAIL_PREFIX + key;

        Long count = redis.opsForValue().increment(failKey);
        redis.expire(failKey, Duration.ofMinutes(windowMinutes)); // luôn đặt lại TTL, key không tồn tại vô hạn

        if (count != null && count >= maxAttempts) {
            redis.opsForValue().set(LOCK_PREFIX + key, "1", Duration.ofMinutes(lockMinutes));
            redis.delete(failKey);
            log.warn("Login locked for {} minutes after {} failed attempts", lockMinutes, count);
        }
    }

    /** Gọi khi đăng nhập thành công. */
    public void recordSuccess(String username) {
        redis.delete(FAIL_PREFIX + normalize(username));
    }

    private String normalize(String username) {
        String n = username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
        return n.length() > 100 ? n.substring(0, 100) : n;
    }
}