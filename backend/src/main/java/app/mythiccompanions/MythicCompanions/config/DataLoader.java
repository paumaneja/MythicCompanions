package app.mythiccompanions.MythicCompanions.config;

import app.mythiccompanions.MythicCompanions.enums.ItemType;
import app.mythiccompanions.MythicCompanions.enums.Universe;
import app.mythiccompanions.MythicCompanions.model.Item;
import app.mythiccompanions.MythicCompanions.model.Species;
import app.mythiccompanions.MythicCompanions.repository.SpeciesRepository;
import app.mythiccompanions.MythicCompanions.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.ArrayList;

/**
 * This component runs on application startup and pre-loads the database
 * with some initial species data if the species table is empty.
 */
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final SpeciesRepository speciesRepository;
    private final ItemRepository itemRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if the species table is empty before populating
        if (speciesRepository.count() == 0) {
            loadSpeciesData();
        }
        if (itemRepository.count() == 0) {
            loadItemData();
        }
    }

    private void loadSpeciesData() {
        // --- STAR WARS SPECIES ---
        Species porg = Species.builder()
                .name("Porg")
                .universe(Universe.STARWARS)
                .allowedWeapons(new ArrayList<>(List.of("Chewie's Stolen Datapad", "Luminescent Crystal", "Small Coaxium Canister")))
                .build();

        Species ewok = Species.builder()
                .name("Ewok Whelp")
                .universe(Universe.STARWARS)
                .allowedWeapons(new ArrayList<>(List.of("Miniature Sling", "Small Wooden Spear", "Drumsticks")))
                .build();

        // --- LORD OF THE RINGS SPECIES ---
        Species hobbit = Species.builder()
                .name("Hobbitling")
                .universe(Universe.LORD_OF_THE_RINGS)
                .allowedWeapons(new ArrayList<>(List.of("Sturdy Frying Pan", "Wooden Sword", "Pocketful of Smooth Stones")))
                .build();

        Species dwarf = Species.builder()
                .name("Dwarfling")
                .universe(Universe.LORD_OF_THE_RINGS)
                .allowedWeapons(new ArrayList<>(List.of("Toy Mining Pick", "Small Wooden Shield", "Practice Axe")))
                .build();

        speciesRepository.saveAll(List.of(porg, ewok, hobbit, dwarf));
        System.out.println("Loaded initial species data into the database.");
    }

    private void loadItemData() {
        Item smallHealthPotion = Item.builder()
                .name("Small Health Potion")
                .description("A common potion that restores a small amount of health.")
                .itemType(ItemType.CONSUMABLE)
                .healthBonus(25)
                .build();

        Item lembasBread = Item.builder()
                .name("Lembas Bread")
                .description("A single bite can fill the stomach of a grown man.")
                .itemType(ItemType.CONSUMABLE)
                .hungerBonus(50)
                .energyBonus(20)
                .build();

        Item antidote = Item.builder()
                .name("Antidote")
                .description("A simple remedy that cures sickness.")
                .itemType(ItemType.CONSUMABLE)
                .build();

        Item jediRobe = Item.builder()
                .name("Miniature Jedi Robe")
                .description("A small, brown robe suitable for a young apprentice.")
                .itemType(ItemType.COSMETIC)
                .build();

        itemRepository.saveAll(List.of(smallHealthPotion, lembasBread, antidote, jediRobe));
        System.out.println("Loaded initial item data into the database.");
    }
}
