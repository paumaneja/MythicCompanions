package app.mythiccompanions.MythicCompanions.model;

import app.mythiccompanions.MythicCompanions.exception.CompanionInteractionException;
import app.mythiccompanions.MythicCompanions.exception.InvalidWeaponException;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents an individual companion instance owned by a user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "companions")
public class Companion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // A companion must belong to a species.
    @ManyToOne(optional = false)
    @JoinColumn(name = "species_id", nullable = false)
    private Species species;

    // New detailed stats as per the design document.
    @Column(nullable = false)
    private int health = 100; // ❤️ Life/Health (0-100)

    @Column(nullable = false)
    private int hunger = 100; // 🍗 Hunger (0-100)

    @Column(nullable = false)
    private int energy = 100; // 😴 Energy/Rest (0-100)

    @Column(nullable = false)
    private int happiness = 100; // 😊 Happiness/Mood (0-100)

    @Column(nullable = false)
    private int hygiene = 100; // 🧼 Hygiene (0-100)

    @Column(nullable = false)
    private int skill = 0; // 🎓 Skill/Training (0-100)

    @Column(nullable = false)
    private boolean sick = false;

    @Column(nullable = false)
    private LocalDateTime lastUpdated;

    // The currently equipped weapon.
    private String currentWeapon;

    // The user who owns this companion.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User owner;


    /**
     * Increases the companion's hunger stat.
     * Stats are capped at 100.
     */
    public void feed() {
        this.setHunger(Math.min(this.getHunger() + 15, 100));
        this.setHappiness(Math.min(this.getHappiness() + 5, 100));
    }

    /**
     * Decreases energy and hunger, but increases happiness.
     * Playing also decreases hygiene and can make the companion sick if hygiene is too low.
     * Stats are floored at 0.
     */
    public void play() {
        this.setEnergy(Math.max(this.getEnergy() - 20, 0));
        this.setHunger(Math.max(this.getHunger() - 10, 0));
        this.setHappiness(Math.min(this.getHappiness() + 20, 100));
        this.setHygiene(Math.max(this.getHygiene() - 15, 0)); // Playing gets the companion dirty

        // If hygiene drops below a threshold, the companion gets sick.
        if (this.getHygiene() < 20) {
            this.setSick(true);
            this.setHealth(Math.max(this.getHealth() - 25, 0)); // Sickness also reduces health
        }
    }

    /**
     * Fully restores the companion's energy.
     * A companion can only sleep if its energy is below a certain threshold.
     */
    public void sleep() {
        if (this.getEnergy() < 50) {
            this.setEnergy(100);
        } else {
            throw new CompanionInteractionException("Companion is not tired enough to sleep.");
        }
    }

    /**
     * Changes the companion's current weapon.
     * @param newWeapon The name of the new weapon to equip.
     * @throws InvalidWeaponException if the weapon is not in the allowed list for the species.
     */
    public void changeWeapon(String newWeapon) {
        // Check if the new weapon is in the list of allowed weapons for this companion's species.
        if (this.getSpecies().getAllowedWeapons().contains(newWeapon)) {
            this.setCurrentWeapon(newWeapon);
        } else {
            throw new InvalidWeaponException("Weapon '" + newWeapon + "' is not allowed for species '" + this.getSpecies().getName() + "'.");
        }
    }

    /**
     * Increases the companion's skill stat through training.
     * Training requires a weapon to be equipped and consumes energy.
     * @throws CompanionInteractionException if no weapon is currently equipped.
     */
    public void train() {
        if (this.getCurrentWeapon() == null || this.getCurrentWeapon().isEmpty()) {
            throw new CompanionInteractionException("Cannot train without a weapon equipped.");
        }

        // Training consumes energy but increases skill and a bit of happiness
        this.setEnergy(Math.max(this.getEnergy() - 15, 0));
        this.setSkill(Math.min(this.getSkill() + 10, 100));
        this.setHappiness(Math.min(this.getHappiness() + 5, 100));
    }

    /**
     * Fully restores the companion's hygiene.
     */
    public void clean() {
        this.setHygiene(100);
        // Cleaning a pet also makes it a little happier.
        this.setHappiness(Math.min(this.getHappiness() + 5, 100));
    }

    /**
     * Heals the companion if it is sick, restoring its health.
     * @throws CompanionInteractionException if the companion is not sick.
     */
    public void heal() {
        if (this.isSick()) {
            this.setSick(false);
            this.setHealth(100);
        } else {
            throw new CompanionInteractionException("Companion is not sick and does not need medicine.");
        }
    }

    /**
     * Updates the companion's stats based on the time elapsed since the last update.
     * This simulates passive stat decay.
     */
    public void updateStatsOverTime() {
        if (this.lastUpdated == null) {
            this.lastUpdated = LocalDateTime.now();
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        long minutesElapsed = java.time.Duration.between(this.lastUpdated, now).toMinutes();

        if (minutesElapsed > 0) {
            // Example decay rates:
            // - Hunger decreases by 1 every 20 minutes
            // - Happiness decreases by 1 every 30 minutes
            // - Hygiene decreases by 1 every 60 minutes
            int hungerDecay = (int) (minutesElapsed / 20);
            int happinessDecay = (int) (minutesElapsed / 30);
            int hygieneDecay = (int) (minutesElapsed / 60);

            this.setHunger(Math.max(0, this.getHunger() - hungerDecay));
            this.setHappiness(Math.max(0, this.getHappiness() - happinessDecay));
            this.setHygiene(Math.max(0, this.getHygiene() - hygieneDecay));

            // After calculating decay, update the timestamp to now.
            this.lastUpdated = now;
        }
    }
}
