package app.mythiccompanions.MythicCompanions.mapper;

import app.mythiccompanions.MythicCompanions.dto.CompanionResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.InventoryItemResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.ItemResponseDTO;
import app.mythiccompanions.MythicCompanions.model.Companion;
import app.mythiccompanions.MythicCompanions.model.InventoryItem;
import app.mythiccompanions.MythicCompanions.model.Item;

/**
 * A dedicated class for mapping Companion entities to DTOs.
 */
public class CompanionMapper {

    /**
     * Maps a Companion entity to a CompanionResponse DTO.
     * @param companion The Companion entity to map.
     * @return The resulting CompanionResponse DTO.
     */
    public static CompanionResponseDTO mapToResponse(Companion companion) {
        if (companion == null) {
            return null;
        }

        InventoryItemResponseDTO equippedGearResponse = null;
        if (companion.getEquippedGear() != null) {
            equippedGearResponse = mapInventoryItemToResponse(companion.getEquippedGear());
        }

        return CompanionResponseDTO.builder()
                .id(companion.getId())
                .name(companion.getName())
                .speciesName(companion.getSpecies().getName())
                .universe(companion.getSpecies().getUniverse())
                .health(companion.getHealth())
                .hunger(companion.getHunger())
                .energy(companion.getEnergy())
                .happiness(companion.getHappiness())
                .hygiene(companion.getHygiene())
                .skill(companion.getSkill())
                .sick(companion.isSick())
                .currentWeapon(companion.getCurrentWeapon())
                .equippedGear(equippedGearResponse)
                .allowedWeapons(companion.getSpecies().getAllowedWeapons())
                .build();
    }

    /**
     * Helper method to map an InventoryItem to its DTO representation.
     * @param inventoryItem The InventoryItem entity.
     * @return The InventoryItemResponse DTO.
     */
    private static InventoryItemResponseDTO mapInventoryItemToResponse(InventoryItem inventoryItem) {
        if (inventoryItem == null) {
            return null;
        }

        Item item = inventoryItem.getItem();
        ItemResponseDTO itemResponse = ItemResponseDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .itemType(item.getItemType())
                .healthBonus(item.getHealthBonus())
                .hungerBonus(item.getHungerBonus())
                .energyBonus(item.getEnergyBonus())
                .happinessBonus(item.getHappinessBonus())
                .build();

        return InventoryItemResponseDTO.builder()
                .inventoryItemId(inventoryItem.getId())
                .quantity(inventoryItem.getQuantity())
                .item(itemResponse)
                .build();
    }
}
