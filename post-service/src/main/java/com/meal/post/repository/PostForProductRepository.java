package com.meal.post.repository;

import com.meal.post.entity.PostForProduct;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostForProductRepository extends MongoRepository<PostForProduct, String> {
}
