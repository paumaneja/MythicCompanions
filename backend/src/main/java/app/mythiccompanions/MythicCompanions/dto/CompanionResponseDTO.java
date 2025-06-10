package app.mythiccompanions.MythicCompanions.dto;

import app.mythiccompanions.MythicCompanions.enums.Universe;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * DTO for representing a companion in API responses.
 */
@Data
@Builder
public class CompanionResponseDTO {
    private Long id;
    private String name;
    private String speciesName;
    private Universe universe;
    private int health;
    private int hunger;
    private int energy;
    private int happiness;
    private int hygiene;
    private int skill;
    private String currentWeapon;
    private List<String> allowedWeapons;
}
