package com.meal.cart.exception;

import com.meal.cart.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    ResponseEntity<ApiResponse<Void>> handleApp(AppException e) {
        return build(e.getErrorCode(), e.getErrorCode().getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
        var fieldError = e.getBindingResult().getFieldError();
        String message = fieldError == null
                ? ErrorCode.INVALID_REQUEST.getMessage()
                : fieldError.getField() + ": " + fieldError.getDefaultMessage();
        return build(ErrorCode.INVALID_REQUEST, message);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiResponse<Void>> handleUnreadable(HttpMessageNotReadableException e) {
        return build(ErrorCode.INVALID_REQUEST, ErrorCode.INVALID_REQUEST.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException e) {
        return build(ErrorCode.ACCESS_DENIED, ErrorCode.ACCESS_DENIED.getMessage());
    }

    @ExceptionHandler({
            DataIntegrityViolationException.class,
            ObjectOptimisticLockingFailureException.class,
            PessimisticLockingFailureException.class
    })
    ResponseEntity<ApiResponse<Void>> handleConflict(Exception e) {
        log.warn("Cart conflict: {}", e.getClass().getSimpleName());
        return build(ErrorCode.CART_CONFLICT, ErrorCode.CART_CONFLICT.getMessage());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> handleUnknown(Exception e) {
        log.error("Unhandled exception", e);
        return build(ErrorCode.UNCATEGORIZED, ErrorCode.UNCATEGORIZED.getMessage());
    }

    private ResponseEntity<ApiResponse<Void>> build(ErrorCode errorCode, String message) {
        return ResponseEntity.status(errorCode.getHttpStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(message)
                        .build());
    }
}