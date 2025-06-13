import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './CompanionSanctuaryPage.css';
import { isAxiosError } from 'axios';

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
  equippedGear: InventoryItem | null;
  speciesAssets: { [key: string]: string };
}

const CompanionSanctuaryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interactionMessage, setInteractionMessage] = useState('');
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;
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
    if (!id || !companion || !companion.speciesAssets) return;

    let videoKey = `video_action_${action}`;
    if (companion.equippedGear?.item.itemType === 'WEAPON') {
        const weaponVideoKey = `video_action_${action}_${companion.equippedGear.item.name.replace(/ /g, '_')}`;
        if (companion.speciesAssets[weaponVideoKey]) {
            videoKey = weaponVideoKey;
        }
    }
    
    const videoFilename = companion.speciesAssets[videoKey];
    if (videoFilename) {
        setCurrentVideo(`/videos/${videoFilename}`);
    }

    try {
      setInteractionMessage(`Performing action: ${action}...`);
      const response = await api.put(`/api/companions/${id}/interact?action=${action}`);
      setCompanion(response.data);
      setInteractionMessage(`${action} successful!`);
    } catch (err) {
      let errorMessage = `Failed to perform ${action}.`;
      if (isAxiosError(err) && err.response) {
        errorMessage = err.response.data || errorMessage;
      }
      setInteractionMessage(errorMessage);
      console.error(`Failed to perform action: ${action}`, err);
    }
  };

  const handleUseItem = async (inventoryItemId: number) => {
    if (!id) return;
    try {
      setInteractionMessage(`Using item...`);
      const response = await api.post(`/api/inventory/use/${inventoryItemId}`, { companionId: id });
      setCompanion(response.data);
      const inventoryResponse = await api.get('/api/inventory');
      setInventory(inventoryResponse.data);
      setInteractionMessage(`Item used successfully!`);
    } catch(err) {
      let errorMessage = "Failed to use item.";
      if (isAxiosError(err) && err.response) {
          errorMessage = err.response.data || errorMessage;
      }
      setInteractionMessage(errorMessage);
      console.error("Failed to use item", err);
    }
  };

  const handleEquipItem = async (inventoryItemId: number) => {
    if (!id) return;
    try {
      setInteractionMessage('Changing equipment...');
      const response = await api.post(`/api/companions/${id}/equip/${inventoryItemId}`);
      setCompanion(response.data);
      const inventoryResponse = await api.get('/api/inventory');
      setInventory(inventoryResponse.data);
      setInteractionMessage('Equipment status changed!');
    } catch (err) {
      let errorMessage = "Failed to change equipment.";
      if (isAxiosError(err) && err.response) {
          errorMessage = err.response.data || errorMessage;
      }
      setInteractionMessage(errorMessage);
      console.error("Failed to equip item", err);
    }
  };
  
  if (loading) return <div className="sanctuary-message">Loading Sanctuary...</div>;
  if (error) return <div className="sanctuary-message error">{error}</div>;
  if (!companion) return <div className="sanctuary-message">Companion not found.</div>;

  let idleImageUrl = '/images/placeholder.png';
  if (companion.speciesAssets) {
    const defaultImage = companion.speciesAssets['image_default'];
    let equippedImage = null;
    if (companion.equippedGear) {
        const key = `image_weapon_${companion.equippedGear.item.name.replace(/ /g, '_')}`;
        equippedImage = companion.speciesAssets[key];
    }
    const filename = equippedImage || defaultImage;
    if(filename) {
      idleImageUrl = `/images/${filename}`;
    }
  }

  return (
    <div className="sanctuary-page-layout">
      <div className="main-visual-container">
        {currentVideo ? (
          <video
            key={currentVideo}
            width="100%"
            autoPlay
            onEnded={() => setCurrentVideo(null)}
          >
            <source src={currentVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={idleImageUrl} alt={companion.name} className="companion-main-image" />
        )}
        <div className="actions-container">
          <button onClick={() => handleInteract('feed')} title="Feed">
            <img src="/icons/feed.png" alt="Feed" />
          </button>
          <button onClick={() => handleInteract('play')} title="Play">
            <img src="/icons/play.png" alt="Play" />
          </button>
          <button onClick={() => handleInteract('sleep')} title="Sleep">
            <img src="/icons/sleep.png" alt="Sleep" />
          </button>
          <button onClick={() => handleInteract('clean')} title="Clean">
            <img src="/icons/clean.png" alt="Clean" />
          </button>
          <button onClick={() => handleInteract('train')} title="Train">
            <img src="/icons/train.png" alt="Train" />
          </button>
        </div>
      </div>
      
      <div className="ui-container">
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
                <div className="equipped-item">
                    <strong>Equipped:</strong> {companion.equippedGear ? companion.equippedGear.item.name : 'None'}
                </div>
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
            {interactionMessage && <p className="interaction-feedback">{interactionMessage}</p>}
        </div>

        <div className="inventory-container">
            <h2>Inventory</h2>
            {inventory.length === 0 ? <p>Your inventory is empty.</p> : inventory.map((invItem) => (
                <div key={invItem.inventoryItemId} className="inventory-item">
                    <div className="item-info">
                        <strong>{invItem.item.name} (x{invItem.quantity})</strong>
                        <p>{invItem.item.description}</p>
                    </div>
                    {invItem.item.itemType === 'CONSUMABLE' ? (
                        <button onClick={() => handleUseItem(invItem.inventoryItemId)}>
                            Use
                        </button>
                    ) : (
                        <button className="equip-button" onClick={() => handleEquipItem(invItem.inventoryItemId)}>
                            {companion.equippedGear?.inventoryItemId === invItem.inventoryItemId ? 'Unequip' : 'Equip'}
                        </button>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CompanionSanctuaryPage;