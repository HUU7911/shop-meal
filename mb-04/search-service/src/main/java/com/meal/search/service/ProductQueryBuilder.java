package com.meal.search.service;

import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.meal.contract.constant.Type;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class ProductQueryBuilder {

    private static final String[] SEARCH_FIELDS = {
            "name^3",
            "name.folded^2",
            "categories.name",
            "description"
    };

    public Query build(
            String keyword,
            String category,
            Type type,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        List<Query> filters = new ArrayList<>();

        addCategoryFilter(filters, category);
        addTypeFilter(filters, type);
        addPriceFilter(filters, minPrice, maxPrice);

        return Query.of(q -> q.bool(b -> b
                .must(buildKeywordQuery(keyword))
                .filter(filters)));
    }

    private Query buildKeywordQuery(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return Query.of(q -> q.matchAll(m -> m));
        }

        return Query.of(q -> q.multiMatch(m -> m
                .query(keyword.trim())
                .fields(List.of(SEARCH_FIELDS))
                .operator(Operator.And)));
    }

    private void addCategoryFilter(List<Query> filters, String category) {
        if (!StringUtils.hasText(category)) return;

        filters.add(Query.of(q -> q.term(t -> t
                .field("categories.name.raw")
                .value(category.trim()))));
    }

    private void addTypeFilter(List<Query> filters, Type type) {
        if (type == null) return;

        filters.add(Query.of(q -> q.term(t -> t
                .field("type")
                .value(type.name()))));
    }

    private void addPriceFilter(
            List<Query> filters,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        if (minPrice == null && maxPrice == null) return;

        filters.add(Query.of(q -> q.range(r -> r.number(n -> {
            n.field("price");
            if (minPrice != null) n.gte(minPrice.doubleValue());
            if (maxPrice != null) n.lte(maxPrice.doubleValue());
            return n;
        }))));
    }
}
