package com.meal.identity.repository;

import com.meal.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}
