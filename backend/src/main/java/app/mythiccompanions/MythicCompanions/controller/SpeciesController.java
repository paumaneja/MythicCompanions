package app.mythiccompanions.MythicCompanions.controller;

import app.mythiccompanions.MythicCompanions.model.Species;
import app.mythiccompanions.MythicCompanions.repository.SpeciesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/species")
@RequiredArgsConstructor
public class SpeciesController {

    private final SpeciesRepository speciesRepository;

    /**
     * Endpoint to get all available species.
     * This is needed for the companion creation form.
     */
    @GetMapping
    public ResponseEntity<List<Species>> getAllSpecies() {
        List<Species> speciesList = speciesRepository.findAll();
        return ResponseEntity.ok(speciesList);
    }
}
