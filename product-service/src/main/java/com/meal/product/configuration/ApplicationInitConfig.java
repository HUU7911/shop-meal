package com.meal.product.configuration;

import com.meal.product.entity.Category;
import com.meal.product.repository.CategoriesRepository;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Slf4j
@Component
public class ApplicationInitConfig {

    @NonFinal
    private String[] categories = {
            "CAFE",
            "NOODLE",
            "RICE",
            "MILK_TEA"
    };

    @Bean
    public ApplicationRunner initApplicationRunner(CategoriesRepository repository) {
        return args -> {
            if (repository.findAllById(List.of(categories)).isEmpty()) {
                for(String category : categories) {
                    Category categories = Category.builder()
                            .name(category)
                            .description("has " + category.toLowerCase(Locale.ROOT))
                            .build();
                    repository.save(categories);
                }
            }
            log.info("Category initial by name: {}", (Object) categories);
        };
    }
}
