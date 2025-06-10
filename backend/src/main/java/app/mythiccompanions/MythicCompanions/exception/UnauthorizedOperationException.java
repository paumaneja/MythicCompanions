package app.mythiccompanions.MythicCompanions.exception;

/**
 * Custom exception for when a user tries to perform an action
 * on a resource they do not own.
 * This will typically result in a 403 Forbidden.
 */
public class UnauthorizedOperationException extends RuntimeException {
    public UnauthorizedOperationException(String message) {
        super(message);
    }
}
