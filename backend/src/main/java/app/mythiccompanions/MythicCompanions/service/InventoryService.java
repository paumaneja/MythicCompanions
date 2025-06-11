package app.mythiccompanions.MythicCompanions.service;

import app.mythiccompanions.MythicCompanions.dto.CompanionResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.InventoryItemResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.ItemResponseDTO;
import app.mythiccompanions.MythicCompanions.enums.ItemType;
import app.mythiccompanions.MythicCompanions.exception.CompanionInteractionException;
import app.mythiccompanions.MythicCompanions.exception.ResourceNotFoundException;
import app.mythiccompanions.MythicCompanions.exception.UnauthorizedOperationException;
import app.mythiccompanions.MythicCompanions.model.InventoryItem;
import app.mythiccompanions.MythicCompanions.model.Item;
import app.mythiccompanions.MythicCompanions.model.User;
import app.mythiccompanions.MythicCompanions.model.Companion;
import app.mythiccompanions.MythicCompanions.repository.InventoryItemRepository;
import app.mythiccompanions.MythicCompanions.repository.ItemRepository;
import app.mythiccompanions.MythicCompanions.repository.UserRepository;
import app.mythiccompanions.MythicCompanions.repository.CompanionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final CompanionRepository companionRepository;

    /**
     * Gets the inventory for the currently authenticated user.
     */
    @Transactional(readOnly = true)
    public List<InventoryItemResponseDTO> getUserInventory(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return user.getInventoryItems().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Adds a specified quantity of an item to the user's inventory.
     * If the user already has the item, it increases the quantity.
     * If not, it creates a new inventory entry.
     */
    @Transactional
    public InventoryItemResponseDTO addItemToInventory(UserDetails userDetails, Long itemId, int quantity) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        // Check if the user already has this item
        Optional<InventoryItem> existingInventoryItem = user.getInventoryItems().stream()
                .filter(invItem -> invItem.getItem().getId().equals(itemId))
                .findFirst();

        InventoryItem inventoryItem;
        if (existingInventoryItem.isPresent()) {
            // If item exists, update quantity
            inventoryItem = existingInventoryItem.get();
            inventoryItem.setQuantity(inventoryItem.getQuantity() + quantity);
        } else {
            // If item does not exist, create a new entry
            inventoryItem = InventoryItem.builder()
                    .owner(user)
                    .item(item)
                    .quantity(quantity)
                    .build();
        }

        InventoryItem savedItem = inventoryItemRepository.save(inventoryItem);
        return mapToResponse(savedItem);
    }

    private InventoryItemResponseDTO mapToResponse(InventoryItem inventoryItem) {
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

    /**
     * Uses a consumable item from the user's inventory on a specified companion.
     * @param userDetails The authenticated user.
     * @param inventoryItemId The ID of the item in the user's inventory.
     * @param companionId The ID of the companion to apply the item's effects to.
     * @return A DTO of the companion with updated stats.
     */
    @Transactional
    public CompanionResponseDTO useItem(UserDetails userDetails, Long inventoryItemId, Long companionId) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        InventoryItem inventoryItem = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + inventoryItemId));

        // Security check: ensure the item belongs to the authenticated user
        if (!inventoryItem.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedOperationException("User does not own this inventory item.");
        }

        Item itemToUse = inventoryItem.getItem();

        // Logic check: ensure the item is a consumable
        if (itemToUse.getItemType() != ItemType.CONSUMABLE) {
            throw new CompanionInteractionException("Item '" + itemToUse.getName() + "' is not a consumable.");
        }

        Companion companion = companionRepository.findById(companionId)
                .orElseThrow(() -> new ResourceNotFoundException("Companion not found with ID: " + companionId));

        // Security check: ensure the companion belongs to the authenticated user
        if (!companion.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedOperationException("User is not the owner of this companion.");
        }

        // Apply item effects
        if (itemToUse.getHealthBonus() != null) {
            companion.setHealth(Math.min(100, companion.getHealth() + itemToUse.getHealthBonus()));
        }
        if (itemToUse.getHungerBonus() != null) {
            companion.setHunger(Math.min(100, companion.getHunger() + itemToUse.getHungerBonus()));
        }
        if (itemToUse.getEnergyBonus() != null) {
            companion.setEnergy(Math.min(100, companion.getEnergy() + itemToUse.getEnergyBonus()));
        }
        if (itemToUse.getHappinessBonus() != null) {
            companion.setHappiness(Math.min(100, companion.getHappiness() + itemToUse.getHappinessBonus()));
        }

        // Update inventory quantity
        inventoryItem.setQuantity(inventoryItem.getQuantity() - 1);

        if (inventoryItem.getQuantity() <= 0) {
            // If quantity is zero or less, remove the item from the inventory
            inventoryItemRepository.delete(inventoryItem);
        } else {
            // Otherwise, just save the updated quantity
            inventoryItemRepository.save(inventoryItem);
        }

        Companion updatedCompanion = companionRepository.save(companion);

        // We need a mapper from Companion to CompanionResponse. Let's borrow it from CompanionService.
        // For a cleaner architecture, this mapper could be in a separate class.
        // For now, let's just create it here for simplicity.
        return mapCompanionToResponse(updatedCompanion);
    }

    // This is a duplicate of the mapper in CompanionService. In a large project,
    // this would be moved to a shared Mapper class to avoid code duplication.
    private CompanionResponseDTO mapCompanionToResponse(Companion companion) {
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
                .allowedWeapons(companion.getSpecies().getAllowedWeapons())
                .build();
    }
}
