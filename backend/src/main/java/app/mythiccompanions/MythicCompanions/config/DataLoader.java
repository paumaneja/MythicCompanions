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

        // Porg Assets
        Map<String, String> porgAssets = new HashMap<>();
        porgAssets.put("image_default", "porg_default.png");
        porgAssets.put("image_weapon_Chewie's_Stolen_Datapad", "porg_datapad.png");
        porgAssets.put("image_weapon_Luminescent_Crystal", "porg_crystal.png");
        porgAssets.put("image_weapon_Small_Coaxium_Canister", "porg_coaxium.png");
        porgAssets.put("video_action_feed", "porg_feed.mp4");
        porgAssets.put("video_action_play", "porg_play.mp4");
        porgAssets.put("video_action_sleep", "porg_sleep.mp4");
        porgAssets.put("video_action_clean", "porg_clean.mp4");
        porgAssets.put("video_action_train_Chewie's_Stolen_Datapad", "porg_train_datapad.mp4");
        porgAssets.put("video_action_train_Luminescent_Crystal", "porg_train_crystal.mp4");
        porgAssets.put("video_action_train_Small_Coaxium_Canister", "porg_train_coaxium.mp4");

        // Ewok Assets
        Map<String, String> ewokAssets = new HashMap<>();
        ewokAssets.put("image_default", "ewok_default.png");
        ewokAssets.put("image_weapon_Miniature_Sling", "ewok_sling.png");
        ewokAssets.put("image_weapon_Small_Wooden_Spear", "ewok_spear.png");
        ewokAssets.put("image_weapon_Drumsticks", "ewok_drums.png");
        ewokAssets.put("video_action_feed", "ewok_feed.mp4");
        ewokAssets.put("video_action_play", "ewok_play.mp4");
        ewokAssets.put("video_action_sleep", "ewok_sleep.mp4");
        ewokAssets.put("video_action_clean", "ewok_clean.mp4");
        ewokAssets.put("video_action_train_Miniature_Sling", "ewok_train_sling.mp4");
        ewokAssets.put("video_action_train_Small_Wooden_Spear", "ewok_train_spear.mp4");
        ewokAssets.put("video_action_train_Drumsticks", "ewok_train_drums.mp4");

        // Hobbit Assets
        Map<String, String> hobbitAssets = new HashMap<>();
        hobbitAssets.put("image_default", "hobbit_default.png");
        hobbitAssets.put("image_weapon_Sturdy_Frying_Pan", "hobbit_pan.png");
        hobbitAssets.put("image_weapon_Wooden_Sword", "hobbit_sword.png");
        hobbitAssets.put("image_weapon_Pocketful_of_Smooth_Stones", "hobbit_stones.png");
        hobbitAssets.put("video_action_feed", "hobbit_feed.mp4");
        hobbitAssets.put("video_action_play", "hobbit_play.mp4");
        hobbitAssets.put("video_action_sleep", "hobbit_sleep.mp4");
        hobbitAssets.put("video_action_clean", "hobbit_clean.mp4");
        hobbitAssets.put("video_action_train_Sturdy_Frying_Pan", "hobbit_train_pan.mp4");
        hobbitAssets.put("video_action_train_Wooden_Sword", "hobbit_train_sword.mp4");
        hobbitAssets.put("video_action_train_Pocketful_of_Smooth_Stones", "hobbit_train_stones.mp4");

        // Dwarfling Assets
        Map<String, String> dwarfAssets = new HashMap<>();
        dwarfAssets.put("image_default", "dwarf_default.png");
        dwarfAssets.put("image_weapon_Toy_Mining_Pick", "dwarf_pick.png");
        dwarfAssets.put("image_weapon_Small_Wooden_Shield", "dwarf_shield.png");
        dwarfAssets.put("image_weapon_Practice_Axe", "dwarf_axe.png");
        dwarfAssets.put("video_action_feed", "dwarf_feed.mp4");
        dwarfAssets.put("video_action_play", "dwarf_play.mp4");
        dwarfAssets.put("video_action_sleep", "dwarf_sleep.mp4");
        dwarfAssets.put("video_action_clean", "dwarf_clean.mp4");
        dwarfAssets.put("video_action_train_Toy_Mining_Pick", "dwarf_train_pick.mp4");
        dwarfAssets.put("video_action_train_Small_Wooden_Shield", "dwarf_train_shield.mp4");
        dwarfAssets.put("video_action_train_Practice_Axe", "dwarf_train_axe.mp4");

        // --- Build Species and assign asset maps ---

        Species porg = Species.builder().name("Porg").universe(Universe.STARWARS).allowedWeapons(new ArrayList<>(List.of("Chewie's Stolen Datapad", "Luminescent Crystal", "Small Coaxium Canister"))).assets(porgAssets).build();
        Species ewok = Species.builder().name("Ewok Whelp").universe(Universe.STARWARS).allowedWeapons(new ArrayList<>(List.of("Miniature Sling", "Small Wooden Spear", "Drumsticks"))).assets(ewokAssets).build();
        Species hobbit = Species.builder().name("Hobbitling").universe(Universe.LORD_OF_THE_RINGS).allowedWeapons(new ArrayList<>(List.of("Sturdy Frying Pan", "Wooden Sword", "Pocketful of Smooth Stones"))).assets(hobbitAssets).build();
        Species dwarf = Species.builder().name("Dwarfling").universe(Universe.LORD_OF_THE_RINGS).allowedWeapons(new ArrayList<>(List.of("Toy Mining Pick", "Small Wooden Shield", "Practice Axe"))).assets(dwarfAssets).build();

        speciesRepository.saveAll(List.of(porg, ewok, hobbit, dwarf));
        System.out.println("Loaded initial species data into the database.");
    }

    private void loadItemData() {
        // --- CONSUMABLES ---
        Item smallHealthPotion = Item.builder().name("Small Health Potion").description("A common potion that restores a small amount of health.").itemType(ItemType.CONSUMABLE).healthBonus(25).build();
        Item lembasBread = Item.builder().name("Lembas Bread").description("A single bite can fill the stomach of a grown man.").itemType(ItemType.CONSUMABLE).hungerBonus(50).energyBonus(20).build();
        Item antidote = Item.builder().name("Antidote").description("A simple remedy that cures sickness.").itemType(ItemType.CONSUMABLE).build();

        // --- WEAPONS from STARWARS Universe ---
        Item datapad = Item.builder().name("Chewie's Stolen Datapad").description("Seems to emit strange frequencies.").itemType(ItemType.WEAPON).build();
        Item crystal = Item.builder().name("Luminescent Crystal").description("It glows with a faint, warm light.").itemType(ItemType.WEAPON).build();
        Item coaxium = Item.builder().name("Small Coaxium Canister").description("Highly volatile. Handle with care.").itemType(ItemType.WEAPON).build();
        Item sling = Item.builder().name("Miniature Sling").description("A simple but effective ranged weapon.").itemType(ItemType.WEAPON).build();
        Item spear = Item.builder().name("Small Wooden Spear").description("Sharpened by a true craftsman.").itemType(ItemType.WEAPON).build();
        Item drumsticks = Item.builder().name("Drumsticks").description("Surprisingly effective for percussion-based attacks.").itemType(ItemType.WEAPON).build();

        // --- WEAPONS from LORD_OF_THE_RINGS Universe ---
        Item pan = Item.builder().name("Sturdy Frying Pan").description("Great for cooking, even better for hitting things.").itemType(ItemType.WEAPON).build();
        Item woodSword = Item.builder().name("Wooden Sword").description("A training sword for a future hero.").itemType(ItemType.WEAPON).build();
        Item stones = Item.builder().name("Pocketful of Smooth Stones").description("Perfectly weighted for throwing.").itemType(ItemType.WEAPON).build();
        Item pick = Item.builder().name("Toy Mining Pick").description("A smaller version of a classic dwarven tool.").itemType(ItemType.WEAPON).build();
        Item shield = Item.builder().name("Small Wooden Shield").description("Offers basic protection.").itemType(ItemType.WEAPON).build();
        Item practiceAxe = Item.builder().name("Practice Axe").description("A dull but sturdy axe, perfect for training.").itemType(ItemType.WEAPON).build();

        itemRepository.saveAll(List.of(
                smallHealthPotion, lembasBread, antidote,
                datapad, crystal, coaxium, sling, spear, drumsticks,
                pan, woodSword, stones, pick, shield, practiceAxe
        ));
        System.out.println("Loaded ALL initial item data into the database.");
    }
}
