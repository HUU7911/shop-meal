package com.meal.profile.entity;

import com.meal.profile.convert.EncryptConvertor;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "profile")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String userId;

    @Convert(converter = EncryptConvertor.class)
    String username;

    @Convert(converter = EncryptConvertor.class)
    String firstName;

    @Convert(converter = EncryptConvertor.class)
    String lastName;

    @Convert(converter = EncryptConvertor.class)
    String email;

    @Convert(converter = EncryptConvertor.class)
    String address;

    @Convert(converter = EncryptConvertor.class)
    String avatar;

    LocalDate dob;
}
