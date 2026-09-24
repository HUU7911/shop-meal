package com.meal.profile.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileUpdateRequest {

    String username;

    String firstName;

    String lastName;

    String email;

    String address;

    String avatar;

    LocalDate dob;
}
