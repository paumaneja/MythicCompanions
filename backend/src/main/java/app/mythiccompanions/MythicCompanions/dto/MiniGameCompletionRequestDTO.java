package app.mythiccompanions.MythicCompanions.dto;

import lombok.Data;

/**
 * DTO for the request sent from the client when a mini-game is completed.
 */
@Data
public class MiniGameCompletionRequestDTO {
    private Long companionId;
    private int score;
}
