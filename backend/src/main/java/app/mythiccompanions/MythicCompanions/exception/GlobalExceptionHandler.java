package app.mythiccompanions.MythicCompanions.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * A central place to handle exceptions thrown across the whole application.
 * It catches specific exceptions and formats a standard HTTP response.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles ResourceNotFoundException and returns a 404 Not Found response.
     * @param ex The caught ResourceNotFoundException.
     * @return A ResponseEntity with the error message and 404 status.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleResourceNotFoundException(ResourceNotFoundException ex) {
        // You could return a more complex JSON object here if you wanted
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    /**
     * A catch-all handler for any other unhandled exceptions.
     * Returns a 500 Internal Server Error response.
     * @param ex The caught Exception.
     * @return A generic 500 error response.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception ex) {
        // It's good practice to log the exception here
        // log.error("An unexpected error occurred", ex);
        return new ResponseEntity<>("An unexpected internal server error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handles CompanionInteractionException and returns a 400 Bad Request response.
     * This is for logically invalid actions requested by the user.
     * @param ex The caught CompanionInteractionException.
     * @return A ResponseEntity with the error message and 400 status.
     */
    @ExceptionHandler(CompanionInteractionException.class)
    public ResponseEntity<String> handleCompanionInteractionException(CompanionInteractionException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles UnauthorizedOperationException and returns a 403 Forbidden response.
     * This is for security violations where a user tries to access another user's resources.
     * @param ex The caught UnauthorizedOperationException.
     * @return A ResponseEntity with the error message and 403 status.
     */
    @ExceptionHandler(UnauthorizedOperationException.class)
    public ResponseEntity<String> handleUnauthorizedOperationException(UnauthorizedOperationException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.FORBIDDEN);
    }
}