package com.meal.cart.service;

import com.meal.cart.dto.request.AddProductToCartRequest;
import com.meal.cart.dto.response.CartResponse;
import com.meal.cart.dto.response.FoodSnapshotResponse;
import com.meal.cart.dto.response.SizeOption;
import com.meal.cart.entity.Cart;
import com.meal.cart.entity.CartItem;
import com.meal.cart.exception.AppException;
import com.meal.cart.exception.ErrorCode;
import com.meal.cart.mapper.CartMapper;
import com.meal.cart.repository.CartRepository;
import com.meal.cart.repository.httpclient.ProductItemClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartService {

    private static final int MAX_QUANTITY = 99;

    CartRepository cartRepository;
    CartMapper cartMapper;
    ProductItemClient productItemClient;

    @Transactional
    public CartResponse addProductToCart(AddProductToCartRequest request) {
        String userId = getCurrentUserId();

        int qty = Objects.isNull(request.quantity()) ? 1 : request.quantity();
        if (qty < 1 || qty > MAX_QUANTITY) {
            throw new AppException(ErrorCode.INVALID_QUANTITY);
        }

        FoodSnapshotResponse food = fetchFood(request.productId());
        SizeOption option = resolveSize(food, request.size());

        Cart cart = cartRepository.findByUserIdForUpdate(userId)
                .orElseGet(() -> Cart.builder()
                        .userId(userId)
                        .totalPrice(BigDecimal.ZERO)
                        .build());

        CartItem existing = cart.getItems().stream()
                .filter(i -> Objects.equals(i.getProductId(), request.productId())
                        && Objects.equals(i.getSize(), option.code()))
                .findFirst()
                .orElse(null);

        if (Objects.nonNull(existing)) {
            existing.setQuantity(Math.min(existing.getQuantity() + qty, MAX_QUANTITY));
            existing.setPrice(option.price());
        } else {
            cart.addItem(CartItem.builder()
                    .productId(request.productId())
                    .productName(food.name())
                    .image(food.image())
                    .size(option.code())
                    .price(option.price())
                    .quantity(qty)
                    .build());
        }

        return saveAndMap(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getMyCart() {
        String userId = getCurrentUserId();

        Cart cart = cartRepository.findByUserId(userId).orElseGet(() ->
                Cart.builder()
                        .userId(userId)
                        .totalPrice(BigDecimal.ZERO)
                        .build());

        return cartMapper.toCartResponse(cart);
    }

    @Transactional
    public CartResponse increaseQuantity(String itemId) {
        Cart cart = getCurrentUserCartForUpdate();
        CartItem item = findItem(cart, itemId);

        item.setQuantity(Math.min(item.getQuantity() + 1, MAX_QUANTITY));

        return saveAndMap(cart);
    }

    @Transactional
    public CartResponse decreaseQuantity(String itemId) {
        Cart cart = getCurrentUserCartForUpdate();
        CartItem item = findItem(cart, itemId);

        if (item.getQuantity() <= 1) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(item.getQuantity() - 1);
        }

        return saveAndMap(cart);
    }

    @Transactional
    public CartResponse removeItem(String itemId) {
        Cart cart = getCurrentUserCartForUpdate();
        CartItem item = findItem(cart, itemId);

        cart.getItems().remove(item);

        return saveAndMap(cart);
    }

    @Transactional
    public void deleteAllCart() {
        String userId = getCurrentUserId();

        cartRepository.findByUserIdForUpdate(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cart.setTotalPrice(BigDecimal.ZERO);
        });
    }

    private FoodSnapshotResponse fetchFood(String productId) {
        try {
            var response = productItemClient.getFoodById(productId);
            if (Objects.isNull(response) || Objects.isNull(response.getResults())) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }
            return response.getResults();
        } catch (FeignException.NotFound e) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        } catch (FeignException e) {
            log.error("product-service call failed, status={}", e.status());
            throw new AppException(ErrorCode.PRODUCT_SERVICE_UNAVAILABLE);
        }
    }

    private List<SizeOption> buildOptions(FoodSnapshotResponse food) {
        List<BigDecimal> prices = food.price();
        if (Objects.isNull(prices) || prices.isEmpty()) {
            throw new AppException(ErrorCode.SIZE_NOT_FOUND);
        }
        List<String> sizes = Objects.isNull(food.size()) ? List.of() : food.size();

        List<SizeOption> options = new ArrayList<>();
        for (int i = 0; i < prices.size(); i++) {
            BigDecimal price = prices.get(i);
            if (Objects.isNull(price) || price.signum() < 0) {
                log.error("Invalid price in product {} at index {}", food.id(), i);
                throw new AppException(ErrorCode.INVALID_PRODUCT_DATA);
            }
            String code = (i < sizes.size() && Objects.nonNull(sizes.get(i)))
                    ? sizes.get(i)
                    : (prices.size() > 1 ? "Size " + (i + 1) : "");
            options.add(new SizeOption(code, price));
        }
        return options;
    }

    private SizeOption resolveSize(FoodSnapshotResponse food, String requestedSize) {
        List<SizeOption> options = buildOptions(food);
        log.info("DEBUG product={} requested='{}' options={}", food.id(), requestedSize, options);
        String wanted = Objects.isNull(requestedSize)
                ? ""
                : requestedSize.trim();

        return options.stream()
                .filter(o -> o.code().equalsIgnoreCase(wanted))
                .findFirst()
                .or(() -> wanted.isEmpty() && options.size() == 1
                        ? Optional.of(options.get(0))
                        : Optional.empty())
                .orElseThrow(() -> new AppException(ErrorCode.SIZE_NOT_FOUND));
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (Objects.isNull(auth) || !auth.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return auth.getName();
    }

    private Cart getCurrentUserCartForUpdate() {
        return cartRepository.findByUserIdForUpdate(getCurrentUserId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));
    }

    private CartItem findItem(Cart cart, String itemId) {
        return cart.getItems().stream()
                .filter(i -> Objects.equals(i.getId(), itemId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
    }

    private CartResponse saveAndMap(Cart cart) {
        cart.recalculateTotal();
        Cart saved = cartRepository.saveAndFlush(cart);
        return cartMapper.toCartResponse(saved);
    }
}