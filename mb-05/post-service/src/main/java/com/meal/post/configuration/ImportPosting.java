package com.meal.post.configuration;

import com.meal.post.entity.Post;
import com.meal.post.entity.PostForProduct;
import com.meal.post.repository.PostRepository;
import com.meal.post.repository.PostForProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImportPosting{

    PostRepository postRepository;
    PostForProductRepository postForProductRepository;
    ObjectMapper objectMapper;

    @NonFinal
    private static final String DATA_PATH = "data-source/post/";

    @Bean
    public ApplicationRunner applicationRunner() {
        return _ -> {
            if (postRepository.count() == 0 || postForProductRepository.count() == 0) {
                importPosts();
                importPostsForProduct();
            }
        };
    }

    private void importPosts() throws Exception {
        File file = new File(DATA_PATH + "post.json");

        if (!file.exists()) {
            log.warn("File post.json not found: {}", file.getAbsolutePath());
            return;
        }

        Post[] posts = objectMapper.readValue(file, Post[].class);

        List<Post> newPosts = Arrays.stream(posts)
                .filter(post -> post.getId() != null)
                .filter(post -> !postRepository.existsById(post.getId()))
                .toList();

        if (!newPosts.isEmpty()) {
            postRepository.saveAll(newPosts);
        }
    }

    private void importPostsForProduct() throws Exception {
        File file = new File(DATA_PATH + "post_for_product.json");

        if (!file.exists()) {
            log.warn("File post_for_product.json not found: {}", file.getAbsolutePath());
            return;
        }

        PostForProduct[] posts = objectMapper.readValue(file, PostForProduct[].class);

        List<PostForProduct> newPosts = Arrays.stream(posts)
                .filter(post -> post.getId() != null)
                .filter(post -> !postForProductRepository.existsById(post.getId()))
                .toList();

        if (!newPosts.isEmpty()) {
            postForProductRepository.saveAll(newPosts);
        }

        log.info("Imported {} product posts.", newPosts.size());
    }
}
