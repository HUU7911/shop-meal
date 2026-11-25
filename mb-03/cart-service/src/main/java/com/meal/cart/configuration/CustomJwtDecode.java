package com.meal.cart.configuration;

import com.nimbusds.jwt.SignedJWT;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import java.text.ParseException;

@Configuration
public class CustomJwtDecode implements JwtDecoder {
    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            return new Jwt(token,
                    signedJWT.getJWTClaimsSet().getIssueTime().toInstant(),
                    signedJWT.getJWTClaimsSet().getExpirationTime().toInstant(),
                    signedJWT.getHeader().toJSONObject(),
                    signedJWT.getJWTClaimsSet().getClaims()
            );
        } catch (ParseException e) {
            throw new RuntimeException("invalid token: " + e.getMessage());
        }
    }
}
