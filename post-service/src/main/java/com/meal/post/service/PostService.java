package com.meal.post.service;

import com.meal.post.dto.PageResponse;
import com.meal.post.dto.request.PostRequest;
import com.meal.post.dto.response.PostForProductResponse;
import com.meal.post.dto.response.PostResponse;
import com.meal.post.dto.response.ProfileResponse;
import com.meal.post.entity.PostForProduct;
import com.meal.post.exception.AppException;
import com.meal.post.exception.ErrorCode;
import com.meal.post.mapper.PostMapper;
import com.meal.post.repository.PostForProductRepository;
import com.meal.post.repository.PostRepository;
import com.meal.post.repository.httpclient.ProductClient;
import com.meal.post.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostService {

    PostMapper postMapper;
    PostRepository postRepository;
    ProfileClient profileClient;
    ProductClient productClient;
    PostForProductRepository postForProductRepository;

    @Transactional
    public PostResponse createPost(PostRequest postRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        var post = postMapper.toPostResponse(postRequest);
        post.setUserId(authentication.getName());
        post.setCreatedDate(Instant.now());
        post.setModifiedDate(Instant.now());

        post = postRepository.save(post);

        return postMapper.toPostResponse(post);
    }

    @Transactional
    public PostForProductResponse createPostForProduct(PostRequest request, String productId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        var product = productClient.getFoodInfo(productId);
        if (Objects.isNull(product)) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }

        var postInfor = PostForProduct.builder()
                .userId(authentication.getName())
                .productId(productId)
                .productName(product.getResults().name())
                .postTitle(request.getPostTitle())
                .postContent(request.getPostContent())
                .createdDate(Instant.now())
                .modifiedDate(Instant.now())
                .build();

        postInfor = postForProductRepository.save(postInfor);

        return PostForProductResponse.builder()
                .id(postInfor.getId())
                .userId(postInfor.getUserId())
                .productId(postInfor.getProductId())
                .productName(postInfor.getProductName())
                .postTitle(postInfor.getPostTitle())
                .postContent(postInfor.getPostContent())
                .createdDate(postInfor.getCreatedDate())
                .modifiedDate(postInfor.getModifiedDate())
                .build();
    }

    public PageResponse<PostResponse> getMyPost(int page, int size) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        ProfileResponse profileResponse = null;

        try {
            profileResponse = profileClient.getProfile(userId).getResults();
        }catch (Exception e){
           throw new RuntimeException(e.fillInStackTrace());
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "createdDate");
        Pageable pageable = PageRequest.of(page-1, size, sort);

        var response = postRepository.findAllByUserId(userId, pageable);

        String username = !Objects.isNull(profileResponse)
                ? profileResponse.getUsername()
                : null;
        var responseList = response.getContent().stream().map(post -> {
            var result = postMapper.toPostResponse(post);
            result.setUserName(username);
            return result;
        }).toList();

        return PageResponse.<PostResponse>builder()
                .currentPage(page)
                .pageSize(response.getSize())
                .totalElements(response.getTotalElements())
                .data(responseList)
                .build();
    }
}
