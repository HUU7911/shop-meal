package com.meal.cart.service;

import com.meal.cart.dto.request.AddCartItemRequest;
import com.meal.cart.dto.request.UpdateCartItemRequest;
import com.meal.cart.dto.response.CartItemResponse;
import com.meal.cart.dto.response.CartResponse;
import com.meal.cart.entity.Cart;
import com.meal.cart.entity.CartItem;
import com.meal.cart.entity.ProductSnapshot;
import com.meal.cart.exception.AppException;
import com.meal.cart.exception.ErrorCode;
import com.meal.cart.repository.CartRepository;
import com.meal.cart.repository.ProductSnapshotRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartService {

    CartRepository cartRepository;
    ProductSnapshotRepository productSnapshotRepository;
    CurrentUser currentUser;

    @Value("${app.cart.max-quantity-per-item:99}")
    private int maxQuantity;

    @Transactional(readOnly = true)
    public CartResponse getMyCart() {
        return cartRepository.findByUserId(currentUser.id())
                .map(this::toResponse)
                .orElseGet(() -> new CartResponse(null, List.of(), 0, BigDecimal.ZERO));
    }

    @Transactional
    public CartResponse addItem(AddCartItemRequest request) {
        productSnapshotRepository.findById(request.foodId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        Cart cart = getOrCreateCart(currentUser.id());

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getFoodId().equals(request.foodId()))
                .findFirst()
                .orElse(null);

        if (item == null) {
            checkQuantity(request.quantity());
            cart.getItems().add(CartItem.builder()
                    .cart(cart)
                    .foodId(request.foodId())
                    .quantity(request.quantity())
                    .note(request.note())
                    .build());
        } else {
            int newQuantity = item.getQuantity() + request.quantity();
            checkQuantity(newQuantity);
            item.setQuantity(newQuantity);
            if (request.note() != null) item.setNote(request.note());
        }
        return save(cart);
    }

    @Transactional
    public CartResponse updateItem(String itemId, UpdateCartItemRequest request) {
        Cart cart = findMyCart();
        CartItem item = findItem(cart, itemId);
        checkQuantity(request.quantity());
        item.setQuantity(request.quantity());
        item.setNote(request.note());
        return save(cart);
    }

    @Transactional
    public CartResponse removeItem(String itemId) {
        Cart cart = findMyCart();
        CartItem item = findItem(cart, itemId);
        cart.getItems().remove(item); // orphanRemoval sẽ xóa dòng trong DB
        return save(cart);
    }

    @Transactional
    public void clear() {
        cartRepository.findByUserId(currentUser.id()).ifPresent(cart -> {
            cart.getItems().clear();
            save(cart);
        });
    }

    private Cart findMyCart() {
        return cartRepository.findByUserId(currentUser.id())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
    }

    private CartItem findItem(Cart cart, String itemId) {
        return cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
    }

    private void checkQuantity(int quantity) {
        if (quantity > maxQuantity) throw new AppException(ErrorCode.QUANTITY_EXCEEDED);
    }

    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            try {
                return cartRepository.saveAndFlush(Cart.builder().userId(userId).updatedAt(Instant.now()).build());
            } catch (DataIntegrityViolationException e) {
                return cartRepository.findByUserId(userId).orElseThrow(() -> e);
            }
        });
    }

    private CartResponse save(Cart cart) {
        cart.setUpdatedAt(Instant.now());
        return toResponse(cartRepository.save(cart));
    }

    private CartResponse toResponse(Cart cart) {
        Map<String, ProductSnapshot> products = productSnapshotRepository
                .findAllById(cart.getItems().stream().map(CartItem::getFoodId).toList())
                .stream().collect(Collectors.toMap(ProductSnapshot::getFoodId, Function.identity()));

        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem i : cart.getItems()) {
            ProductSnapshot p = products.get(i.getFoodId());
            if (p == null) continue;
            BigDecimal subtotal = p.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()));
            items.add(new CartItemResponse(i.getId(), i.getFoodId(), p.getName(), p.getImage(),
                    p.getPrice(), i.getQuantity(), i.getNote(), subtotal));
            total = total.add(subtotal);
            totalItems += i.getQuantity();
        }
        return new CartResponse(cart.getId(), items, totalItems, total);
    }
}
