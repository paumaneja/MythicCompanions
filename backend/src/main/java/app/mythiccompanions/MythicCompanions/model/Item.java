package app.mythiccompanions.MythicCompanions.model;

import app.mythiccompanions.MythicCompanions.enums.ItemType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an item template in the game's catalog.
 * It defines the properties of an item that can be owned by a user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Lob // For potentially long descriptions
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType itemType;

    // --- Effect Fields (for consumables) ---
    private Integer healthBonus;
    private Integer hungerBonus;
    private Integer energyBonus;
    private Integer happinessBonus;
}
