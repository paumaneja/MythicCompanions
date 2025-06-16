package app.mythiccompanions.MythicCompanions.service;

import app.mythiccompanions.MythicCompanions.exception.ResourceNotFoundException;
import app.mythiccompanions.MythicCompanions.model.Companion;
import app.mythiccompanions.MythicCompanions.model.Question;
import app.mythiccompanions.MythicCompanions.repository.CompanionRepository;
import app.mythiccompanions.MythicCompanions.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuestionRepository questionRepository;
    private final CompanionRepository companionRepository;
    private static final int DEFAULT_QUESTION_COUNT = 5;

    /**
     * Fetches a list of random quiz questions tailored to the companion's universe.
     * @param companionId The ID of the companion that will "play" the quiz.
     * @return A list of Question entities.
     */
    @Transactional(readOnly = true)
    public List<Question> getQuizQuestionsForCompanion(Long companionId) {
        Companion companion = companionRepository.findById(companionId)
                .orElseThrow(() -> new ResourceNotFoundException("Companion not found with ID: " + companionId));

        String universe = companion.getSpecies().getUniverse().name();

        List<Question> questions = questionRepository.findRandomQuestionsByUniverse(universe, DEFAULT_QUESTION_COUNT);

        Collections.shuffle(questions);

        return questions;
    }
}
