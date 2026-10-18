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
@Document(collection = "post_product")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostForProduct {

    @MongoId
    String id;

    String userId;
    String productId;
    String productName;
    String postTitle;
    String postContent;
    Instant createdDate;
    Instant modifiedDate;
}
