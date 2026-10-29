package com.meal.search.kafka;

import com.meal.even.dto.CategoryEvent;
import com.meal.even.dto.ProductEvent;
import com.meal.search.document.CategoryDocument;
import com.meal.search.document.ProductDocument;
import com.meal.search.repository.ProductSearchRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KafkaConsumer {

    ProductSearchRepository productSearchRepository;

    @KafkaListener(
            topics = "${app.kafka.product-topic:product-event}",
            groupId = "${spring.kafka.consumer.group-id:search-service}")
    public void consume(ProductEvent event) {
        if (Objects.isNull(event)
                || !StringUtils.hasText(event.getId())
                || !StringUtils.hasText(String.valueOf(event.getEventType())))
        {
            log.warn("Bỏ qua product event không hợp lệ: {}", event);
            return;
        }

        switch (event.getEventType().toUpperCase(Locale.ROOT)) {
            case "CREATED", "UPDATED", "UPDATE_PRODUCT" -> productSearchRepository.save(toDocument(event));
            case "DELETED" -> productSearchRepository.deleteById(event.getId());
            default -> log.warn("Bỏ qua eventType không hỗ trợ: {} (productId={})",
                    event.getEventType(), event.getId());
        }
    }

    private ProductDocument toDocument(ProductEvent event) {
        return ProductDocument.builder()
                .id(event.getId())
                .name(event.getName())
                .timeWork(event.getTimeWork())
                .position(event.getPosition())
                .description(event.getDescription())
                .size(event.getSize())
                .price(event.getPrice())
                .images(event.getImages())
                .type(event.getType())
                .categories(toCategoryDocuments(event.getCategories()))
                .build();
    }

    private List<CategoryDocument> toCategoryDocuments(List<CategoryEvent> categories) {
        if (Objects.isNull(categories)) {
            return List.of();
        }
        return categories.stream()
                .map(c -> CategoryDocument.builder()
                        .name(c.getName())
                        .description(c.getDescription())
                        .build())
                .toList();
    }
}
