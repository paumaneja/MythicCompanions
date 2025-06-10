package app.mythiccompanions.MythicCompanions.model;

import app.mythiccompanions.MythicCompanions.exception.CompanionInteractionException;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
     * Stats are floored at 0.
     */
    public void play() {
        this.setEnergy(Math.max(this.getEnergy() - 20, 0));
        this.setHunger(Math.max(this.getHunger() - 10, 0));
        this.setHappiness(Math.min(this.getHappiness() + 20, 100));
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
}
