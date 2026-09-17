package com.meal.identity_service.exception;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {

    UNCATEGORIZED(1001, "Uncategorized", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1002, "User not found", HttpStatus.NOT_FOUND),
    USER_NOT_EXIST(1003, "User not exist", HttpStatus.BAD_REQUEST),
    USER_EXIST(1004, "User not exist", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1005, "Unauthorized", HttpStatus.UNAUTHORIZED),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(1007, "Access denied", HttpStatus.FORBIDDEN),
    INVALID_KEY(1008, "Invalid key", HttpStatus.BAD_REQUEST),
    ;

    int code;
    String message;
    HttpStatusCode httpStatusCode;
}
