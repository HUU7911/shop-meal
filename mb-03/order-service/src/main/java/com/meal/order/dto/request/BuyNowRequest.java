package com.meal.order.dto.request;

import com.meal.order.constants.PaymentMethod;
import com.meal.order.dto.client.FoodOrderRequest;

public record BuyNowRequest(
        String receiverName,
        String phone,
        String address,
        String note,
        PaymentMethod paymentMethod,
        FoodOrderRequest foodRequest
) {}