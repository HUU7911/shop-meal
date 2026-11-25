package com.meal.post.mapper;

import com.meal.post.dto.request.PostRequest;
import com.meal.post.dto.request.PostUpdateRequest;
import com.meal.post.dto.response.PostResponse;
import com.meal.post.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PostMapper {

    Post toPostResponse(PostRequest request);
    PostResponse toPostResponse(Post post);
    void updatePost(@MappingTarget Post post, PostUpdateRequest request);
}
