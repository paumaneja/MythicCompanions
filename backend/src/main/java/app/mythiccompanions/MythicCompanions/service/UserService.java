// backend/src/main/java/app/mythiccompanions/MythicCompanions/service/UserService.java

package app.mythiccompanions.MythicCompanions.service;

import app.mythiccompanions.MythicCompanions.dto.ChangePasswordRequestDTO;
import app.mythiccompanions.MythicCompanions.dto.UserProfileResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.UserUpdateRequestDTO;
import app.mythiccompanions.MythicCompanions.exception.ResourceNotFoundException;
import app.mythiccompanions.MythicCompanions.model.User;
import app.mythiccompanions.MythicCompanions.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Retrieves the profile information for the currently authenticated user.
     * @param userDetails The security context of the logged-in user.
     * @return A DTO with the user's public profile data.
     */
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserProfile(UserDetails userDetails) {
        User user = findUserByDetails(userDetails);
        return mapUserToProfileResponse(user);
    }

    /**
     * Updates the profile information for the currently authenticated user.
     * @param userDetails The security context of the logged-in user.
     * @param request The DTO containing the data to update.
     * @return A DTO with the updated user profile data.
     */
    @Transactional
    public UserProfileResponseDTO updateUserProfile(UserDetails userDetails, UserUpdateRequestDTO request) {
        User user = findUserByDetails(userDetails);

        // Update the fields from the request
        user.setEmail(request.getEmail());

        User updatedUser = userRepository.save(user);
        return mapUserToProfileResponse(updatedUser);
    }

    /**
     * Changes the password for the currently authenticated user.
     * It first verifies that the provided current password is correct.
     * @param userDetails The security context of the logged-in user.
     * @param request The DTO containing the current and new passwords.
     */
    @Transactional
    public void changePassword(UserDetails userDetails, ChangePasswordRequestDTO request) {
        User user = findUserByDetails(userDetails);

        // 1. Verify that the current password matches the one in the database
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Incorrect current password.");
        }

        // 2. Encode the new password
        String newPasswordEncoded = passwordEncoder.encode(request.getNewPassword());

        // 3. Update the user's password and save
        user.setPassword(newPasswordEncoded);
        userRepository.save(user);
    }


    // --- Helper Methods ---

    private User findUserByDetails(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + userDetails.getUsername()));
    }

    private UserProfileResponseDTO mapUserToProfileResponse(User user) {
        return UserProfileResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
}