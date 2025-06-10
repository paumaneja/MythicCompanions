package app.mythiccompanions.MythicCompanions.repository;

import app.mythiccompanions.MythicCompanions.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // This method is crucial for Spring Security to find a user by their username during login.
    Optional<User> findByUsername(String username);
}
