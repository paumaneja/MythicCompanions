package app.mythiccompanions.MythicCompanions.service;

import app.mythiccompanions.MythicCompanions.dto.InventoryItemResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.ItemResponseDTO;
import app.mythiccompanions.MythicCompanions.exception.ResourceNotFoundException;
import app.mythiccompanions.MythicCompanions.model.InventoryItem;
import app.mythiccompanions.MythicCompanions.model.Item;
import app.mythiccompanions.MythicCompanions.model.User;
import app.mythiccompanions.MythicCompanions.repository.InventoryItemRepository;
import app.mythiccompanions.MythicCompanions.repository.ItemRepository;
import app.mythiccompanions.MythicCompanions.repository.UserRepository;
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
}
