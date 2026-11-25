package com.meal.post.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "post")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Post {

    @MongoId
    String id;

    String userId;
    String postTitle;
    String postContent;
    String imageUrl;
    Instant createdDate;
    Instant modifiedDate;
}
