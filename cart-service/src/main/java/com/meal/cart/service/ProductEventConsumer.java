package com.meal.cart.service;

import com.meal.cart.entity.ProductSnapshot;
import com.meal.cart.repository.CartItemRepository;
import com.meal.cart.repository.ProductSnapshotRepository;
import com.meal.event.dto.ProductEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductEventConsumer {

    private final ProductSnapshotRepository snapshotRepository;
    private final CartItemRepository cartItemRepository;

    @KafkaListener(topics = "product-event")
    @Transactional
    public void onProductEvent(ProductEvent event) {
        if (event == null || event.getId() == null || event.getEventType() == null) return;

        switch (event.getEventType()) {
            case "CREATED" -> {
                String image = (event.getImages() == null || event.getImages().isEmpty())
                        ? null : event.getImages().getFirst();
                snapshotRepository.save(ProductSnapshot.builder()
                        .foodId(event.getId())
                        .name(event.getName())
                        .price(event.getPrice())
                        .image(image)
                        .build());
                log.info("Product snapshot upserted: {}", event.getId());
            }
            case "DELETED" -> {
                cartItemRepository.deleteByFoodId(event.getId());
                snapshotRepository.deleteById(event.getId());
                log.info("Product snapshot removed: {}", event.getId());
            }
            default -> log.warn("Unknown product event type: {}", event.getEventType());
        }
    }
}
