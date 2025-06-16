package app.mythiccompanions.MythicCompanions.config;

import app.mythiccompanions.MythicCompanions.enums.ItemRarity;
import app.mythiccompanions.MythicCompanions.enums.ItemType;
import app.mythiccompanions.MythicCompanions.enums.Universe;
import app.mythiccompanions.MythicCompanions.model.Item;
import app.mythiccompanions.MythicCompanions.model.Question;
import app.mythiccompanions.MythicCompanions.model.Species;
import app.mythiccompanions.MythicCompanions.repository.SpeciesRepository;
import app.mythiccompanions.MythicCompanions.repository.ItemRepository;
import app.mythiccompanions.MythicCompanions.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

/**
 * This component runs on application startup and pre-loads the database
 * with some initial species data if the species table is empty.
 */
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final SpeciesRepository speciesRepository;
    private final ItemRepository itemRepository;
    private final QuestionRepository questionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (speciesRepository.count() == 0) {
            loadSpeciesData();
        }
        if (itemRepository.count() == 0) {
            loadItemData();
        }
        if (questionRepository.count() == 0) {
            loadQuestionData();
        }
    }

    private void loadQuestionData() {
        Question q1 = Question.builder()
                .questionText("What is the name of the planet where Luke Skywalker grew up?")
                .options(List.of("Coruscant", "Naboo", "Tatooine", "Alderaan"))
                .correctAnswer("Tatooine")
                .universe(Universe.STARWARS)
                .build();

        Question q2 = Question.builder()
                .questionText("Who is the guardian of the One Ring at the beginning of 'The Fellowship of the Ring'?")
                .options(List.of("Gandalf", "Frodo Baggins", "Bilbo Baggins", "Elrond"))
                .correctAnswer("Bilbo Baggins")
                .universe(Universe.LORD_OF_THE_RINGS)
                .build();

        Question q3 = Question.builder()
                .questionText("What is the name of Han Solo's ship?")
                .options(List.of("Star Destroyer", "X-Wing", "Slave I", "Millennium Falcon"))
                .correctAnswer("Millennium Falcon")
                .universe(Universe.STARWARS)
                .build();

        Question q4 = Question.builder()
                .questionText("Which race is known for their exceptional archery skills in Middle-earth?")
                .options(List.of("Dwarves", "Hobbits", "Elves", "Men of Gondor"))
                .correctAnswer("Elves")
                .universe(Universe.LORD_OF_THE_RINGS)
                .build();

        questionRepository.saveAll(List.of(q1, q2, q3, q4));
        System.out.println("Loaded initial quiz question data into the database.");
    }

    private void loadSpeciesData() {
        Species porg = Species.builder().name("Porg").universe(Universe.STARWARS).allowedWeapons(new ArrayList<>(List.of("Chewie's Stolen Datapad", "Luminescent Crystal", "Small Coaxium Canister"))).assets(createPorgAssets()).build();
        Species ewok = Species.builder().name("Ewok Whelp").universe(Universe.STARWARS).allowedWeapons(new ArrayList<>(List.of("Miniature Sling", "Small Wooden Spear", "Drumsticks"))).assets(createEwokAssets()).build();
        Species hobbit = Species.builder().name("Hobbitling").universe(Universe.LORD_OF_THE_RINGS).allowedWeapons(new ArrayList<>(List.of("Sturdy Frying Pan", "Wooden Sword", "Pocketful of Smooth Stones"))).assets(createHobbitAssets()).build();
        Species dwarf = Species.builder().name("Dwarfling").universe(Universe.LORD_OF_THE_RINGS).allowedWeapons(new ArrayList<>(List.of("Toy Mining Pick", "Small Wooden Shield", "Practice Axe"))).assets(createDwarfAssets()).build();

        speciesRepository.saveAll(List.of(porg, ewok, hobbit, dwarf));
        System.out.println("Loaded initial species data into the database.");
    }

    // --- Private Helper Methods for creating Asset Maps ---

    private Map<String, String> createPorgAssets() {
        Map<String, String> assets = new HashMap<>();
        assets.put("image_default", "porg_default.png");
        assets.put("image_weapon_Chewie's_Stolen_Datapad", "porg_datapad.png");
        assets.put("image_weapon_Luminescent_Crystal", "porg_crystal.png");
        assets.put("image_weapon_Small_Coaxium_Canister", "porg_coaxium.png");
        assets.put("video_action_feed", "porg_feed.mp4");
        assets.put("video_action_play", "porg_play.mp4");
        assets.put("video_action_sleep", "porg_sleep.mp4");
        assets.put("video_action_clean", "porg_clean.mp4");
        assets.put("video_action_train_Chewie's_Stolen_Datapad", "porg_train_datapad.mp4");
        assets.put("video_action_train_Luminescent_Crystal", "porg_train_crystal.mp4");
        assets.put("video_action_train_Small_Coaxium_Canister", "porg_train_coaxium.mp4");
        return assets;
    }

    private Map<String, String> createEwokAssets() {
        Map<String, String> assets = new HashMap<>();
        assets.put("image_default", "ewok_default.png");
        assets.put("image_weapon_Miniature_Sling", "ewok_sling.png");
        assets.put("image_weapon_Small_Wooden_Spear", "ewok_spear.png");
        assets.put("image_weapon_Drumsticks", "ewok_drums.png");
        assets.put("video_action_feed", "ewok_feed.mp4");
        assets.put("video_action_play", "ewok_play.mp4");
        assets.put("video_action_sleep", "ewok_sleep.mp4");
        assets.put("video_action_clean", "ewok_clean.mp4");
        assets.put("video_action_train_Miniature_Sling", "ewok_train_sling.mp4");
        assets.put("video_action_train_Small_Wooden_Spear", "ewok_train_spear.mp4");
        assets.put("video_action_train_Drumsticks", "ewok_train_drums.mp4");
        return assets;
    }

    private Map<String, String> createHobbitAssets() {
        Map<String, String> assets = new HashMap<>();
        assets.put("image_default", "hobbit_default.png");
        assets.put("image_weapon_Sturdy_Frying_Pan", "hobbit_pan.png");
        assets.put("image_weapon_Wooden_Sword", "hobbit_sword.png");
        assets.put("image_weapon_Pocketful_of_Smooth_Stones", "hobbit_stones.png");
        assets.put("video_action_feed", "hobbit_feed.mp4");
        assets.put("video_action_play", "hobbit_play.mp4");
        assets.put("video_action_sleep", "hobbit_sleep.mp4");
        assets.put("video_action_clean", "hobbit_clean.mp4");
        assets.put("video_action_train_Sturdy_Frying_Pan", "hobbit_train_pan.mp4");
        assets.put("video_action_train_Wooden_Sword", "hobbit_train_sword.mp4");
        assets.put("video_action_train_Pocketful_of_Smooth_Stones", "hobbit_train_stones.mp4");
        return assets;
    }

    private Map<String, String> createDwarfAssets() {
        Map<String, String> assets = new HashMap<>();
        assets.put("image_default", "dwarf_default.png");
        assets.put("image_weapon_Toy_Mining_Pick", "dwarf_pick.png");
        assets.put("image_weapon_Small_Wooden_Shield", "dwarf_shield.png");
        assets.put("image_weapon_Practice_Axe", "dwarf_axe.png");
        assets.put("video_action_feed", "dwarf_feed.mp4");
        assets.put("video_action_play", "dwarf_play.mp4");
        assets.put("video_action_sleep", "dwarf_sleep.mp4");
        assets.put("video_action_clean", "dwarf_clean.mp4");
        assets.put("video_action_train_Toy_Mining_Pick", "dwarf_train_pick.mp4");
        assets.put("video_action_train_Small_Wooden_Shield", "dwarf_train_shield.mp4");
        assets.put("video_action_train_Practice_Axe", "dwarf_train_axe.mp4");
        return assets;
    }

    private void loadItemData() {
        // --- CONSUMABLES ---
        Item smallHealthPotion = Item.builder().name("Small Health Potion").description("A common potion that restores a small amount of health.").itemType(ItemType.CONSUMABLE).healthBonus(25).rarity(ItemRarity.COMMON).build();
        Item lembasBread = Item.builder().name("Lembas Bread").description("A single bite can fill the stomach of a grown man.").itemType(ItemType.CONSUMABLE).hungerBonus(50).energyBonus(20).rarity(ItemRarity.COMMON).build();
        Item antidote = Item.builder().name("Antidote").description("A simple remedy that cures sickness.").itemType(ItemType.CONSUMABLE).rarity(ItemRarity.COMMON).build();

        // --- WEAPONS from STARWARS Universe ---
        Item datapad = Item.builder().name("Chewie's Stolen Datapad").description("Seems to emit strange frequencies.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item crystal = Item.builder().name("Luminescent Crystal").description("It glows with a faint, warm light.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item coaxium = Item.builder().name("Small Coaxium Canister").description("Highly volatile. Handle with care.").itemType(ItemType.WEAPON).rarity(ItemRarity.RARE).build();
        Item sling = Item.builder().name("Miniature Sling").description("A simple but effective ranged weapon.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item spear = Item.builder().name("Small Wooden Spear").description("Sharpened by a true craftsman.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item drumsticks = Item.builder().name("Drumsticks").description("Surprisingly effective for percussion-based attacks.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();

        // --- WEAPONS from LORD_OF_THE_RINGS Universe ---
        Item pan = Item.builder().name("Sturdy Frying Pan").description("Great for cooking, even better for hitting things.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item woodSword = Item.builder().name("Wooden Sword").description("A training sword for a future hero.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item stones = Item.builder().name("Pocketful of Smooth Stones").description("Perfectly weighted for throwing.").itemType(ItemType.WEAPON).rarity(ItemRarity.RARE).build();
        Item pick = Item.builder().name("Toy Mining Pick").description("A smaller version of a classic dwarven tool.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item shield = Item.builder().name("Small Wooden Shield").description("Offers basic protection.").itemType(ItemType.WEAPON).rarity(ItemRarity.RARE).build();
        Item practiceAxe = Item.builder().name("Practice Axe").description("A dull but sturdy axe, perfect for training.").itemType(ItemType.WEAPON).rarity(ItemRarity.LEGENDARY).build();

        itemRepository.saveAll(List.of(
                smallHealthPotion, lembasBread, antidote,
                datapad, crystal, coaxium, sling, spear, drumsticks,
                pan, woodSword, stones, pick, shield, practiceAxe
        ));
        System.out.println("Loaded ALL initial item data into the database.");
    }
}
