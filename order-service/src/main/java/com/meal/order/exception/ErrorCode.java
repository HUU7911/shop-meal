package com.meal.order.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHENTICATED(1002, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(1003, "Access denied", HttpStatus.FORBIDDEN),
    INVALID_REQUEST(1004, "Invalid request", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND(2001, "Order not found", HttpStatus.NOT_FOUND),
    CART_EMPTY(2002, "Cart is empty", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(2003, "A product in your cart is no longer available", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATUS(2004, "Invalid order status transition", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_CANCEL(2005, "Order can no longer be cancelled", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_OPERATION(2006, "Invalid payment operation for this order", HttpStatus.BAD_REQUEST),
    INVALID_QUANTITY(2007, "Invalid quantity", HttpStatus.BAD_REQUEST),
    INVALID_KEY(2008, "Invalid key", HttpStatus.BAD_REQUEST),
    CART_SERVICE_ERROR(2101, "Cart service is unavailable", HttpStatus.BAD_GATEWAY),
    PRODUCT_SERVICE_ERROR(2102, "Product service is unavailable", HttpStatus.BAD_GATEWAY),
    PAYMENT_SERVICE_ERROR(2103, "Payment service is unavailable", HttpStatus.BAD_GATEWAY),
    ORDER_IS_EMPTY(2104, "Order is empty", HttpStatus.BAD_REQUEST),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode httpStatusCode;
}
