package app.mythiccompanions.MythicCompanions.service;

import app.mythiccompanions.MythicCompanions.dto.CompanionResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.InventoryItemResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.MiniGameCompletionRequestDTO;
import app.mythiccompanions.MythicCompanions.dto.MiniGameRewardResponseDTO;
import app.mythiccompanions.MythicCompanions.exception.ResourceNotFoundException;
import app.mythiccompanions.MythicCompanions.exception.UnauthorizedOperationException;
import app.mythiccompanions.MythicCompanions.model.Companion;
import app.mythiccompanions.MythicCompanions.model.User;
import app.mythiccompanions.MythicCompanions.repository.CompanionRepository;
import app.mythiccompanions.MythicCompanions.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MiniGameService {

    private final UserRepository userRepository;
    private final CompanionRepository companionRepository;
    private final InventoryService inventoryService;
    private final CompanionService companionService;

    @Transactional
    public MiniGameRewardResponseDTO completeMiniGame(UserDetails userDetails, MiniGameCompletionRequestDTO request) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Companion companion = companionRepository.findById(request.getCompanionId())
                .orElseThrow(() -> new ResourceNotFoundException("Companion not found"));

        if (!companion.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedOperationException("User is not the owner of this companion.");
        }

        // --- Reward Logic ---
        int score = request.getScore();
        List<InventoryItemResponseDTO> awardedItems = new ArrayList<>();
        String message;

        // Decrease energy for playing
        companion.setEnergy(Math.max(0, companion.getEnergy() - 10));

        if (score > 90) {
            message = "Amazing performance! You earned a great reward!";
            companion.setSkill(Math.min(100, companion.getSkill() + 5));
            // Award a rare item (e.g., item with ID 2, which is Lembas Bread in our DataLoader)
            awardedItems.add(inventoryService.addItemToInventory(userDetails, 2L, 1));
        } else if (score > 50) {
            message = "Good job! You earned a reward.";
            companion.setSkill(Math.min(100, companion.getSkill() + 2));
            // Award a common item (e.g., item with ID 1, Small Health Potion)
            awardedItems.add(inventoryService.addItemToInventory(userDetails, 1L, 1));
        } else {
            message = "Good effort! Keep training to earn better rewards.";
            companion.setSkill(Math.min(100, companion.getSkill() + 1));
        }

        Companion updatedCompanion = companionRepository.save(companion);
        CompanionResponseDTO companionResponse = companionService.mapToResponse(updatedCompanion);

        return MiniGameRewardResponseDTO.builder()
                .message(message)
                .updatedCompanion(companionResponse)
                .itemsAwarded(awardedItems)
                .build();
    }
}
