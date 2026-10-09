package com.meal.search.document;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

@Document(indexName = "categories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryDocument {

    @MultiField(
            mainField = @Field(type = FieldType.Text, analyzer = "vi_folded"),
            otherFields = @InnerField(suffix = "raw", type = FieldType.Keyword))
    String name;

    @Field(type = FieldType.Text, analyzer = "vi_folded")
    String description;
}