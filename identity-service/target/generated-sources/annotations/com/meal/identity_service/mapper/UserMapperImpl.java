package com.meal.identity_service.mapper;

import com.meal.identity_service.dto.request.UserCreationRequest;
import com.meal.identity_service.dto.request.UserUpdateRequest;
import com.meal.identity_service.dto.response.UserResponse;
import com.meal.identity_service.entity.Role;
import com.meal.identity_service.entity.User;
import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-17T01:35:47+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.2 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toUser(UserCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.id( request.getId() );
        user.username( request.getUsername() );
        user.password( request.getPassword() );
        user.firstName( request.getFirstName() );
        user.lastName( request.getLastName() );
        user.email( request.getEmail() );
        user.birthday( request.getBirthday() );

        return user.build();
    }

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder userResponse = UserResponse.builder();

        Set<Role> set = user.getRoles();
        if ( set != null ) {
            userResponse.roles( new LinkedHashSet<Role>( set ) );
        }
        userResponse.id( user.getId() );
        userResponse.username( user.getUsername() );
        userResponse.password( user.getPassword() );
        userResponse.firstName( user.getFirstName() );
        userResponse.lastName( user.getLastName() );
        userResponse.email( user.getEmail() );
        userResponse.birthday( user.getBirthday() );

        return userResponse.build();
    }

    @Override
    public void updateUser(UserUpdateRequest request, User user) {
        if ( user == null ) {
            return;
        }

        request.setId( user.getId() );
        request.setUsername( user.getUsername() );
        request.setPassword( user.getPassword() );
        request.setFirstName( user.getFirstName() );
        request.setLastName( user.getLastName() );
        request.setEmail( user.getEmail() );
        request.setBirthday( user.getBirthday() );
    }
}
