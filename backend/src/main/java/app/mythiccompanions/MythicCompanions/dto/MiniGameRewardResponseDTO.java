package app.mythiccompanions.MythicCompanions.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * DTO for the response sent back to the client after a mini-game, detailing the rewards.
 */
@Data
@Builder
public class MiniGameRewardResponseDTO {
    private String message;
    private CompanionResponseDTO updatedCompanion;
    private List<InventoryItemResponseDTO> itemsAwarded;
}
