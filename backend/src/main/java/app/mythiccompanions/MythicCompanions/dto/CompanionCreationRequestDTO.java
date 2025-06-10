package app.mythiccompanions.MythicCompanions.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for the request to create a new companion.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanionCreationRequestDTO {
    private String name;
    private Long speciesId;
}
