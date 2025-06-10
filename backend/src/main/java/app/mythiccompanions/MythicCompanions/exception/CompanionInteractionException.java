package app.mythiccompanions.MythicCompanions.exception;

/**
 * Custom exception for invalid interactions with a companion,
 * e.g., trying to make a non-tired companion sleep.
 * This will typically result in a 400 Bad Request.
 */
public class CompanionInteractionException extends RuntimeException {
    public CompanionInteractionException(String message) {
        super(message);
    }
}
