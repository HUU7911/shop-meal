package com.meal.payment.entity;

import com.meal.payment.constant.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true)
    String orderId;

    @Column(nullable = false, unique = true)
    Long orderCode;

    @Column(nullable = false)
    BigDecimal amount;

    String paymentLinkId;

    String checkoutUrl;

    @Enumerated(EnumType.STRING)
    PaymentStatus status;

    String transactionReference;

    LocalDateTime createdAt;

    LocalDateTime paidAt;
}