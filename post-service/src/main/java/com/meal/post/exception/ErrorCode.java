package com.meal.post.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION(9999, "uncategorized exception", HttpStatus.BAD_GATEWAY),
    UNAUTHENTICATED(1001, "unauthenticated", HttpStatus.UNAUTHORIZED),
    INVALID_KEY(1002, "invalid key", HttpStatus.BAD_REQUEST),
    NOT_FOUND(1003, "not found", HttpStatus.NOT_FOUND),
    ;

    private int code;
    private String message;
    private HttpStatusCode statusCode;
}
