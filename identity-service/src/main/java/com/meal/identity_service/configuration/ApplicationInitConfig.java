package com.meal.identity_service.configuration;

import com.meal.identity_service.constant.RoleDefine;
import com.meal.identity_service.entity.Role;
import com.meal.identity_service.entity.User;
import com.meal.identity_service.repository.RoleRepository;
import com.meal.identity_service.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.HashSet;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig{

    PasswordEncoder passwordEncoder;

    @NonFinal
    static String ADMIN_USERNAME = "admin";

    @NonFinal
    static String ADMIN_PASSWORD = "admin";

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        return args -> {
              if (userRepository.findByUsername(ADMIN_USERNAME).isEmpty()) {
                  roleRepository.save(Role.builder()
                          .name(RoleDefine.USER.name())
                          .description("has role user")
                          .build()
                  );

                  var roleAdmin = roleRepository.save(Role.builder()
                          .name(RoleDefine.ADMIN.name())
                          .description("has role admin")
                          .build()
                  );

                  var roles = new HashSet<Role>();
                  roles.add(roleAdmin);

                  User user = User.builder()
                          .username(ADMIN_USERNAME)
                          .password(passwordEncoder.encode(ADMIN_PASSWORD))
                          .firstName("tran")
                          .lastName("huu")
                          .email("trihuutran4@gmail.com")
                          .birthday(LocalDate.of(2006, 4, 5))
                          .roles(roles)
                          .build();

                  userRepository.save(user);
                  log.info("Role initial by name: {}", roleAdmin.getName());
              }
              log.info("Role has been created");
        };
    }
}
