package com.meal.order.service;

import com.meal.event.dto.NotificationEvent;
import com.meal.order.entity.Order;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import java.text.NumberFormat;
import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderNotificationPublisher {

    KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    public void publishOrderCreated(Order order, String email) {
        try {
            NotificationEvent event = NotificationEvent.builder()
                    .chanel("EMAIL")
                    .recipient(email)
                    .subject("Xác nhận đơn hàng " + order.getOrderCode())
                    .body(buildBody(order))
                    .build();

            kafkaTemplate.send("order-notification", order.getId(), event)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("publish order notification failed, orderCode={}", order.getOrderCode(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("publish order notification error, orderCode={}", order.getOrderCode(), e);
        }
    }

    private String buildBody(Order order) {
        String total = NumberFormat.getInstance(Locale.of("vi", "VN")).format(order.getTotalAmount());

        StringBuilder items = new StringBuilder();
        order.getItems().forEach(i -> items
                .append("<li>")
                .append(HtmlUtils.htmlEscape(i.getProductName()))
                .append(" x ")
                .append(i.getQuantity())
                .append("</li>"));

        return "<h3>Cảm ơn bạn đã đặt hàng!</h3>"
                + "<p>Mã đơn: <b>" + HtmlUtils.htmlEscape(order.getOrderCode()) + "</b></p>"
                + "<p>Người nhận: " + HtmlUtils.htmlEscape(order.getReceiverName()) + "</p>"
                + "<p>Địa chỉ: " + HtmlUtils.htmlEscape(order.getAddress()) + "</p>"
                + "<ul>" + items + "</ul>"
                + "<p>Tổng tiền: <b>" + total + " VND</b></p>"
                + "<p>Thanh toán: " + order.getPaymentMethod() + "</p>";
    }
}
