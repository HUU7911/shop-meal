package com.meal.notification.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION(9999, "uncategorized exception", HttpStatus.UNAUTHORIZED),
    UNAUTHENTICATED(1002, "unauthenticated", HttpStatus.UNAUTHORIZED),
    EMAIL_NOT_SEND(1001, "email not send", HttpStatus.BAD_REQUEST),
    ACCESS_DENIED(1003, "access denied", HttpStatus.FORBIDDEN),
    ;

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
}
