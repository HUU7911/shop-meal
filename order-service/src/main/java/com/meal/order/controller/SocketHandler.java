package com.meal.order.controller;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.meal.order.dto.client.IntrospectRequest;
import com.meal.order.service.IdentityService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.text.ParseException;
import java.util.Arrays;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SocketHandler {

    public static final String STAFF_ROOM = "staff";
    private static final Set<String> STAFF_ROLES = Set.of("ROLE_ADMIN", "ROLE_STAFF");

    SocketIOServer socketIOServer;
    IdentityService identityService;

    public static String userRoom(String userId) {
        return "user:" + userId;
    }

    @OnConnect
    public void clientConnect(SocketIOClient client) {
        String token = client.getHandshakeData().getSingleUrlParam("token");

        if (!StringUtils.hasText(token)) {
            log.warn("Socket connection rejected: missing token, sessionId={}", client.getSessionId());
            client.disconnect();
            return;
        }

        var introspect = identityService.introspectResponse(
                IntrospectRequest.builder().token(token).build());

        if (!introspect.isValid()) {
            log.warn("Socket connection rejected: invalid token, sessionId={}", client.getSessionId());
            client.disconnect();
            return;
        }

        try {
            // Token đã được identity-service xác thực ở trên, nên chỉ cần đọc claims để biết userId và role.
            JWTClaimsSet claims = SignedJWT.parse(token).getJWTClaimsSet();
            String userId = claims.getSubject();
            String scope = claims.getStringClaim("scope");

            // joinRoom idempotent: @OnConnect bị gọi 2 lần/kết nối cũng không sao
            client.joinRoom(userRoom(userId));

            boolean isStaff = scope != null && Arrays.stream(scope.split("[\\s,]+"))
                    .anyMatch(STAFF_ROLES::contains);
            if (isStaff) {
                client.joinRoom(STAFF_ROOM);
            }

            log.info("Client connected: sessionId={}, userId={}, staff={}",
                    client.getSessionId(), userId, isStaff);
        } catch (ParseException e) {
            log.warn("Socket connection rejected: unreadable token, sessionId={}", client.getSessionId());
            client.disconnect();
        }
    }

    @OnDisconnect
    public void clientDisconnect(SocketIOClient client) {
        log.info("Client disconnected: {}", client.getSessionId());
    }

    @PostConstruct
    public void init() {
        socketIOServer.addListeners(this);
        socketIOServer.start();
        log.info("Socket Server started");
    }

    @PreDestroy
    public void stopServer() {
        socketIOServer.stop();
        log.info("Socket Server stopped");
    }
}