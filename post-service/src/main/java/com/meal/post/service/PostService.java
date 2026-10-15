package com.meal.post.service;

import com.meal.post.dto.PageResponse;
import com.meal.post.dto.request.PostRequest;
import com.meal.post.dto.response.FoodInfoResponse;
import com.meal.post.dto.response.PostForProductResponse;
import com.meal.post.dto.response.PostResponse;
import com.meal.post.entity.Post;
import com.meal.post.entity.PostForProduct;
import com.meal.post.exception.AppException;
import com.meal.post.exception.ErrorCode;
import com.meal.post.mapper.PostMapper;
import com.meal.post.repository.PostForProductRepository;
import com.meal.post.repository.PostRepository;
import com.meal.post.repository.httpclient.ProductClient;
import com.meal.post.repository.httpclient.ProfileClient;
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

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostService {

    private static final int MAX_PAGE_SIZE = 50;

    PostMapper postMapper;
    PostRepository postRepository;
    ProfileClient profileClient;
    ProductClient productClient;
    PostForProductRepository postForProductRepository;
    DateTimeFormater dateTimeFormater;

    public PostResponse createPost(PostRequest request) {
        Instant now = Instant.now();

        Post post = postMapper.toPostResponse(request);
        post.setUserId(currentUserId());
        post.setUserName(fetchUsername(currentUserId()));
        post.setCreatedDate(now);
        post.setModifiedDate(now);

        return postMapper.toPostResponse(postRepository.save(post));
    }

    public PostForProductResponse createPostForProduct(PostRequest request, String productId) {
        FoodInfoResponse food = fetchFood(productId);
        Instant now = Instant.now();

        PostForProduct saved = postForProductRepository.save(
                PostForProduct.builder()
                        .userId(currentUserId())
                        .productId(productId)
                        .productName(food.name())
                        .postTitle(request.getPostTitle())
                        .postContent(request.getPostContent())
                        .createdDate(now)
                        .modifiedDate(now)
                        .build());

        return PostForProductResponse.builder()
                .id(saved.getId())
                .userId(saved.getUserId())
                .productId(saved.getProductId())
                .productName(saved.getProductName())
                .postTitle(saved.getPostTitle())
                .postContent(saved.getPostContent())
                .createdDate(saved.getCreatedDate())
                .modifiedDate(saved.getModifiedDate())
                .build();
    }

    public PageResponse<PostResponse> getMyPost(int page, int size) {
        int pageNumber = Math.max(page, 1);
        int pageSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        String userId = currentUserId();
        Pageable pageable = PageRequest.of(
                pageNumber - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdDate"));

        Page<Post> result = postRepository.findAllByUserId(userId, pageable);

        String username = result.isEmpty() ? null : fetchUsername(userId);

        var data = result.getContent().stream().map(post -> {
                    var response = postMapper.toPostResponse(post);
                    response.setCreatedDate(dateTimeFormater.format(post.getCreatedDate()));
                    response.setUserName(username);
                    return response;
                }).toList();

        return PageResponse.<PostResponse>builder()
                .currentPage(pageNumber)
                .pageSize(result.getSize())
                .totalPage(result.getTotalPages())
                .totalElements(result.getTotalElements())
                .data(data)
                .build();
    }

    private FoodInfoResponse fetchFood(String productId) {
        try {
            var response = productClient.getFoodInfo(productId);
            if (response == null || response.getResults() == null) {
                throw new AppException(ErrorCode.NOT_FOUND);
            }
            return response.getResults();
        } catch (FeignException.NotFound e) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
    }

    private String fetchUsername(String userId) {
        try {
            var response = profileClient.getProfile(userId);
            return (response != null && response.getResults() != null)
                    ? response.getResults().getUsername()
                    : null;
        } catch (Exception e) {
            log.warn("Không lấy được profile của user {}: {}", userId, e.getMessage());
            return null;
        }
    }

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}