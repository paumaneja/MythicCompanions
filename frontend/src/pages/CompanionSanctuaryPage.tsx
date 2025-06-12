import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './CompanionSanctuaryPage.css';
import { isAxiosError } from 'axios';

interface Companion {
  id: number;
  name: string;
  speciesName: string;
  universe: string;
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  hygiene: number;
  skill: number;
  sick: boolean;
}
interface Item {
  id: number;
  name: string;
  description: string;
  itemType: 'CONSUMABLE' | 'WEAPON' | 'ARMOR' | 'COSMETIC';
}
interface InventoryItem {
  inventoryItemId: number;
  quantity: number;
  item: Item;
}

const CompanionSanctuaryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interactionMessage, setInteractionMessage] = useState('');

  const fetchInventory = async () => {
    try {
      const inventoryResponse = await api.get('/api/inventory');
      setInventory(inventoryResponse.data);
    } catch (err) {
      console.error("Failed to refetch inventory:", err);
      // We don't set a general error here to not override a potential companion error
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const companionPromise = api.get(`/api/companions/${id}`);
        const inventoryPromise = api.get('/api/inventory');
        
        const [companionResponse, inventoryResponse] = await Promise.all([
          companionPromise,
          inventoryPromise,
        ]);

        setCompanion(companionResponse.data);
        setInventory(inventoryResponse.data);

      } catch (err) {
        console.error("Failed to fetch page data:", err);
        setError('Could not load page data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleInteract = async (action: string) => {
    if (!id) return;
    try {
      setInteractionMessage(`Performing action: ${action}...`);
      const response = await api.put(`/api/companions/${id}/interact?action=${action}`);
      setCompanion(response.data);
      setInteractionMessage(`${action} successful!`);
    } catch (err) {
      console.error(`Failed to perform action: ${action}`, err);
      let errorMessage = `Failed to perform ${action}.`;
      if (isAxiosError(err) && err.response) {
        errorMessage = err.response.data || errorMessage;
      }
      setInteractionMessage(errorMessage);
    }
  };

  const handleUseItem = async (inventoryItemId: number) => {
    if (!id) return;
    try {
        setInteractionMessage(`Using item...`);
        const response = await api.post(`/api/inventory/use/${inventoryItemId}`, {
            companionId: id 
        });
        
        setCompanion(response.data);

        await fetchInventory();

        setInteractionMessage(`Item used successfully!`);

    } catch(err) {
        console.error("Failed to use item", err);
        let errorMessage = "Failed to use item.";
        if (isAxiosError(err) && err.response) {
            errorMessage = err.response.data || errorMessage;
        }
        setInteractionMessage(errorMessage);
    }
  };

  if (loading) return <div className="sanctuary-message">Loading Sanctuary...</div>;
  if (error) return <div className="sanctuary-message error">{error}</div>;
  if (!companion) return <div className="sanctuary-message">Companion not found.</div>;

  return (
    <div className="sanctuary-page-layout">
        <div className="sanctuary-container">
            <Link to="/dashboard" className="back-to-dashboard">
                &larr; Back to Dashboard
            </Link>
            <div className="sanctuary-header">
                <h1>{companion.name}'s Sanctuary</h1>
                <p>Species: {companion.speciesName} ({companion.universe.replace('_', ' ')})</p>
            </div>
            <div className="stats-container">
                <h2>Stats</h2>
                <ul>
                    <li>❤️ Health: {companion.health} / 100</li>
                    <li>🍗 Hunger: {companion.hunger} / 100</li>
                    <li>😴 Energy: {companion.energy} / 100</li>
                    <li>😊 Happiness: {companion.happiness} / 100</li>
                    <li>🧼 Hygiene: {companion.hygiene} / 100</li>
                    <li>🎓 Skill: {companion.skill} / 100</li>
                    <li style={{ color: companion.sick ? 'red' : 'inherit' }}>
                        🤒 Sick: {companion.sick ? 'Yes' : 'No'}
                    </li>
                </ul>
            </div>
            <div className="actions-container">
                <h2>Actions</h2>
                <button onClick={() => handleInteract('feed')}>Feed</button>
                <button onClick={() => handleInteract('play')}>Play</button>
                <button onClick={() => handleInteract('sleep')}>Sleep</button>
                <button onClick={() => handleInteract('clean')}>Clean</button>
                <button onClick={() => handleInteract('train')}>Train</button>
            </div>
            {interactionMessage && <p className="interaction-feedback">{interactionMessage}</p>}
        </div>
        <div className="inventory-container">
            <h2>Inventory</h2>
            {inventory.length === 0 ? (
                <p>Your inventory is empty.</p>
            ) : (
                inventory.map((invItem) => (
                    <div key={invItem.inventoryItemId} className="inventory-item">
                        <div className="item-info">
                            <strong>{invItem.item.name} (x{invItem.quantity})</strong>
                            <p>{invItem.item.description}</p>
                        </div>
                        <button 
                            onClick={() => handleUseItem(invItem.inventoryItemId)}
                            disabled={invItem.item.itemType !== 'CONSUMABLE'}
                        >
                            Use
                        </button>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default CompanionSanctuaryPage;