package com.meal.search.service;

import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import com.meal.search.constants.Type;
import com.meal.search.document.ProductDocument;
import com.meal.search.dto.PageResponse;
import com.meal.search.exception.AppException;
import com.meal.search.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductSearchService {

    private static final int MAX_PAGE_SIZE = 50;

    ElasticsearchOperations elasticsearchOperations;

    public enum SortOption { RELEVANCE, PRICE_ASC, PRICE_DESC }

    public PageResponse<ProductDocument> searchProduct(
            String keyword,
            String category,
            Type type,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            SortOption sortOption,
            int page,
            int size) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);

        NativeQuery query = NativeQuery.builder()
                .withQuery(q -> q.bool(b -> {
                    if (StringUtils.hasText(keyword)) {
                        b.must(m -> m.multiMatch(mm -> mm
                                .query(keyword.trim())
                                .fields("name^3", "name.folded^2", "categories.name", "description")
                                .operator(Operator.And)));
                    } else {
                        b.must(m -> m.matchAll(ma -> ma));
                    }

                    if (StringUtils.hasText(category)) {
                        b.filter(f -> f.term(t -> t.field("categories.name.raw").value(category.trim())));
                    }
                    if (type != null) {
                        b.filter(f -> f.term(t -> t.field("type").value(type.name())));
                    }
                    if (minPrice != null || maxPrice != null) {
                        b.filter(f -> f.range(r -> r.number(n -> {
                            n.field("price");
                            if (minPrice != null) n.gte(minPrice.doubleValue());
                            if (maxPrice != null) n.lte(maxPrice.doubleValue());
                            return n;
                        })));
                    }
                    return b;
                }))
                .withPageable(PageRequest.of(safePage, safeSize, toSort(sortOption)))
                .build();

        try {
            SearchHits<ProductDocument> hits = elasticsearchOperations.search(query, ProductDocument.class);
            List<ProductDocument> content = hits.stream().map(SearchHit::getContent).toList();
            long total = hits.getTotalHits();
            int totalPages = (int) Math.ceil((double) total / safeSize);
            return PageResponse.<ProductDocument>builder()
                    .totalPage(totalPages)
                    .totalElements(total)
                    .data(content)
                    .build();
        } catch (DataAccessException e) {
            log.error("Elasticsearch search failed: keyword={}, category={}", keyword, category, e);
            throw new AppException(ErrorCode.SEARCH_UNAVAILABLE);
        }
    }

    private Sort toSort(SortOption option) {
        if (Objects.equals(option, null)) {
            return Sort.unsorted();
        }
        return switch (option) {
            case PRICE_ASC -> Sort.by(Sort.Order.asc("price"));
            case PRICE_DESC -> Sort.by(Sort.Order.desc("price"));
            case RELEVANCE -> Sort.unsorted();
        };
    }
}
