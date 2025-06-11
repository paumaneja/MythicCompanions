package app.mythiccompanions.MythicCompanions.controller;

import app.mythiccompanions.MythicCompanions.dto.CompanionResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.InventoryItemResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.UseItemRequestDTO;
import app.mythiccompanions.MythicCompanions.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    /**
     * Endpoint to get the authenticated user's inventory.
     */
    @GetMapping
    public ResponseEntity<List<InventoryItemResponseDTO>> getUserInventory(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(inventoryService.getUserInventory(userDetails));
    }

    /**
     * Endpoint to add an item to the user's inventory.
     * This is a utility endpoint, for now, to test the system.
     * @param itemId The ID of the item to add (from the item catalog).
     * @param quantity The amount to add.
     */
    @PostMapping("/add")
    public ResponseEntity<InventoryItemResponseDTO> addItemToInventory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long itemId,
            @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(inventoryService.addItemToInventory(userDetails, itemId, quantity));
    }

    /**
     * Endpoint to use a consumable item on a companion.
     * @param inventoryItemId The ID of the item in the user's inventory.
     * @param request The request body containing the target companion's ID.
     */
    @PostMapping("/use/{inventoryItemId}")
    public ResponseEntity<CompanionResponseDTO> useItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long inventoryItemId,
            @RequestBody UseItemRequestDTO request) {

        CompanionResponseDTO updatedCompanion = inventoryService.useItem(userDetails, inventoryItemId, request.getCompanionId());
        return ResponseEntity.ok(updatedCompanion);
    }
}
