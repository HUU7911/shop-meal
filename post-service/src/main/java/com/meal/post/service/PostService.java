package com.meal.post.service;

import com.meal.post.dto.PageResponse;
import com.meal.post.dto.request.PostRequest;
import com.meal.post.dto.response.FoodInfoResponse;
import com.meal.post.dto.response.PostForProductResponse;
import com.meal.post.dto.response.PostResponse;
import com.meal.post.dto.response.ProfileResponse;
import com.meal.post.entity.Post;
import com.meal.post.entity.PostForProduct;
import com.meal.post.exception.AppException;
import com.meal.post.exception.ErrorCode;
import com.meal.post.mapper.PostMapper;
import com.meal.post.repository.PostForProductRepository;
import com.meal.post.repository.PostRepository;
import com.meal.post.repository.httpclient.FileClient;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

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
    FileClient fileClient;

    public PostResponse createPost(PostRequest request, MultipartFile file) throws IOException {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        var image = fileClient.uploadMedia(file).getResults();

        Post post = Post.builder()
                .postTitle(request.getPostTitle())
                .postContent(request.getPostContent())
                .userId(userId)
                .createdDate(Instant.now())
                .modifiedDate(Instant.now())
                .imageUrl(image.getUrl())
                .build();

        post = postRepository.save(post);

        return postMapper.toPostResponse(post);
    }

    public PostForProductResponse createPostForProduct(PostRequest request, String productId) {
        FoodInfoResponse food = fetchFood(productId);
        Instant now = Instant.now();
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        PostForProduct saved = postForProductRepository.save(
                PostForProduct.builder()
                        .userId(userId)
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

    public List<PostForProductResponse> getAllPostForProduct() {
        return postForProductRepository.findAll().stream().map(postForProduct -> {
            var response = PostForProductResponse.builder()
                    .id(postForProduct.getId())
                    .userId(postForProduct.getUserId())
                    .productId(postForProduct.getProductId())
                    .productName(postForProduct.getProductName())
                    .postTitle(postForProduct.getPostTitle())
                    .postContent(postForProduct.getPostContent())
                    .createdDate(postForProduct.getCreatedDate())
                    .modifiedDate(postForProduct.getModifiedDate())
                    .build();

            return response;
        }).toList();
    }

    public PageResponse<PostResponse> getMyPost(int page, int size) {
        int pageNumber = Math.max(page, 1);
        int pageSize = Math.clamp(size, 1, MAX_PAGE_SIZE);
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        ProfileResponse userProfile = null;

        try {
            userProfile = profileClient.getProfile(userId).getResults();
        }catch (FeignException fe) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }

        Pageable pageable = PageRequest.of(
                pageNumber - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdDate"));

        Page<Post> result = postRepository.findAllByUserId(userId, pageable);
        String username = userProfile != null ? userProfile.getUsername() : null;

        List<PostResponse> data = result.getContent().stream().map(post -> {
                    var response = postMapper.toPostResponse(post);
                    response.setCreated(dateTimeFormater.format(post.getCreatedDate()));
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

    public PageResponse<PostResponse> getPostsForUsers(int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdDate");
        Pageable pageable = PageRequest.of(page-1, size, sort);

        var response = postRepository.findAll(pageable);

        List<PostResponse> data = response.getContent().stream().map(post -> {
            var dataResponse = postMapper.toPostResponse(post);
            dataResponse.setCreated(dateTimeFormater.format(post.getCreatedDate()));
            return dataResponse;
        }).toList();

        return PageResponse.<PostResponse>builder()
                .currentPage(page)
                .pageSize(response.getSize())
                .totalPage(response.getTotalPages())
                .totalElements(response.getTotalElements())
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
}