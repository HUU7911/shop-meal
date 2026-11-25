package com.meal.order.configuration;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocketIOConfig {
    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration configuration = new com.corundumstudio.socketio.Configuration();
        configuration.setPort(8099);
        configuration.setOrigin("http://localhost:5713");
        configuration.setOrigin("http://localhost:3000");

        return new SocketIOServer(configuration);
    }
}
