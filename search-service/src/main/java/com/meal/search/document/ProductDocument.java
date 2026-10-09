package com.meal.search.document;

import com.meal.search.constants.Type;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

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

    /** name: giữ dấu (khớp chính xác hơn) - name.folded: bỏ dấu (gõ "pho" vẫn ra "phở"). */
    @MultiField(
            mainField = @Field(type = FieldType.Text, analyzer = "vi_accent"),
            otherFields = @InnerField(suffix = "folded", type = FieldType.Text, analyzer = "vi_folded"))
    String name;

    @Field(type = FieldType.Keyword)
    String position;

    @Field(type = FieldType.Keyword)
    String timeWork;

    @Field(type = FieldType.Text, analyzer = "vi_folded")
    String description;

    @Field(type = FieldType.Double)
    BigDecimal price;

    /** Chỉ để trả về, không dùng để tìm kiếm nên không đánh index. */
    @Field(type = FieldType.Keyword, index = false)
    List<String> images;

    @Field(type = FieldType.Keyword)
    Type type;

    @Field(type = FieldType.Object)
    List<CategoryDocument> categories;
}
