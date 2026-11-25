package com.meal.file.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Data
@Document(collection = "file")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileMgmt {

    @MongoId
    String id;

    String ownerId;
    String contentType;
    String md5Checksum;
    long size;
    String path;
}
