package app.mythiccompanions.MythicCompanions.exception;

/**
 * Custom exception for cases where a requested resource is not found.
 * This will be handled by the GlobalExceptionHandler.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
