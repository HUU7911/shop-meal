package com.meal.order.dto.request;

import com.meal.contract.constant.PaymentMethod;
import com.meal.contract.dto.FoodOrderRequest;

public record BuyNowRequest(
        String receiverName,
        String phone,
        String address,
        String note,
        PaymentMethod paymentMethod,
        FoodOrderRequest foodRequest
) {}