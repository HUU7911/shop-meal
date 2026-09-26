package com.meal.identity_service.service;

import com.meal.event.dto.NotificationEvent;
import com.meal.identity_service.constant.RoleDefine;
import com.meal.identity_service.dto.request.UserCreationRequest;
import com.meal.identity_service.dto.request.UserUpdateRequest;
import com.meal.identity_service.dto.response.UserResponse;
import com.meal.identity_service.entity.Role;
import com.meal.identity_service.entity.User;
import com.meal.identity_service.exception.AppException;
import com.meal.identity_service.exception.ErrorCode;
import com.meal.identity_service.mapper.ProfileMapper;
import com.meal.identity_service.mapper.UserMapper;
import com.meal.identity_service.repository.RoleRepository;
import com.meal.identity_service.repository.UserRepository;
import com.meal.identity_service.repository.httpclient.ProfileClient;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UserMapper userMapper;
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    ProfileClient profileClient;
    ProfileMapper profileMapper;
    KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXIST);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        HashSet<Role> roles = new HashSet<>();

        roleRepository.findById(RoleDefine.USER.name()).ifPresent(roles::add);
        user.setRoles(roles);

        try {
            user = userRepository.save(user);
        }catch (Exception e) {
            throw new AppException(ErrorCode.USER_EXIST);
        }

        var profileRequest = profileMapper.toProfileCreationRequest(request);
        profileRequest.setUserId(user.getId());
        profileRequest.setDob(user.getBirthday());

        profileClient.create(profileRequest);

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .chanel("EMAIL")
                .recipient(user.getEmail())
                .subject("Welcome to shop meal")
                .body("Welcome to shop meal: " + user.getEmail())
                .build();

        try {
            kafkaTemplate.send("create-user", notificationEvent);
        }catch (Exception e) {
            log.info("Error sending email to create user", e);
            throw new AppException(ErrorCode.USER_NOT_CREATED);
        }

        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse internalCreateUser(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXIST);
        }

        User user = userMapper.toUser(request);

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(RoleDefine.STAFF.name()).ifPresent(roles::add);
        user.setRoles(roles);

        return userMapper.toResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userRepository
                .findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new RuntimeException("User not found!"));

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userMapper.updateUser(request, user);

        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));

        return userMapper.toResponse(userRepository.save(user));
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new RuntimeException("User not found!")
        );

        return userMapper.toResponse(user);
    }

    public UserResponse getMyInfor() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        var user = userRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND)
        );

        return userMapper.toResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String id) {
        userRepository.deleteById(id);
        profileClient.delete();
    }
}
