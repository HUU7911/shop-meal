package com.meal.search.document;

import com.meal.search.constants.Type;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "products")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setting(settingPath = "elasticsearch/product-settings.json")
public class ProductDocument {

    @Id
    String id;

    @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer")
    String name;

    @Field(type = FieldType.Keyword)
    String position;

    String timeWork;

    @Field(type = FieldType.Keyword)
    String description;

    @Field(type = FieldType.Double)
    BigDecimal price;

    @Field(type = FieldType.Keyword)
    List<String> images;

    Type type;

    @Field(type = FieldType.Keyword)
    List<CategoryDocument> categories;
}
