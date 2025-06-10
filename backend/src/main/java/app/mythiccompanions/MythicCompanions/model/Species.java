package app.mythiccompanions.MythicCompanions.model;

import app.mythiccompanions.MythicCompanions.enums.Universe;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents a species of companion, defining its base characteristics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "species")
public class Species {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Universe universe;

    // A list of weapons that this species is allowed to use.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "species_allowed_weapons", joinColumns = @JoinColumn(name = "species_id"))
    @Column(name = "weapon", nullable = false)
    private List<String> allowedWeapons;
}
