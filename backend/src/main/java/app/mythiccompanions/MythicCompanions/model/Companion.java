package app.mythiccompanions.MythicCompanions.model;

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
    // Note: We might need to add the other side of this relationship in the User entity later.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User owner;

}
