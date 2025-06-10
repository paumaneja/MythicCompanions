package app.mythiccompanions.MythicCompanions.config;

import app.mythiccompanions.MythicCompanions.enums.Universe;
import app.mythiccompanions.MythicCompanions.model.Species;
import app.mythiccompanions.MythicCompanions.repository.SpeciesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * This component runs on application startup and pre-loads the database
 * with some initial species data if the species table is empty.
 */
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final SpeciesRepository speciesRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if the species table is empty before populating
        if (speciesRepository.count() == 0) {
            loadSpeciesData();
        }
    }

    private void loadSpeciesData() {
        // --- STAR WARS SPECIES ---
        Species porg = Species.builder()
                .name("Porg")
                .universe(Universe.STARWARS)
                .allowedWeapons(List.of("Chewie's Stolen Datapad", "Luminescent Crystal", "Small Coaxium Canister"))
                .build();

        Species ewok = Species.builder()
                .name("Ewok Whelp")
                .universe(Universe.STARWARS)
                .allowedWeapons(List.of("Miniature Sling", "Small Wooden Spear", "Drumsticks"))
                .build();

        // --- LORD OF THE RINGS SPECIES ---
        Species hobbit = Species.builder()
                .name("Hobbitling")
                .universe(Universe.LORD_OF_THE_RINGS)
                .allowedWeapons(List.of("Sturdy Frying Pan", "Wooden Sword", "Pocketful of Smooth Stones"))
                .build();

        Species dwarf = Species.builder()
                .name("Dwarfling")
                .universe(Universe.LORD_OF_THE_RINGS)
                .allowedWeapons(List.of("Toy Mining Pick", "Small Wooden Shield", "Practice Axe"))
                .build();

        speciesRepository.saveAll(List.of(porg, ewok, hobbit, dwarf));
        System.out.println("Loaded initial species data into the database.");
    }
}
