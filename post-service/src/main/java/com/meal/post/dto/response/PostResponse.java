package com.meal.post.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {

    String id;
    String userId;
    String userName;
    String postTitle;
    String postContent;
    String created;
    Instant createdDate;
    Instant modifiedDate;
}
