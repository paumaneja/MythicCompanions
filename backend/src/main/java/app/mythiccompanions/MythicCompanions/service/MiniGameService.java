package app.mythiccompanions.MythicCompanions.service;

import app.mythiccompanions.MythicCompanions.dto.CompanionResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.InventoryItemResponseDTO;
import app.mythiccompanions.MythicCompanions.dto.MiniGameCompletionRequestDTO;
import app.mythiccompanions.MythicCompanions.dto.MiniGameRewardResponseDTO;
import app.mythiccompanions.MythicCompanions.enums.ItemRarity;
import app.mythiccompanions.MythicCompanions.exception.ResourceNotFoundException;
import app.mythiccompanions.MythicCompanions.exception.UnauthorizedOperationException;
import app.mythiccompanions.MythicCompanions.mapper.CompanionMapper;
import app.mythiccompanions.MythicCompanions.model.Companion;
import app.mythiccompanions.MythicCompanions.model.Item;
import app.mythiccompanions.MythicCompanions.model.User;
import app.mythiccompanions.MythicCompanions.repository.CompanionRepository;
import app.mythiccompanions.MythicCompanions.repository.ItemRepository;
import app.mythiccompanions.MythicCompanions.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MiniGameService {

    private final UserRepository userRepository;
    private final CompanionRepository companionRepository;
    private final InventoryService inventoryService;
    private final ItemRepository itemRepository;
    private final Random random = new Random();

    @Transactional
    public MiniGameRewardResponseDTO completeMiniGame(UserDetails userDetails, MiniGameCompletionRequestDTO request) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Companion companion = companionRepository.findById(request.getCompanionId())
                .orElseThrow(() -> new ResourceNotFoundException("Companion not found"));

        if (!companion.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedOperationException("User is not the owner of this companion.");
        }

        int score = request.getScore();
        List<InventoryItemResponseDTO> awardedItems = new ArrayList<>();
        String message;

        companion.setEnergy(Math.max(0, companion.getEnergy() - 10));

        ItemRarity rewardRarity = null;
        if (score > 90) {
            message = "Amazing performance! You earned a RARE reward!";
            companion.setSkill(Math.min(100, companion.getSkill() + 5));
            rewardRarity = ItemRarity.RARE;
        } else if (score > 50) {
            message = "Good job! You earned a COMMON reward.";
            companion.setSkill(Math.min(100, companion.getSkill() + 2));
            rewardRarity = ItemRarity.COMMON;
        } else {
            message = "Good effort! Keep training to earn better rewards.";
            companion.setSkill(Math.min(100, companion.getSkill() + 1));
        }

        if (rewardRarity != null) {
            System.out.println("Searching for items with rarity: " + rewardRarity);
            List<Item> possibleRewards = itemRepository.findByRarity(rewardRarity);
            System.out.println("Found " + possibleRewards.size() + " items of that rarity.");

            if (!possibleRewards.isEmpty()) {
                Item awardedItem = possibleRewards.get(random.nextInt(possibleRewards.size()));
                System.out.println("Awarding item: " + awardedItem.getName());
                awardedItems.add(inventoryService.addItemToInventory(userDetails, awardedItem.getId(), 1));
            } else {
                message += " (But no items of this rarity were found!)";
            }
        }

        Companion updatedCompanion = companionRepository.save(companion);
        CompanionResponseDTO companionResponse = CompanionMapper.mapToResponse(updatedCompanion);

        return MiniGameRewardResponseDTO.builder()
                .message(message)
                .updatedCompanion(companionResponse)
                .itemsAwarded(awardedItems)
                .build();
    }
}