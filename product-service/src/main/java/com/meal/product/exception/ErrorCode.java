package com.meal.product.exception;

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
    INVALID_KEY(1001, "invalid key", HttpStatus.BAD_REQUEST),
    PRODUCT_EXISTED(1002, "product already exists", HttpStatus.CONFLICT),
    ;

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
}
