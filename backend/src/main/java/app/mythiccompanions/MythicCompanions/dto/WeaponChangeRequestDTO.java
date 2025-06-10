package app.mythiccompanions.MythicCompanions.dto;

import lombok.Data;

/**
 * DTO for the request to change a companion's weapon.
 */
@Data
public class WeaponChangeRequestDTO {
    private String weaponName;
}
