package com.meal.payment.entity;

import com.meal.payment.constant.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

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
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String orderId;

    @Column(nullable = false, unique = true)
    private Long orderCode;

    @Column(nullable = false)
    private BigDecimal amount;

    private String paymentLinkId;

    private String checkoutUrl;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String transactionReference;

    private LocalDateTime createdAt;

    private LocalDateTime paidAt;
}