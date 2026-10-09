package com.meal.file.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileInfor {

    String name;
    String ownerId;
    String contentType;
    long size;
    String md5Checksum;
    String path;
    String url;
}
