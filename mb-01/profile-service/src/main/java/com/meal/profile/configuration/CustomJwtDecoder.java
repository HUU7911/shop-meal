package com.meal.profile.configuration;

import com.nimbusds.jwt.SignedJWT;
import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import java.text.ParseException;

@Configuration
public class CustomJwtDecoder implements JwtDecoder {

    @Override
    public Jwt decode(@NonNull String token) throws JwtException {
        try {
            SignedJWT jwt = SignedJWT.parse(token);

            return new Jwt(token,
                    jwt.getJWTClaimsSet().getIssueTime().toInstant(),
                    jwt.getJWTClaimsSet().getExpirationTime().toInstant(),
                    jwt.getHeader().toJSONObject(),
                    jwt.getJWTClaimsSet().getClaims()
            );
        } catch (ParseException e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
}
