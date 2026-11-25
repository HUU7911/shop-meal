package com.meal.identity.exception;

import lombok.Getter;

@Getter
public class TooManyAttemptsException extends AppException {
    private final long retryAfterSeconds;

    public TooManyAttemptsException(long retryAfterSeconds) {
        super(ErrorCode.TOO_MANY_ATTEMPTS);
        this.retryAfterSeconds = retryAfterSeconds;
    }
}