package app.mythiccompanions.MythicCompanions.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String profileImagePath;
}