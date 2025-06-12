package app.mythiccompanions.MythicCompanions.service;

import app.mythiccompanions.MythicCompanions.dto.CompanionCreationRequestDTO;
import app.mythiccompanions.MythicCompanions.dto.CompanionResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.InventoryItemResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.ItemResponseDTO;
import app.mythiccompanions.MythicCompanions.enums.ItemType;
import app.mythiccompanions.MythicCompanions.exception.InvalidWeaponException;
import app.mythiccompanions.MythicCompanions.exception.ResourceNotFoundException;
import app.mythiccompanions.MythicCompanions.exception.UnauthorizedOperationException;
import app.mythiccompanions.MythicCompanions.mapper.CompanionMapper;
import app.mythiccompanions.MythicCompanions.model.*;
import app.mythiccompanions.MythicCompanions.repository.CompanionRepository;
import app.mythiccompanions.MythicCompanions.repository.InventoryItemRepository;
import app.mythiccompanions.MythicCompanions.repository.SpeciesRepository;
import app.mythiccompanions.MythicCompanions.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanionService {

    private final CompanionRepository companionRepository;
    private final UserRepository userRepository;
    private final SpeciesRepository speciesRepository;
    private final InventoryItemRepository inventoryItemRepository;

    /**
     * Creates a new companion for the currently authenticated user.
     * @param request The request DTO containing the companion's name and species ID.
     * @param userDetails The details of the authenticated user.
     * @return A DTO representing the newly created companion.
     */
    public CompanionResponseDTO createCompanion(CompanionCreationRequestDTO request, UserDetails userDetails) {
        // Find the owner (User) from the database using the authenticated principal's username
        User owner = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + userDetails.getUsername()));

        // Find the selected species
        Species species = speciesRepository.findById(request.getSpeciesId())
                .orElseThrow(() -> new ResourceNotFoundException("Species not found with ID: " + request.getSpeciesId()));

        // Build the new companion with default stats
        Companion newCompanion = Companion.builder()
                .name(request.getName())
                .species(species)
                .owner(owner)
                .health(100)
                .hunger(100)
                .energy(100)
                .happiness(100)
                .hygiene(100)
                .skill(0)
                .sick(false)
                .lastUpdated(LocalDateTime.now())
                .build();

        Companion savedCompanion = companionRepository.save(newCompanion);

        return CompanionMapper.mapToResponse(savedCompanion);
    }

    /**
     * Retrieves all companions for a specific owner.
     * @param ownerId The ID of the owner.
     * @return A list of companion DTOs.
     */
    public List<CompanionResponseDTO> getCompanionsByOwner(Long ownerId) {
        // Optional: You could add a check here to ensure the requesting user is the owner or an admin
        List<Companion> companions = companionRepository.findByOwnerId(ownerId);

        for (Companion companion : companions) {
            companion.updateStatsOverTime();
        }

        List<Companion> updatedCompanions = companionRepository.saveAll(companions);

        return companions.stream()
                .map(CompanionMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single companion by its ID, after verifying ownership.
     * Also updates its stats over time before returning.
     * @param companionId The ID of the companion to retrieve.
     * @param userDetails The details of the authenticated user to verify ownership.
     * @return A DTO of the requested companion.
     */
    public CompanionResponseDTO getCompanionById(Long companionId, UserDetails userDetails) {
        // We use the helper method we already have to find and refresh stats
        Companion companion = findAndRefreshCompanion(companionId);

        // Security check: ensure the user making the request is the owner
        if (!companion.getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new UnauthorizedOperationException("User is not the owner of this companion.");
        }

        // Map the refreshed companion to a DTO and return it
        return CompanionMapper.mapToResponse(companion);
    }

    /**
     * Finds a companion by its ID, updates its stats based on time elapsed,
     * saves the updated state, and returns the refreshed entity.
     * @param companionId The ID of the companion to find and refresh.
     * @return The refreshed Companion entity.
     */
    private Companion findAndRefreshCompanion(Long companionId) {
        Companion companion = companionRepository.findById(companionId)
                .orElseThrow(() -> new ResourceNotFoundException("Companion not found with ID: " + companionId));

        companion.updateStatsOverTime();
        return companionRepository.save(companion);
    }

    /**
     * Performs a specific action (feed, play, sleep) on a companion.
     * It also verifies that the action is performed by the companion's owner.
     * @param companionId The ID of the companion to interact with.
     * @param action The action to perform ("feed", "play", "sleep").
     * @param userDetails The details of the authenticated user.
     * @return A DTO of the companion with updated stats.
     */
    public CompanionResponseDTO performAction(Long companionId, String action, UserDetails userDetails) {
        // Find the companion and throw an exception if not found
        Companion companion = findAndRefreshCompanion(companionId);

        // Security check: ensure the user owns this companion
        if (!companion.getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new UnauthorizedOperationException("User is not the owner of this companion.");
        }

        // Perform the action based on the input string
        switch (action.toLowerCase()) {
            case "feed":
                companion.feed();
                break;
            case "play":
                companion.play();
                break;
            case "sleep":
                companion.sleep();
                break;
            case "train":
                companion.train();
                break;
            case "clean":
                companion.clean();
                break;
            case "heal":
                companion.heal();
                break;
            default:
                throw new IllegalArgumentException("Unknown action: " + action);
        }

        // Save the updated companion to the database
        Companion updatedCompanion = companionRepository.save(companion);

        // Return the mapped DTO
        return CompanionMapper.mapToResponse(updatedCompanion);
    }

    /**
     * Changes the weapon for a specific companion.
     * Verifies that the user is the owner and the weapon is valid.
     * @param companionId The ID of the companion.
     * @param weaponName The name of the new weapon.
     * @param userDetails The details of the authenticated user.
     * @return A DTO of the companion with the updated weapon.
     */
    public CompanionResponseDTO changeWeapon(Long companionId, String weaponName, UserDetails userDetails) {
        Companion companion = findAndRefreshCompanion(companionId);

        // Security check: ensure the user owns this companion
        if (!companion.getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new UnauthorizedOperationException("User is not the owner of this companion.");
        }

        // Delegate the logic to the model method
        companion.changeWeapon(weaponName);

        Companion updatedCompanion = companionRepository.save(companion);
        return CompanionMapper.mapToResponse(updatedCompanion);
    }

    /**
     * Equips an item from the user's inventory onto a companion.
     */
    @Transactional
    public CompanionResponseDTO equipItem(UserDetails userDetails, Long companionId, Long inventoryItemId) {
        Companion companion = findAndRefreshCompanion(companionId); // We reuse our helper method
        User owner = companion.getOwner();

        // Security check
        if (!owner.getUsername().equals(userDetails.getUsername())) {
            throw new UnauthorizedOperationException("User is not the owner of this companion.");
        }

        InventoryItem itemToEquip = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + inventoryItemId));

        // Check that the user owns the item
        if (!itemToEquip.getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedOperationException("User does not own the item they are trying to equip.");
        }

        // Check if the item is equippable (not a consumable)
        if (itemToEquip.getItem().getItemType() == ItemType.CONSUMABLE) {
            throw new InvalidWeaponException("Cannot equip a consumable item."); // Reusing this exception for now
        }

        // Unequip any existing item first
        if (companion.getEquippedGear() != null) {
            InventoryItem currentlyEquipped = companion.getEquippedGear();
            currentlyEquipped.setEquipped(false);
            inventoryItemRepository.save(currentlyEquipped);
        }

        // Equip the new item
        itemToEquip.setEquipped(true);
        companion.setEquippedGear(itemToEquip);

        inventoryItemRepository.save(itemToEquip);
        Companion updatedCompanion = companionRepository.save(companion);

        return CompanionMapper.mapToResponse(updatedCompanion);
    }
}
