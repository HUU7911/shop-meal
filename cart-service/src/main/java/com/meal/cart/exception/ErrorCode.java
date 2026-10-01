package com.meal.cart.exception;

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
    CART_NOT_ITEM(1004, "cart not item", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(1003, "Product not found", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_FOUND(1004, "Cart item not found", HttpStatus.NOT_FOUND),
    QUANTITY_EXCEEDED(1005, "Quantity exceeds the allowed maximum per item", HttpStatus.BAD_REQUEST),
    FOOD_ID_REQUIRED(1006, "foodId is required", HttpStatus.BAD_REQUEST),
    INVALID_QUANTITY(1007, "Quantity must be at least 1", HttpStatus.BAD_REQUEST),
    NOTE_TOO_LONG(1008, "Note must be at most 255 characters", HttpStatus.BAD_REQUEST);
    ;

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
}
