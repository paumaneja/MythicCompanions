package app.mythiccompanions.MythicCompanions.controller;

import app.mythiccompanions.MythicCompanions.dto.CompanionCreationRequestDTO;
import app.mythiccompanions.MythicCompanions.dto.CompanionResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.WeaponChangeRequestDTO;
import app.mythiccompanions.MythicCompanions.service.CompanionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companions") // A common practice is to prefix protected API routes with /api
@RequiredArgsConstructor
public class CompanionController {

    private final CompanionService companionService;

    /**
     * Endpoint to create a new companion.
     * The owner is determined by the authenticated user's JWT token.
     */
    @PostMapping
    public ResponseEntity<CompanionResponseDTO> createCompanion(
            @RequestBody CompanionCreationRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        CompanionResponseDTO newCompanion = companionService.createCompanion(request, userDetails);
        return new ResponseEntity<>(newCompanion, HttpStatus.CREATED);
    }

    /**
     * Endpoint to get all companions for a specific user ID.
     * In a real app, you might get this from the token instead of a path variable
     * to prevent users from seeing other users' companions.
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<CompanionResponseDTO>> getCompanionsByOwner(@PathVariable Long ownerId) {
        List<CompanionResponseDTO> companions = companionService.getCompanionsByOwner(ownerId);
        return ResponseEntity.ok(companions);
    }

    /**
     * Endpoint to get a single companion by its ID.
     * Ownership is verified in the service layer.
     */
    @GetMapping("/{companionId}")
    public ResponseEntity<CompanionResponseDTO> getCompanionById(
            @PathVariable Long companionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        CompanionResponseDTO companion = companionService.getCompanionById(companionId, userDetails);
        return ResponseEntity.ok(companion);
    }

    /**
     * Endpoint to perform an action on a companion.
     * The action is passed as a request parameter.
     */
    @PutMapping("/{companionId}/interact")
    public ResponseEntity<CompanionResponseDTO> interactWithCompanion(
            @PathVariable Long companionId,
            @RequestParam String action,
            @AuthenticationPrincipal UserDetails userDetails) {

        CompanionResponseDTO updatedCompanion = companionService.performAction(companionId, action, userDetails);
        return ResponseEntity.ok(updatedCompanion);
    }

    /**
     * Endpoint to change a companion's weapon.
     */
    @PutMapping("/{companionId}/weapon")
    public ResponseEntity<CompanionResponseDTO> changeCompanionWeapon(
            @PathVariable Long companionId,
            @RequestBody WeaponChangeRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        CompanionResponseDTO updatedCompanion = companionService.changeWeapon(companionId, request.getWeaponName(), userDetails);
        return ResponseEntity.ok(updatedCompanion);
    }

    /**
     * Endpoint to equip an item on a companion.
     */
    @PostMapping("/{companionId}/equip/{inventoryItemId}")
    public ResponseEntity<CompanionResponseDTO> equipItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long companionId,
            @PathVariable Long inventoryItemId) {

        CompanionResponseDTO updatedCompanion = companionService.equipItem(userDetails, companionId, inventoryItemId);
        return ResponseEntity.ok(updatedCompanion);
    }
}
