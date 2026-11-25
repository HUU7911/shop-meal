package com.meal.product.configuration;

import com.meal.product.repository.CategoryRepository;
import com.meal.product.repository.FoodRepository;
import com.meal.product.service.ProductImportService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class ApplicationInitConfig {

    @Bean
    public ApplicationRunner applicationRunner(
            FoodRepository foodRepository,
            ProductImportService service,
            CategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() == 0) {
                service.importCategories();
            }

            if (foodRepository.count() == 0) {
                service.importFoods();
            }
        };
    }
}
