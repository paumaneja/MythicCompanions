package app.mythiccompanions.MythicCompanions.controller;

import app.mythiccompanions.MythicCompanions.dto.MiniGameCompletionRequestDTO;
import app.mythiccompanions.MythicCompanions.dto.MiniGameRewardResponseDTO;
import app.mythiccompanions.MythicCompanions.service.MiniGameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class MiniGameController {

    private final MiniGameService miniGameService;

    @PostMapping("/complete-minigame")
    public ResponseEntity<MiniGameRewardResponseDTO> completeMiniGame(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MiniGameCompletionRequestDTO request) {

        MiniGameRewardResponseDTO reward = miniGameService.completeMiniGame(userDetails, request);
        return ResponseEntity.ok(reward);
    }
}
