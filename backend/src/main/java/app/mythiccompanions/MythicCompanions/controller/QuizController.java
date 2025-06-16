package app.mythiccompanions.MythicCompanions.controller;

import app.mythiccompanions.MythicCompanions.model.Question;
import app.mythiccompanions.MythicCompanions.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/game/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    /**
     * Endpoint to get a set of quiz questions for a specific companion.
     * The questions will be relevant to the companion's universe.
     * @param companionId The ID of the companion.
     * @return A list of Question objects.
     */
    @GetMapping("/questions/{companionId}")
    public ResponseEntity<List<Question>> getQuizQuestions(@PathVariable Long companionId) {
        List<Question> questions = quizService.getQuizQuestionsForCompanion(companionId);
        return ResponseEntity.ok(questions);
    }
}
