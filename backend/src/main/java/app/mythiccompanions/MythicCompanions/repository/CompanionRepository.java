package app.mythiccompanions.MythicCompanions.repository;

import app.mythiccompanions.MythicCompanions.model.Companion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanionRepository extends JpaRepository<Companion, Long> {
    // Find all companions owned by a specific user.
    List<Companion> findByOwnerId(Long ownerId);
}
