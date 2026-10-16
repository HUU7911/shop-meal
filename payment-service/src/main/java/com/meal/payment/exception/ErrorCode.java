package com.meal.payment.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION(9999, "uncategorized exception", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHENTICATED(1002, "unauthenticated", HttpStatus.UNAUTHORIZED),
    EMAIL_NOT_SEND(1001, "email not send", HttpStatus.BAD_REQUEST),
    ACCESS_DENIED(1003, "access denied", HttpStatus.FORBIDDEN),
    PAID_NOT_SEND(1004, "paid not send", HttpStatus.BAD_REQUEST),
    INVALID_WEBHOOK_SIGNATURE(1005, "invalid webhook signature", HttpStatus.BAD_REQUEST),
    PAYOS_UNAVAILABLE(1006, "payos unavailable", HttpStatus.BAD_GATEWAY),
    PAYMENT_IN_PROGRESS(1007, "payment in progress", HttpStatus.CONFLICT),
    INVALID_REQUEST(1008, "invalid request", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(1009, "resource not found", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(1010, "method not allowed", HttpStatus.METHOD_NOT_ALLOWED),
    ;

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
}
