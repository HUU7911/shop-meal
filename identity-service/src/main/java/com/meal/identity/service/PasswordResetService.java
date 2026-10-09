package com.meal.identity.service;

import ch.qos.logback.core.util.StringUtil;
import com.meal.event.dto.PasswordResetOtpEvent;
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
import lombok.experimental.NonFinal;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PasswordResetService {

    @NonFinal
    String OTP_PREFIX = "password-reset:otp:";

    @NonFinal
    String TOKEN_PREFIX = "password-reset:token:";

    @NonFinal
    String VERIFIED_PREFIX = "password-reset:verified:";

    @NonFinal
    static long OTP_EXPIRE_MINUTES = 5;

    @NonFinal
    static long RESET_TOKEN_EXPIRE_MINUTES = 10;

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    StringRedisTemplate redisTemplate;
    KafkaTemplate<String, PasswordResetOtpEvent> kafkaTemplate;

    public void forgotPassword(ForgotPasswordRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);

        if (Objects.isNull(user)) {
            return;
        }

        String otp = generateOtp();

        String otpHash = passwordEncoder.encode(otp);

        String key = OTP_PREFIX + email;

        redisTemplate.opsForValue().set(key, otpHash, Duration.ofMinutes(OTP_EXPIRE_MINUTES));

        redisTemplate.delete(VERIFIED_PREFIX + email);

        PasswordResetOtpEvent event = PasswordResetOtpEvent.builder()
                .email(email)
                .otp(otp)
                .build();

        kafkaTemplate.send("password-reset-otp", event);
    }

    public String verifyOtp(VerifyOtpRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        String key = OTP_PREFIX + email;

        String otpHash = redisTemplate.opsForValue().get(key);

        if (StringUtil.isNullOrEmpty(otpHash)) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        boolean valid = passwordEncoder.matches(request.getOtp(), otpHash);

        if (!valid) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXIST));

        String resetToken = UUID.randomUUID().toString();

        String tokenKey = TOKEN_PREFIX + resetToken;

        redisTemplate.opsForValue().set(tokenKey, user.getId(),
                Duration.ofMinutes(RESET_TOKEN_EXPIRE_MINUTES)
        );

        redisTemplate.delete(key);

        redisTemplate.opsForValue().set(
                VERIFIED_PREFIX + email,
                "true",
                Duration.ofMinutes(RESET_TOKEN_EXPIRE_MINUTES)
        );

        return resetToken;
    }

    public void resetPassword(ResetPasswordRequest request) {

        String tokenKey = TOKEN_PREFIX + request.getResetToken();

        String userId = redisTemplate.opsForValue().get(tokenKey);

        if (StringUtil.isNullOrEmpty(userId)) {
            throw new AppException(ErrorCode.INVALID_RESET_TOKEN);
        }

        User user = userRepository.findById(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXIST));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);

        redisTemplate.delete(tokenKey);
    }

    private String generateOtp() {
        SecureRandom secureRandom = new SecureRandom();
        int otp = 100000 + secureRandom.nextInt(900000);

        return String.valueOf(otp);
    }
}