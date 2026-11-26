package com.meal.search.service;

import com.meal.contract.common.PageResponse;
import com.meal.contract.constant.SortOption;
import com.meal.contract.constant.Type;
import com.meal.search.document.ProductDocument;
import com.meal.search.exception.AppException;
import com.meal.search.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductSearchService {

    static final int MAX_PAGE_SIZE = 50;

    ElasticsearchOperations elasticsearchOperations;
    ProductQueryBuilder productQueryBuilder;

    @Cacheable(
            cacheNames = "search",
            key = "T(java.util.Objects).toString(#keyword, '') + ':' + " +
                    "T(java.util.Objects).toString(#category, '') + ':' + " +
                    "#type + ':' + #minPrice + ':' + #maxPrice + ':' + " +
                    "#sortOption + ':' + #page + ':' + #size"
    )
    public PageResponse<ProductDocument> searchProduct(
            String keyword, String category,
            Type type, BigDecimal minPrice,
            BigDecimal maxPrice, SortOption sortOption,
            int page, int size) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);

        if (minPrice != null && maxPrice != null
                && minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException("minPrice must not exceed maxPrice");
        }

        NativeQuery query = NativeQuery.builder()
                .withQuery(productQueryBuilder.build(keyword, category, type, minPrice, maxPrice))
                .withPageable(PageRequest.of(safePage, safeSize, toSort(sortOption)))
                .build();

        try {
            SearchHits<ProductDocument> hits = elasticsearchOperations.search(query, ProductDocument.class);
            List<ProductDocument> content = hits.stream()
                    .map(SearchHit::getContent)
                    .toList();
            long total = hits.getTotalHits();

            return PageResponse.<ProductDocument>builder()
                    .currentPage(safePage)
                    .totalPage((int) Math.ceil((double) total / safeSize))
                    .totalElements(total)
                    .data(content)
                    .build();

        } catch (DataAccessException e) {
            log.error("Elasticsearch search failed: keyword={}, category={}",
                    keyword, category, e);
            throw new AppException(ErrorCode.SEARCH_UNAVAILABLE);
        }
    }

    private Sort toSort(SortOption option) {
        if (option == null || option == SortOption.RELEVANCE) {
            return Sort.unsorted();
        }

        return switch (option) {
            case PRICE_ASC -> Sort.by(Sort.Order.asc("price"));
            case PRICE_DESC -> Sort.by(Sort.Order.desc("price"));
            default -> Sort.unsorted();
        };
    }
}
