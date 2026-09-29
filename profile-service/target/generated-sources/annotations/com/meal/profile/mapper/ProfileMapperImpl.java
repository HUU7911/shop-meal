package com.meal.profile.mapper;

import com.meal.profile.dto.request.ProfileCreationRequest;
import com.meal.profile.dto.request.ProfileUpdateRequest;
import com.meal.profile.dto.response.ProfileResponse;
import com.meal.profile.entity.Profile;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-29T16:00:23+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.2 (Oracle Corporation)"
)
@Component
public class ProfileMapperImpl implements ProfileMapper {

    @Override
    public Profile toProfile(ProfileCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        Profile.ProfileBuilder profile = Profile.builder();

        profile.id( request.getId() );
        profile.userId( request.getUserId() );
        profile.username( request.getUsername() );
        profile.firstName( request.getFirstName() );
        profile.lastName( request.getLastName() );
        profile.email( request.getEmail() );
        profile.address( request.getAddress() );
        profile.avatar( request.getAvatar() );
        profile.dob( request.getDob() );

        return profile.build();
    }

    @Override
    public ProfileResponse toProfileResponse(Profile profile) {
        if ( profile == null ) {
            return null;
        }

        ProfileResponse.ProfileResponseBuilder profileResponse = ProfileResponse.builder();

        profileResponse.id( profile.getId() );
        profileResponse.userId( profile.getUserId() );
        profileResponse.username( profile.getUsername() );
        profileResponse.firstName( profile.getFirstName() );
        profileResponse.lastName( profile.getLastName() );
        profileResponse.email( profile.getEmail() );
        profileResponse.address( profile.getAddress() );
        profileResponse.avatar( profile.getAvatar() );
        profileResponse.dob( profile.getDob() );

        return profileResponse.build();
    }

    @Override
    public void updateProfile(Profile profile, ProfileUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        profile.setUsername( request.getUsername() );
        profile.setFirstName( request.getFirstName() );
        profile.setLastName( request.getLastName() );
        profile.setEmail( request.getEmail() );
        profile.setAddress( request.getAddress() );
        profile.setAvatar( request.getAvatar() );
        profile.setDob( request.getDob() );
    }
}
