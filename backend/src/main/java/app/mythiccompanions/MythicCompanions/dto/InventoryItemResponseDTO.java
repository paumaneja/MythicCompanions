package app.mythiccompanions.MythicCompanions.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO for representing an item stack within a user's inventory.
 */
@Data
@Builder
public class InventoryItemResponseDTO {
    private Long inventoryItemId;
    private int quantity;
    private ItemResponseDTO item;
}
