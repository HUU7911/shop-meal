package com.meal.search.service;

import com.meal.search.document.ProductDocument;
import com.meal.search.exception.AppException;
import com.meal.search.exception.ErrorCode;
import com.meal.search.repository.ProductSearchRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductSearchService {

    ElasticsearchOperations elasticsearchOperations;

    public List<ProductDocument> searchProduct(String keyword, String id) {
        try {
            Criteria criteria = new Criteria("name").matches(keyword)
                    .or(new Criteria("categoryName").matches(keyword));

            if (Objects.nonNull(id)) {
                criteria = criteria.and(new Criteria("categoryId").is(id));
            }

            Query query = new CriteriaQuery(criteria);
            SearchHits<ProductDocument> hits = elasticsearchOperations.search(query, ProductDocument.class);
            return hits.stream().map(SearchHit::getContent).toList();
        }catch (Exception e){
            e.printStackTrace();
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }
}
