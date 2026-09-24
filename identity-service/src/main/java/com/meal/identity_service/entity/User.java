package com.meal.identity_service.entity;

import com.meal.identity_service.convert.EncryptConverter;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Convert(converter = EncryptConverter.class)
    String username;

    String password;

    @Convert(converter = EncryptConverter.class)
    String firstName;

    @Convert(converter = EncryptConverter.class)
    String lastName;

    @Convert(converter = EncryptConverter.class)
    String email;

    LocalDate birthday;

    @ManyToMany(fetch = FetchType.EAGER)
    Set<Role> roles;
}
