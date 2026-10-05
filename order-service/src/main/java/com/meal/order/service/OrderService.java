package com.meal.order.service;

import com.meal.order.constants.OrderStatus;
import com.meal.order.constants.PaymentMethod;
import com.meal.order.constants.PaymentStatus;
import com.meal.order.dto.ApiResponse;
import com.meal.order.dto.PageResponse;
import com.meal.order.dto.client.CartItemResponse;
import com.meal.order.dto.client.CartResponse;
import com.meal.order.dto.client.FoodSnapshotResponse;
import com.meal.order.dto.client.ProfileResponse;
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
import java.util.Objects;
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

    public OrderResponse createOrder(CreateOrderRequest request) {
        String userId = currentUserId();

        CartResponse cart = fetchCart();
        if (Objects.isNull(cart)) {
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

        BigDecimal total = BigDecimal.ZERO;
        for (CartItemResponse cartItem : cart.items()) {
            FoodSnapshotResponse food = fetchFood(cartItem.productId());

            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .productId(cartItem.productId())
                    .productName(food.name())
                    .image(food.image())
                    .unitPrice(food.price())
                    .quantity(cartItem.quantity())
                    .build());

            total = total.add(food.price().multiply(BigDecimal.valueOf(cartItem.quantity())));
        }
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);

        clearCartQuietly();
        notifyQuietly(saved);

        return toResponse(saved);
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

        // Khách chỉ được hủy khi đơn còn PENDING và chưa trả tiền.
        // Đơn đã trả tiền cần hoàn tiền thủ công => để staff xử lý.
        if (order.getStatus() != OrderStatus.PENDING || order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        order.setStatus(OrderStatus.CANCELLED);
        return toResponse(order);
    }

    // =====================================================================
    // ADMIN / STAFF
    // =====================================================================

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(OrderStatus status, int page, int size) {
        Pageable pageable = pageable(page, size);
        Page<Order> data = (status == null)
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

        // COD: giao xong tức là đã thu tiền mặt
        if (next == OrderStatus.COMPLETED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }
        // Lưu ý: hủy đơn đã PAID thì hoàn tiền xử lý ngoài hệ thống (chưa có refund).

        return toResponse(order);
    }

    /** Staff xác nhận đã nhận chuyển khoản QR (chưa có webhook ngân hàng nên làm thủ công). */
    @Transactional
    public OrderResponse confirmPayment(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getPaymentMethod() != PaymentMethod.QR_CODE
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

    // =====================================================================
    // Gọi service khác
    // =====================================================================

    private CartResponse fetchCart() {
        try {
            ApiResponse<CartResponse> res = cartClient.getMyCart();
            return res == null ? null : res.getResults();
        } catch (FeignException e) {
            log.error("cart-service error, status={}", e.status(), e);
            throw new AppException(ErrorCode.CART_SERVICE_ERROR);
        }
    }

    private FoodSnapshotResponse fetchFood(String productId) {
        try {
            ApiResponse<FoodSnapshotResponse> res = productClient.getFoodSnapshot(productId);
            if (res == null || res.getResults() == null || res.getResults().price() == null) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }
            return res.getResults();
        } catch (FeignException e) {
            log.error("product-service error, productId={}, status={}", productId, e.status(), e);
            // status > 0: product-service có trả lời nhưng báo lỗi (món đã bị xóa...).
            // status <= 0: không kết nối được.
            throw new AppException(e.status() > 0
                    ? ErrorCode.PRODUCT_NOT_FOUND
                    : ErrorCode.PRODUCT_SERVICE_ERROR);
        }
    }

    private void clearCartQuietly() {
        try {
            cartClient.clearMyCart();
        } catch (Exception e) {
            log.warn("order saved but could not clear cart: {}", e.getMessage());
        }
    }

    private void notifyQuietly(Order order) {
        try {
            ApiResponse<ProfileResponse> res = profileClient.getMyProfile();
            ProfileResponse profile = res == null ? null : res.getResults();
            if (profile != null && StringUtils.hasText(profile.email())) {
                notificationPublisher.publishOrderCreated(order, profile.email());
            }
        } catch (Exception e) {
            log.warn("could not send order notification: {}", e.getMessage());
        }
    }

    // =====================================================================
    // Helper
    // =====================================================================

    private Order findOwnedOrder(String id) {
        // lọc theo userId để người khác không đọc được đơn của mình (và không lộ việc đơn có tồn tại)
        return orderRepository.findByIdAndUserId(id, currentUserId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    private String currentUserId() {
        return Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
    }

    private String generateOrderCode() {
        // vd: MEAL3F9A1C7B, chỉ gồm chữ + số để dùng làm nội dung chuyển khoản
        return "MEAL" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private Pageable pageable(int page, int size) {
        int safePage = Math.max(page, 1) - 1;                       // API dùng page bắt đầu từ 1 (giống product-service)
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);  // chặn size quá lớn
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
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

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> items = o.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getId(),
                        i.getProductId(),
                        i.getProductName(),
                        i.getImage(),
                        i.getUnitPrice(),
                        i.getQuantity(),
                        i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity()))))
                .toList();

        return new OrderResponse(
                o.getId(),
                o.getOrderCode(),
                o.getUserId(),
                o.getReceiverName(),
                o.getPhone(),
                o.getAddress(),
                o.getNote(),
                o.getStatus(),
                o.getPaymentMethod(),
                o.getPaymentStatus(),
                o.getTotalAmount(),
                o.getCreatedAt(),
                items);
    }
}
