package com.meal.search.kafka;

import com.meal.even.dto.ProductEvent;
import com.meal.search.document.ProductDocument;
import com.meal.search.repository.ProductSearchRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KafkaConsumer {

    ProductSearchRepository productSearchRepository;

    @KafkaListener(topics = "product-event", groupId = "search-service")
    public void consume(ProductEvent event) {
        if (event.getEventType().equals("CREATED") ||  event.getEventType().equals("UPDATED")) {

            ProductDocument productDocument = ProductDocument.builder()
                    .id(event.getId())
                    .name(event.getName())
                    .position(event.getPosition())
                    .description(event.getDescription())
                    .price(event.getPrice())
                    .images(event.getImages())
                    .timeWork(event.getTimeWork())
                    .type(event.getType())
                    .build();

            productSearchRepository.save(productDocument);
        }

        if (event.getEventType().equals("DELETED")) {
            productSearchRepository.deleteById(event.getId());
        }
    }
}
