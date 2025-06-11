package app.mythiccompanions.MythicCompanions.dto;

import lombok.Data;

/**
 * DTO for the request to use an item on a specific companion.
 */
@Data
public class UseItemRequestDTO {
    private Long companionId;
}
