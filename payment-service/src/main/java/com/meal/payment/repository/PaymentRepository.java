package com.meal.payment.repository;

import com.meal.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByOrderCode(Long orderCode);

    Optional<Payment> findByOrderId(String orderId);
}