package com.meal.cart.service;

import com.meal.cart.dto.request.AddProductToCartRequest;
import com.meal.cart.dto.response.CartResponse;
import com.meal.cart.entity.Cart;
import com.meal.cart.entity.CartItem;
import com.meal.cart.exception.AppException;
import com.meal.cart.exception.ErrorCode;
import com.meal.cart.mapper.CartMapper;
import com.meal.cart.repository.CartRepository;
import com.meal.cart.repository.httpclient.ProductItemClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartService {

    CartRepository cartRepository;
    CartMapper cartMapper;
    ProductItemClient productItemClient;

    @Transactional
    public CartResponse addProductToCart(AddProductToCartRequest request) {
        String userId = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();

        var product = productItemClient.getFoodById(request.productId());
        if (Objects.isNull(product) || Objects.isNull(product.getResults())) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        var food = product.getResults();

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> Cart.builder()
                        .userId(userId)
                        .items(new HashSet<>())
                        .totalPrice(BigDecimal.ZERO)
                        .build());

        CartItem existing = cart.getItems().stream()
                .filter(i -> Objects.equals(i.getProductId(), request.productId()))
                .findFirst()
                .orElse(null);

        if (Objects.nonNull(existing)) {
            existing.setQuantity(existing.getQuantity() + 1);
        } else {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .productId(request.productId())
                    .productName(food.name())
                    .image(food.image())
                    .price(request.price())
                    .quantity(1)
                    .build();
            cart.addItem(cartItem);
        }

        return saveAndMap(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getMyCart() {
        String userId = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();

        Cart cart = cartRepository.findByUserId(userId).orElseGet(() ->
                Cart.builder()
                        .userId(userId)
                        .totalPrice(BigDecimal.ZERO)
                        .build());

        return cartMapper.toCartResponse(cart);
    }

    @Transactional
    public CartResponse increaseQuantity(String itemId) {
        Cart cart = getCurrentUserCart();
        CartItem item = findItem(cart, itemId);

        item.setQuantity(item.getQuantity() + 1);

        return saveAndMap(cart);
    }

    @Transactional
    public CartResponse decreaseQuantity(String itemId) {
        Cart cart = getCurrentUserCart();
        CartItem item = findItem(cart, itemId);

        if (item.getQuantity() <= 1) {
            cart.getItems().removeIf(i -> i.getId().equals(itemId));
        } else {
            item.setQuantity(item.getQuantity() - 1);
        }

        return saveAndMap(cart);
    }

    @Transactional
    public CartResponse removeItem(String itemId) {
        Cart cart = getCurrentUserCart();
        findItem(cart, itemId);

        cart.getItems().removeIf(i -> i.getId().equals(itemId));

        return saveAndMap(cart);
    }

    @Transactional
    public void deleteAllCart() {
        var userId = Objects.requireNonNull(
                SecurityContextHolder.getContext().getAuthentication()).getName();

        var cart = cartRepository.findByUserId(userId).orElseThrow(
                () -> new AppException(ErrorCode.CART_NOT_FOUND)
        );

        cart.getItems().clear();
        cart.setTotalPrice(BigDecimal.ZERO);
    }

    private Cart getCurrentUserCart() {
        var userId = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        return cartRepository.findByUserId(userId).orElseThrow(
                () -> new AppException(ErrorCode.CART_NOT_FOUND));
    }

    private CartItem findItem(Cart cart, String itemId) {
        return cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
    }

    private CartResponse saveAndMap(Cart cart) {
        cart.setTotalPrice(calculateTotal(cart));
        Cart saved = cartRepository.save(cart);
        return cartMapper.toCartResponse(saved);
    }

    private BigDecimal calculateTotal(Cart cart) {
        return cart.getItems().stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}