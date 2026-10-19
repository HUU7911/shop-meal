package com.meal.post.controller;

import com.meal.post.dto.ApiResponse;
import com.meal.post.dto.PageResponse;
import com.meal.post.dto.request.PostRequest;
import com.meal.post.dto.request.PostUpdateRequest;
import com.meal.post.dto.response.PostForProductResponse;
import com.meal.post.dto.response.PostResponse;
import com.meal.post.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostController {

    PostService postService;

    @PostMapping("/create")
    ApiResponse<PostResponse> createPost(
            @RequestPart("request") PostRequest request,
            @RequestPart("file")MultipartFile file
    ) throws IOException {
        return ApiResponse.<PostResponse>builder()
                .results(postService.createPost(request, file))
                .build();
    }

    @GetMapping("/my-posts")
    ApiResponse<PageResponse<PostResponse>> getMyPosts(
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "5") int size) {
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .results(postService.getMyPost(page, size))
                .build();
    }

    @GetMapping("/getAllPost")
    ApiResponse<PageResponse<PostResponse>> getAllPost(
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "5") int size
    ){
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .results(postService.getPostsForUsers(page, size))
                .build();
    }

    @PostMapping("/product/create")
    ApiResponse<PostForProductResponse> createPostForProduct(
            @RequestBody PostRequest postRequest,
            @RequestParam("Id") String Id
    ) {
        return ApiResponse.<PostForProductResponse>builder()
                .results(postService.createPostForProduct(postRequest, Id))
                .build();
    }

    @GetMapping("/getPostForProduct")
    ApiResponse<List<PostForProductResponse>> getPostForProduct() {
        return ApiResponse.<List<PostForProductResponse>>builder()
                .results(postService.getAllPostForProduct())
                .build();
    }

    @DeleteMapping("/delete/myPost")
    ApiResponse<Void> deleteMyPost() {
        postService.deleteMyPost();
        return ApiResponse.<Void>builder()
                .message("delete my post success")
                .build();
    }

    @DeleteMapping("delete/product/{productId}")
    ApiResponse<Void> deleteProduct(@PathVariable String productId) {
        postService.deletePostForProduct(productId);
        return ApiResponse.<Void>builder()
                .message("delete product success")
                .build();
    }

    @PutMapping("/update/my-post/{id}")
    ApiResponse<PostResponse> updateMyPost(@PathVariable String id, @RequestBody PostUpdateRequest request) {
        return ApiResponse.<PostResponse>builder()
                .results(postService.updatePost(id, request))
                .build();
    }
}
