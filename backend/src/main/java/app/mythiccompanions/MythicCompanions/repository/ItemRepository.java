package app.mythiccompanions.MythicCompanions.repository;

import app.mythiccompanions.MythicCompanions.enums.ItemRarity;
import app.mythiccompanions.MythicCompanions.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByRarity(ItemRarity rarity);
}
