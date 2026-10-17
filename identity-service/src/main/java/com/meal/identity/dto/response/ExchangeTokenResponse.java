package com.meal.identity.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExchangeTokenResponse {
    @JsonProperty("access_token")
    String accessToken;

    @JsonProperty("expires_in")
    Long expiresIn;

    @JsonProperty("refresh_token")
    String refreshToken;

    @JsonProperty("scope")
    String scope;

    @JsonProperty("token_type")
    String tokenType;

    @JsonProperty("id_token")
    String idToken;
}