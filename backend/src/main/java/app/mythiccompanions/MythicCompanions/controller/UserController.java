package app.mythiccompanions.MythicCompanions.controller;

import app.mythiccompanions.MythicCompanions.dto.ChangePasswordRequestDTO;
import app.mythiccompanions.MythicCompanions.dto.UserProfileResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.UserUpdateRequestDTO;
import app.mythiccompanions.MythicCompanions.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Endpoint to get the current user's profile information.
     * The user is identified by the JWT token.
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponseDTO userProfile = userService.getUserProfile(userDetails);
        return ResponseEntity.ok(userProfile);
    }

    /**
     * Endpoint to update the current user's profile information.
     */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserUpdateRequestDTO request) {
        UserProfileResponseDTO updatedProfile = userService.updateUserProfile(userDetails, request);
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * Endpoint to change the current user's password.
     */
    @PostMapping("/change-password")
    public ResponseEntity<Void> changeMyPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequestDTO request) {
        userService.changePassword(userDetails, request);
        // On success, return a 200 OK with no body.
        return ResponseEntity.ok().build();
    }

    /**
     * Receives the profile image uploaded from the frontend.
     * @param userDetails The authenticated user.
     * @param file The image file. The name "profileImage" must match the FormData of the frontend.
     * @return The user profile updated.
     */
    @PostMapping("/me/upload-picture")
    public ResponseEntity<UserProfileResponseDTO> uploadProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("profileImage") MultipartFile file) {

        UserProfileResponseDTO updatedProfile = userService.storeProfilePicture(userDetails, file);
        return ResponseEntity.ok(updatedProfile);
    }
}