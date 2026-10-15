package com.meal.post.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostForProductResponse {

    String id;
    String userId;
    String productId;
    String productName;
    String postTitle;
    String postContent;
    Instant createdDate;
    Instant modifiedDate;
}
