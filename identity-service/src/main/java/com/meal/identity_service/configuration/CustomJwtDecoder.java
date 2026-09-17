package com.meal.identity_service.configuration;

import com.meal.identity_service.dto.request.IntrospectRequest;
import com.meal.identity_service.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomJwtDecoder implements JwtDecoder {

    @Value("${jwt.signer-key}")
    private String SIGN_KEY;

    @Autowired
    private final AuthenticationService authenticationService;

    private NimbusJwtDecoder jwtDecoder;

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            var response = authenticationService.introspect(IntrospectRequest.builder()
                            .token(token)
                    .build());
            if (!response.isValid())
                throw new JwtException("introspect error");
        }catch (Exception e) {
            log.error("Cannot introspect JWT", e);
            throw new JwtException("Cannot introspect JWT", e);
        }

        if (Objects.isNull(jwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(SIGN_KEY.getBytes(), "HmacSHA256");
            jwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS256)
                    .build();
        }

        return jwtDecoder.decode(token);
    }
}
