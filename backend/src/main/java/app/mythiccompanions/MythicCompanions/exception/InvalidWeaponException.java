package app.mythiccompanions.MythicCompanions.exception;

/**
 * Custom exception for when a user tries to equip a weapon
 * that is not allowed for the companion's species.
 * This will result in a 400 Bad Request.
 */
public class InvalidWeaponException extends RuntimeException {
    public InvalidWeaponException(String message) {
        super(message);
    }
}
