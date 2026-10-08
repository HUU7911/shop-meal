package com.meal.order.service;

import com.meal.order.constants.OrderStatus;
import com.meal.order.constants.PaymentMethod;
import com.meal.order.constants.PaymentStatus;
import com.meal.order.dto.ApiResponse;
import com.meal.order.dto.PageResponse;
import com.meal.order.dto.client.*;
import com.meal.order.dto.request.CreateOrderRequest;
import com.meal.order.dto.response.OrderItemResponse;
import com.meal.order.dto.response.OrderResponse;
import com.meal.order.entity.Order;
import com.meal.order.entity.OrderItem;
import com.meal.order.exception.AppException;
import com.meal.order.exception.ErrorCode;
import com.meal.order.repository.OrderRepository;
import com.meal.order.repository.httpclient.CartClient;
import com.meal.order.repository.httpclient.PaymentClient;
import com.meal.order.repository.httpclient.ProductClient;
import com.meal.order.repository.httpclient.ProfileClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {

    static final int MAX_PAGE_SIZE = 50;

    OrderRepository orderRepository;
    CartClient cartClient;
    ProductClient productClient;
    ProfileClient profileClient;
    PaymentClient paymentClient;
    OrderNotificationPublisher notificationPublisher;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        String userId = currentUserId();
        CartResponse cart = fetchCart();

        if (cart == null || cart.items() == null || cart.items().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .userId(userId)
                .receiverName(request.receiverName().trim())
                .phone(request.phone().trim())
                .address(request.address().trim())
                .note(StringUtils.hasText(request.note()) ? request.note().trim() : null)
                .status(OrderStatus.PENDING)
                .paymentMethod(request.paymentMethod())
                .paymentStatus(PaymentStatus.UNPAID)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItemResponse cartItem : cart.items()) {
            if (cartItem.quantity() <= 0) {
                throw new AppException(ErrorCode.INVALID_QUANTITY);
            }

            FoodSnapshotResponse food = fetchFood(cartItem.productId());

            BigDecimal itemTotal = food.price()
                    .multiply(BigDecimal.valueOf(cartItem.quantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(cartItem.productId())
                    .productName(food.name())
                    .image(food.image())
                    .unitPrice(food.price())
                    .quantity(cartItem.quantity())
                    .build();

            order.getItems().add(orderItem);
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        PaymentResponse payment = null;

        if (request.paymentMethod() == PaymentMethod.PAYOS) {
            payment = createPayOSPayment(savedOrder);
        }

        clearCartQuietly();
        notifyQuietly(savedOrder);

        return toResponse(savedOrder, payment);
    }

    private PaymentResponse createPayOSPayment(Order order) {
        try {
            CreatePaymentRequest request = CreatePaymentRequest.builder()
                    .orderId(order.getId().toString())
                    .amount(order.getTotalAmount())
                    .build();

            ApiResponse<PaymentResponse> response = paymentClient.createPayment(request);

            if (response == null || response.getResults() == null) {
                throw new AppException(ErrorCode.PAYMENT_SERVICE_ERROR);
            }

            return response.getResults();
        } catch (FeignException e) {
            log.error("Payment service error. orderId={}, status={}", order.getId(), e.status(), e);
            throw new AppException(ErrorCode.PAYMENT_SERVICE_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getMyOrders(int page, int size) {
        Page<Order> data = orderRepository.findByUserId(currentUserId(), pageable(page, size));
        return toPage(data, page);
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(String id) {
        return toResponse(findOwnedOrder(id));
    }

    @Transactional
    public OrderResponse cancelMyOrder(String id) {
        Order order = findOwnedOrder(id);

        if (order.getStatus() != OrderStatus.PENDING
                || order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        order.setStatus(OrderStatus.CANCELLED);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(OrderStatus status, int page, int size) {
        Pageable pageable = pageable(page, size);

        Page<Order> data = status == null
                ? orderRepository.findAll(pageable)
                : orderRepository.findByStatus(status, pageable);

        return toPage(data, page);
    }

    @Transactional
    public OrderResponse updateStatus(String id, OrderStatus next) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getStatus().canTransitionTo(next)) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        order.setStatus(next);

        if (next == OrderStatus.COMPLETED
                && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        return toResponse(order);
    }

    @Transactional
    public OrderResponse confirmPayment(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getPaymentMethod() != PaymentMethod.PAYOS
                || order.getPaymentStatus() == PaymentStatus.PAID
                || order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_OPERATION);
        }

        order.setPaymentStatus(PaymentStatus.PAID);

        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }

        return toResponse(order);
    }

    private CartResponse fetchCart() {
        try {
            ApiResponse<CartResponse> response = cartClient.getMyCart();
            return response == null ? null : response.getResults();
        } catch (FeignException e) {
            log.error("Cart service error. status={}", e.status(), e);
            throw new AppException(ErrorCode.CART_SERVICE_ERROR);
        }
    }

    private FoodSnapshotResponse fetchFood(String productId) {
        try {
            ApiResponse<FoodSnapshotResponse> response =
                    productClient.getFoodSnapshot(productId);

            if (response == null
                    || response.getResults() == null
                    || response.getResults().price() == null) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }

            return response.getResults();
        } catch (FeignException e) {
            log.error("Product service error. productId={}, status={}", productId, e.status(), e);

            throw new AppException(
                    e.status() > 0
                            ? ErrorCode.PRODUCT_NOT_FOUND
                            : ErrorCode.PRODUCT_SERVICE_ERROR
            );
        }
    }

    private void clearCartQuietly() {
        try {
            cartClient.clearMyCart();
        } catch (Exception e) {
            log.warn("Could not clear cart: {}", e.getMessage());
        }
    }

    private void notifyQuietly(Order order) {
        try {
            ApiResponse<ProfileResponse> response = profileClient.getMyProfile();
            ProfileResponse profile = response == null ? null : response.getResults();

            if (profile != null && StringUtils.hasText(profile.email())) {
                notificationPublisher.publishOrderCreated(order, profile.email());
            }
        } catch (Exception e) {
            log.warn("Could not send order notification: {}", e.getMessage());
        }
    }

    private Order findOwnedOrder(String id) {
        return orderRepository.findByIdAndUserId(id, currentUserId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    private String currentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return authentication.getName();
    }

    private String generateOrderCode() {
        return "MEAL" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
    }

    private Pageable pageable(int page, int size) {
        int safePage = Math.max(page, 1) - 1;
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        return PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
    }

    private PageResponse<OrderResponse> toPage(Page<Order> data, int page) {
        return PageResponse.<OrderResponse>builder()
                .currentPage(Math.max(page, 1))
                .pageSize(data.getSize())
                .totalPage(data.getTotalPages())
                .totalElements(data.getTotalElements())
                .data(data.getContent().stream().map(this::toResponse).toList())
                .build();
    }

    private OrderResponse toResponse(Order order) {
        return toResponse(order, null);
    }

    private OrderResponse toResponse(Order order, PaymentResponse payment) {
        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        item.getImage(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getUnitPrice()
                                .multiply(BigDecimal.valueOf(item.getQuantity()))
                ))
                .toList();

        String checkoutUrl = payment != null
                ? payment.checkoutUrl()
                : null;

        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getUserId(),
                order.getReceiverName(),
                order.getPhone(),
                order.getAddress(),
                order.getNote(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                items,
                checkoutUrl
        );
    }
}