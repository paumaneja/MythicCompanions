package app.mythiccompanions.MythicCompanions.dto;

import app.mythiccompanions.MythicCompanions.enums.ItemRarity;
import app.mythiccompanions.MythicCompanions.enums.ItemType;
import lombok.Builder;
import lombok.Data;

/**
 * DTO for representing an Item's catalog data.
 */
@Data
@Builder
public class ItemResponseDTO {
    private Long id;
    private String name;
    private String description;
    private ItemType itemType;
    private ItemRarity rarity;
    private Integer healthBonus;
    private Integer hungerBonus;
    private Integer energyBonus;
    private Integer happinessBonus;
}
