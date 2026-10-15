package com.meal.post.mapper;

import com.meal.post.dto.request.PostRequest;
import com.meal.post.dto.response.PostResponse;
import com.meal.post.entity.Post;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostMapper {

    Post toPostResponse(PostRequest request);
    PostResponse toPostResponse(Post post);
}
