package com.meal.post.repository;

import com.meal.post.entity.Banner;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BannerRepository extends MongoRepository<Banner, String> {
}
