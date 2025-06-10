package app.mythiccompanions.MythicCompanions.repository;

import app.mythiccompanions.MythicCompanions.model.Species;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpeciesRepository extends JpaRepository<Species, Long> {
}
