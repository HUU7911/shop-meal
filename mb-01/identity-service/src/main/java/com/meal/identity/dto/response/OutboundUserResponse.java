package com.meal.identity.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties(ignoreUnknown = true)
public class OutboundUserResponse {
    String id;
    String email;

    @JsonProperty("verified_email")
    boolean verifiedEmail;

    String name;

    @JsonProperty("given_name")
    String givenName;

    @JsonProperty("family_name")
    String familyName;

    String picture;
    String locale;
}