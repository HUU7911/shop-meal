package com.meal.order.dto.response;

import com.meal.contract.constant.OrderStatus;
import com.meal.contract.constant.PaymentMethod;
import com.meal.contract.constant.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        String id,
        String orderCode,
        String userId,
        String receiverName,
        String phone,
        String address,
        String note,
        OrderStatus status,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        BigDecimal totalAmount,
        Instant createdAt,
        List<OrderItemResponse> items,
        String checkoutUrl){
}
