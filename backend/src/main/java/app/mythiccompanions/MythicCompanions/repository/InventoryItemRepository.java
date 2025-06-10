package app.mythiccompanions.MythicCompanions.repository;

import app.mythiccompanions.MythicCompanions.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByOwnerId(Long ownerId);
}
