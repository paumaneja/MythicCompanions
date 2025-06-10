package app.mythiccompanions.MythicCompanions.auth;

import app.mythiccompanions.MythicCompanions.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for sending back authentication responses (e.g., a JWT token).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private Role role;
}
