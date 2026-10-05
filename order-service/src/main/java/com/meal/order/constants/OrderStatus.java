package com.meal.order.constants;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    COMPLETED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus next) {
        return switch (this) {
            case PENDING -> next == CONFIRMED || next == CANCELLED;
            case CONFIRMED -> next == PROCESSING || next == CANCELLED;
            case PROCESSING -> next == COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };
    }
}
