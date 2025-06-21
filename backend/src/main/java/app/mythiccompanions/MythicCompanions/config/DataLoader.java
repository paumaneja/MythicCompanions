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

    private void loadSpeciesData() {
        // --- GALACTIC REBELLION ---
        Species jedi = Species.builder().name("Jedi Knight").universe(Universe.GALACTIC_REBELLION).allowedWeapons(new ArrayList<>(List.of("lightsaber", "force_glove", "blaster"))).assets(createJediAssets()).build();
        Species ewok = Species.builder().name("Ewok Scout").universe(Universe.GALACTIC_REBELLION).allowedWeapons(new ArrayList<>(List.of("slingshot", "spear", "net"))).assets(createEwokAssets()).build();
        Species droid = Species.builder().name("Service Droid").universe(Universe.GALACTIC_REBELLION).allowedWeapons(new ArrayList<>(List.of("shock_arm", "tool_hand", "data_spike"))).assets(createDroidAssets()).build();

        // --- SQUISHYWORLD ---
        Species cat = Species.builder().name("Cuddle Cat").universe(Universe.SQUISHYWORLD).allowedWeapons(new ArrayList<>(List.of("pillow_paw", "soothing_bell", "nap_blast"))).assets(createCatAssets()).build();
        Species bunny = Species.builder().name("Bunny Bouncer").universe(Universe.SQUISHYWORLD).allowedWeapons(new ArrayList<>(List.of("fluffy_mallet", "cotton_boom", "bounce_ring"))).assets(createBunnyAssets()).build();
        Species unicorn = Species.builder().name("Unicorn Dreamer").universe(Universe.SQUISHYWORLD).allowedWeapons(new ArrayList<>(List.of("sparkle_horn", "dream_dust", "rainbow_wave"))).assets(createUnicornAssets()).build();

        speciesRepository.saveAll(List.of(jedi, ewok, droid, cat, bunny, unicorn));
        System.out.println("Loaded refactored species data into the database.");
    }

    private void loadItemData() {
        // --- CONSUMABLES ---
        Item nanoGel = Item.builder().name("NanoRepair Gel").description("Regenerates +25 health.").itemType(ItemType.CONSUMABLE).healthBonus(25).rarity(ItemRarity.COMMON).build();
        Item marshmallow = Item.builder().name("Marshmallow Snack").description("+10 energy, +10 happiness.").itemType(ItemType.CONSUMABLE).energyBonus(10).happinessBonus(10).rarity(ItemRarity.COMMON).build();
        Item antidote = Item.builder().name("Antidote").description("A simple remedy that cures sickness.").itemType(ItemType.CONSUMABLE).curesSickness(true).rarity(ItemRarity.COMMON).build();

        // --- WEAPONS: GALACTIC REBELLION ---
        Item lightsaber = Item.builder().name("lightsaber").description("An energy sword.").itemType(ItemType.WEAPON).rarity(ItemRarity.RARE).build();
        Item forceGlove = Item.builder().name("force_glove").description("A Force-channeling gauntlet.").itemType(ItemType.WEAPON).rarity(ItemRarity.RARE).build();
        Item blaster = Item.builder().name("blaster").description("Standard issue blaster pistol.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item slingshot = Item.builder().name("slingshot").description("A sturdy wooden slingshot.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item spear = Item.builder().name("spear").description("A sharpened spear.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item net = Item.builder().name("net").description("A net for capturing enemies.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item shockArm = Item.builder().name("shock_arm").description("An arm with an electric discharge capability.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item toolHand = Item.builder().name("tool_hand").description("A hand with multiple tools.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item dataSpike = Item.builder().name("data_spike").description("A tool for hacking systems.").itemType(ItemType.WEAPON).rarity(ItemRarity.UNCOMMON).build();

        // --- WEAPONS: SQUISHYWORLD ---
        Item pillowPaw = Item.builder().name("pillow_paw").description("A soft and calming hit.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item soothingBell = Item.builder().name("soothing_bell").description("Calms the opponent and increases happiness.").itemType(ItemType.WEAPON).happinessBonus(15).rarity(ItemRarity.UNCOMMON).build();
        Item napBlast = Item.builder().name("nap_blast").description("A blast of sleepiness.").itemType(ItemType.WEAPON).rarity(ItemRarity.RARE).build();
        Item fluffyMallet = Item.builder().name("fluffy_mallet").description("A bouncy attack mallet.").itemType(ItemType.WEAPON).rarity(ItemRarity.COMMON).build();
        Item cottonBoom = Item.builder().name("cotton_boom").description("A stunning cotton explosion.").itemType(ItemType.WEAPON).rarity(ItemRarity.UNCOMMON).build();
        Item bounceRing = Item.builder().name("bounce_ring").description("A ring that creates bouncing waves.").itemType(ItemType.WEAPON).rarity(ItemRarity.UNCOMMON).build();
        Item sparkleHorn = Item.builder().name("sparkle_horn").description("A horn that emits magical sparkles.").itemType(ItemType.WEAPON).rarity(ItemRarity.UNCOMMON).build();
        Item dreamDust = Item.builder().name("dream_dust").description("Puts the enemy to sleep for 1 turn.").itemType(ItemType.WEAPON).rarity(ItemRarity.RARE).build();
        Item rainbowWave = Item.builder().name("rainbow_wave").description("A confusing wave of colors.").itemType(ItemType.WEAPON).rarity(ItemRarity.RARE).build();


        itemRepository.saveAll(List.of(
                nanoGel, marshmallow, antidote, lightsaber, forceGlove, blaster, slingshot, spear, net, shockArm, toolHand, dataSpike,
                pillowPaw, soothingBell, napBlast, fluffyMallet, cottonBoom, bounceRing, sparkleHorn, dreamDust, rainbowWave
        ));
        System.out.println("Loaded refactored item data into the database.");
    }

    private void loadQuestionData() {
        Question q1 = Question.builder()
                .questionText("What is the name of the planet where Luke Skywalker grew up?")
                .options(List.of("Coruscant", "Naboo", "Tatooine", "Alderaan"))
                .correctAnswer("Tatooine")
                .universe(Universe.GALACTIC_REBELLION)
                .build();

        Question q2 = Question.builder()
                .questionText("What is the name of Han Solo's ship?")
                .options(List.of("Star Destroyer", "X-Wing", "Slave I", "Millennium Falcon"))
                .correctAnswer("Millennium Falcon")
                .universe(Universe.GALACTIC_REBELLION)
                .build();

        Question q3 = Question.builder()
                .questionText("Which species is known for its 'nap_blast' attack?")
                .options(List.of("Cuddle Cat", "Bunny Bouncer", "Unicorn Dreamer"))
                .correctAnswer("Cuddle Cat")
                .universe(Universe.SQUISHYWORLD)
                .build();

        questionRepository.saveAll(List.of(q1, q2, q3));
        System.out.println("Loaded refactored quiz question data into the database.");
    }

    private Map<String, String> createJediAssets() {
        Map<String, String> assets = new HashMap<>();
        assets.put("image_default", "jedi_default.png");
        assets.put("image_weapon_lightsaber", "jedi_lightsaber.png");
        assets.put("image_weapon_force_glove", "jedi_glove.png");
        assets.put("image_weapon_blaster", "jedi_blaster.png");
        assets.put("video_action_feed", "jedi_feed.mp4");
        assets.put("video_action_play", "jedi_play.mp4");
        assets.put("video_action_sleep", "jedi_sleep.mp4");
        assets.put("video_action_clean", "jedi_clean.mp4");
        assets.put("video_action_train_lightsaber", "jedi_train_lightsaber.mp4");
        assets.put("video_action_train_force_glove", "jedi_train_glove.mp4");
        assets.put("video_action_train_blaster", "jedi_train_blaster.mp4");
        return assets;
    }

    private Map<String, String> createEwokAssets() {
        Map<String, String> assets = new HashMap<>();
        assets.put("image_default", "ewok_default.png");
        assets.put("image_weapon_slingshot", "ewok_slingshot.png");
        assets.put("image_weapon_spear", "ewok_spear.png");
        assets.put("image_weapon_net", "ewok_net.png");
        assets.put("video_action_feed", "ewok_feed.mp4");
        assets.put("video_action_play", "ewok_play.mp4");
        assets.put("video_action_sleep", "ewok_sleep.mp4");
        assets.put("video_action_clean", "ewok_clean.mp4");
        assets.put("video_action_train_slingshot", "ewok_train_slingshot.mp4");
        assets.put("video_action_train_spear", "ewok_train_spear.mp4");
        assets.put("video_action_train_net", "ewok_train_net.mp4");
        return assets;
    }

    private Map<String, String> createDroidAssets() {
        Map<String, String> assets = new HashMap<>();
        assets.put("image_default", "droid_default.png");
        assets.put("image_weapon_shock_arm", "droid_shock.png");
        assets.put("image_weapon_tool_hand", "droid_tool.png");
        assets.put("image_weapon_data_spike", "droid_spike.png");
        assets.put("video_action_feed", "droid_feed.mp4");
        assets.put("video_action_play", "droid_play.mp4");
        assets.put("video_action_sleep", "droid_sleep.mp4");
        assets.put("video_action_clean", "droid_clean.mp4");
        assets.put("video_action_train_shock_arm", "droid_train_shock.mp4");
        assets.put("video_action_train_tool_hand", "droid_train_tool.mp4");
        assets.put("video_action_train_data_spike", "droid_train_spike.mp4");
        return assets;
    }

    private Map<String, String> createCatAssets() {
        Map<String, String> assets = new HashMap<>();
        assets.put("image_default", "cat_default.png");
        assets.put("image_weapon_pillow_paw", "cat_pillow.png");
        assets.put("image_weapon_soothing_bell", "cat_bell.png");
        assets.put("image_weapon_nap_blast", "cat_nap.png");
        assets.put("video_action_feed", "cat_feed.mp4");
        assets.put("video_action_play", "cat_play.mp4");
        assets.put("video_action_sleep", "cat_sleep.mp4");
        assets.put("video_action_clean", "cat_clean.mp4");
        assets.put("video_action_train_pillow_paw", "cat_train_pillow.mp4");
        assets.put("video_action_train_soothing_bell", "cat_train_bell.mp4");
        assets.put("video_action_train_nap_blast", "cat_train_nap.mp4");
        return assets;
    }

    private Map<String, String> createBunnyAssets() {
        Map<String, String> assets = new HashMap<>();
        assets.put("image_default", "bunny_default.png");
        assets.put("image_weapon_fluffy_mallet", "bunny_mallet.png");
        assets.put("image_weapon_cotton_boom", "bunny_boom.png");
        assets.put("image_weapon_bounce_ring", "bunny_ring.png");
        assets.put("video_action_feed", "bunny_feed.mp4");
        assets.put("video_action_play", "bunny_play.mp4");
        assets.put("video_action_sleep", "bunny_sleep.mp4");
        assets.put("video_action_clean", "bunny_clean.mp4");
        assets.put("video_action_train_fluffy_mallet", "bunny_train_mallet.mp4");
        assets.put("video_action_train_cotton_boom", "bunny_train_boom.mp4");
        assets.put("video_action_train_bounce_ring", "bunny_train_ring.mp4");
        return assets;
    }

    private Map<String, String> createUnicornAssets() {
        Map<String, String> assets = new HashMap<>();
        assets.put("image_default", "unicorn_default.png");
        assets.put("image_weapon_sparkle_horn", "unicorn_horn.png");
        assets.put("image_weapon_dream_dust", "unicorn_dust.png");
        assets.put("image_weapon_rainbow_wave", "unicorn_wave.png");
        assets.put("video_action_feed", "unicorn_feed.mp4");
        assets.put("video_action_play", "unicorn_play.mp4");
        assets.put("video_action_sleep", "unicorn_sleep.mp4");
        assets.put("video_action_clean", "unicorn_clean.mp4");
        assets.put("video_action_train_sparkle_horn", "unicorn_train_horn.mp4");
        assets.put("video_action_train_dream_dust", "unicorn_train_dust.mp4");
        assets.put("video_action_train_rainbow_wave", "unicorn_train_wave.mp4");
        return assets;
    }
}