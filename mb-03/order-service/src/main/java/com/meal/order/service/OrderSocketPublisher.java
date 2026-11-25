package com.meal.order.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.meal.event.dto.OrderCreatedEvent;
import com.meal.event.dto.OrderStatusChangedEvent;
import com.meal.order.controller.SocketHandler;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderSocketPublisher {

    SocketIOServer socketIOServer;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onOrderCreated(OrderCreatedEvent event) {
        try {
            socketIOServer.getRoomOperations(SocketHandler.STAFF_ROOM)
                    .sendEvent("order:created", Map.of(
                            "orderId", event.orderId(),
                            "orderCode", event.orderCode()));
        } catch (Exception e) {
            log.warn("Could not emit order:created: {}", e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onStatusChanged(OrderStatusChangedEvent event) {
        try {
            Map<String, Object> payload = Map.of(
                    "orderId", event.orderId(),
                    "orderCode", event.orderCode(),
                    "status", event.status().name());

            socketIOServer.getRoomOperations(SocketHandler.userRoom(event.userId()))
                    .sendEvent("order:status_changed", payload);
            socketIOServer.getRoomOperations(SocketHandler.STAFF_ROOM)
                    .sendEvent("order:status_changed", payload);
        } catch (Exception e) {
            log.warn("Could not emit order:status_changed: {}", e.getMessage());
        }
    }
}