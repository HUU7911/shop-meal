package com.meal.post.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "banner")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Banner {

    @MongoId
    String id;

    String url;
}
