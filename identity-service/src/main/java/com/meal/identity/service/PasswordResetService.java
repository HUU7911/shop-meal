package com.meal.identity.service;

import com.meal.event.dto.NotificationEvent;
import com.meal.identity.dto.request.ForgotPasswordRequest;
import com.meal.identity.dto.request.ResetPasswordRequest;
import com.meal.identity.dto.request.VerifyOtpRequest;
import com.meal.identity.entity.User;
import com.meal.identity.exception.AppException;
import com.meal.identity.exception.ErrorCode;
import com.meal.identity.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PasswordResetService {

    static final String OTP_PREFIX = "password-reset:otp:";
    static final String ATTEMPT_PREFIX = "password-reset:attempt:";
    static final String COOLDOWN_PREFIX = "password-reset:cooldown:";
    static final String TOKEN_PREFIX = "password-reset:token:";
    static final String USER_TOKEN_PREFIX = "password-reset:user-token:";

    static final Duration OTP_TTL = Duration.ofMinutes(5);
    static final Duration RESET_TOKEN_TTL = Duration.ofMinutes(10);
    static final Duration REQUEST_COOLDOWN = Duration.ofSeconds(60);
    static final int MAX_OTP_ATTEMPTS = 5;

    static final String OTP_TOPIC = "password-reset-otp";
    static final SecureRandom SECURE_RANDOM = new SecureRandom();

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    StringRedisTemplate redisTemplate;
    KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();

        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(COOLDOWN_PREFIX + email, "1", REQUEST_COOLDOWN);
        if (!Boolean.TRUE.equals(acquired)) {
            return;
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return;
        }

        String otp = generateOtp();
        String otpKey = OTP_PREFIX + email;

        redisTemplate.opsForValue().set(otpKey, passwordEncoder.encode(otp), OTP_TTL);

        redisTemplate.delete(ATTEMPT_PREFIX + email);
        revokeExistingResetToken(user.getId());

        NotificationEvent event = NotificationEvent.builder()
                .chanel("EMAIL")
                .recipient(email)
                .subject("Reset Password")
                .body("Otp: " + otp)
                .build();

        kafkaTemplate.send(OTP_TOPIC, email, event).whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to publish password reset OTP event for user {}", user.getId(), ex);
                redisTemplate.delete(otpKey);
            }
        });
    }

    public String verifyOtp(VerifyOtpRequest request) {
        String email = normalizeEmail(request.getEmail());
        String otpKey = OTP_PREFIX + email;
        String attemptKey = ATTEMPT_PREFIX + email;

        String otpHash = redisTemplate.opsForValue().get(otpKey);
        if (!StringUtils.hasText(otpHash)) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        Long attempts = redisTemplate.opsForValue().increment(attemptKey);
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(attemptKey, OTP_TTL);
        }
        if (attempts != null && attempts > MAX_OTP_ATTEMPTS) {
            redisTemplate.delete(otpKey);
            redisTemplate.delete(attemptKey);
            throw new AppException(ErrorCode.TOO_MANY_ATTEMPTS);
        }

        if (!passwordEncoder.matches(request.getOtp(), otpHash)) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        Boolean consumed = redisTemplate.delete(otpKey);
        if (!Boolean.TRUE.equals(consumed)) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }
        redisTemplate.delete(attemptKey);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        revokeExistingResetToken(user.getId());

        String resetToken = UUID.randomUUID().toString();

        redisTemplate.opsForValue().set(TOKEN_PREFIX + resetToken, user.getId(), RESET_TOKEN_TTL);
        redisTemplate.opsForValue().set(USER_TOKEN_PREFIX + user.getId(), resetToken, RESET_TOKEN_TTL);

        return resetToken;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String resetToken = request.getResetToken();
        if (!StringUtils.hasText(resetToken)) {
            throw new AppException(ErrorCode.INVALID_RESET_TOKEN);
        }

        String userId = redisTemplate.opsForValue().getAndDelete(TOKEN_PREFIX + resetToken);
        if (!StringUtils.hasText(userId)) {
            throw new AppException(ErrorCode.INVALID_RESET_TOKEN);
        }

        redisTemplate.delete(USER_TOKEN_PREFIX + userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        revokeUserSessions(user);
    }

    private void revokeExistingResetToken(String userId) {
        String userTokenKey = USER_TOKEN_PREFIX + userId;
        String oldToken = redisTemplate.opsForValue().get(userTokenKey);
        if (StringUtils.hasText(oldToken)) {
            redisTemplate.delete(TOKEN_PREFIX + oldToken);
        }
        redisTemplate.delete(userTokenKey);
    }

    private void revokeUserSessions(User user) {
        log.info("Password reset for user {} - revoke sessions here", user.getId());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String generateOtp() {
        return String.valueOf(100000 + SECURE_RANDOM.nextInt(900000));
    }
}