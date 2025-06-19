// frontend/src/pages/CompanionSanctuaryPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CompanionSanctuaryPage.css';
import { isAxiosError } from 'axios';
import MinigamesModal from '../components/MinigamesModal';

// Interfaces
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interactionMessage, setInteractionMessage] = useState('');
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isMinigamesModalOpen, setIsMinigamesModalOpen] = useState(false);

  const handleOpenMinigamesModal = () => setIsMinigamesModalOpen(true);
  const handleCloseMinigamesModal = () => setIsMinigamesModalOpen(false);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

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

    switch (action.toLowerCase()) {
      case 'feed':
        if (companion.hunger >= 100) {
          setInteractionMessage('Companion is already full.');
          return;
        }
        break;
      case 'play':
        if (companion.energy < 20) {
          setInteractionMessage('Your companion is too tired to play.');
          return;
        }
        break;
      case 'sleep':
        if (companion.energy >= 50) {
          setInteractionMessage('Companion is not tired enough to sleep.');
          return;
        }
        break;
      case 'clean':
        if (companion.hygiene >= 100) {
          setInteractionMessage('Your companion is already sparkling clean!');
          return;
        }
        break;
      case 'train':
        if (!companion.equippedGear) {
          setInteractionMessage('Cannot train without a weapon equipped.');
          return;
        }
        if (companion.energy < 15) {
          setInteractionMessage('Your companion is too tired to train.');
          return;
        }
        break;
      default:
        break;
    }

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
      if (isAxiosError(err) && err.response) { errorMessage = err.response.data || errorMessage; }
      setInteractionMessage(errorMessage);
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
      if (isAxiosError(err) && err.response) { errorMessage = err.response.data || errorMessage; }
      setInteractionMessage(errorMessage);
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
      if (isAxiosError(err) && err.response) { errorMessage = err.response.data || errorMessage; }
      setInteractionMessage(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const isConfirmed = window.confirm(
        `Are you sure you want to delete ${companion?.name}? This action cannot be undone.`
    );
    if (isConfirmed) {
        try {
            setInteractionMessage('Deleting companion...');
            await api.delete(`/api/companions/${id}`);
            navigate('/dashboard');
        } catch (err) {
            let errorMessage = "Failed to delete companion.";
            if (isAxiosError(err) && err.response) {
                errorMessage = err.response.data || errorMessage;
            }
            setInteractionMessage(errorMessage);
            console.error("Failed to delete companion", err);
        }
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
    <div className="sanctuary-page-wrapper">
        <div className="sanctuary-page-layout">
            <div className="ui-panel">
                <div className="stats-container">
                    <h2>Stats</h2>
                    <div className="scrollable-content">
                        <ul>
                            <li className="stat-item">
                                <div className="stat-info"><span>❤️ Health</span><span>{companion.health}/100</span></div>
                                <div className="stat-bar-background"><div className="stat-bar-fill health" style={{ width: `${companion.health}%` }}></div></div>
                            </li>
                            <li className="stat-item">
                                <div className="stat-info"><span>🍗 Hunger</span><span>{companion.hunger}/100</span></div>
                                <div className="stat-bar-background"><div className="stat-bar-fill hunger" style={{ width: `${companion.hunger}%` }}></div></div>
                            </li>
                            <li className="stat-item">
                                <div className="stat-info"><span>😴 Energy</span><span>{companion.energy}/100</span></div>
                                <div className="stat-bar-background"><div className="stat-bar-fill energy" style={{ width: `${companion.energy}%` }}></div></div>
                            </li>
                            <li className="stat-item">
                                <div className="stat-info"><span>😊 Happiness</span><span>{companion.happiness}/100</span></div>
                                <div className="stat-bar-background"><div className="stat-bar-fill happiness" style={{ width: `${companion.happiness}%` }}></div></div>
                            </li>
                            <li className="stat-item">
                                <div className="stat-info"><span>🧼 Hygiene</span><span>{companion.hygiene}/100</span></div>
                                <div className="stat-bar-background"><div className="stat-bar-fill hygiene" style={{ width: `${companion.hygiene}%` }}></div></div>
                            </li>
                            <li className="stat-item">
                                <div className="stat-info"><span>🎓 Skill</span><span>{companion.skill}/100</span></div>
                                <div className="stat-bar-background"><div className="stat-bar-fill skill" style={{ width: `${companion.skill}%` }}></div></div>
                            </li>
                            <li className="stat-item" style={{ color: companion.sick ? '#f87171' : 'inherit', backgroundColor: '#3a3a3a', padding: '10px', borderRadius: '5px' }}>
                                🤒 Sick: {companion.sick ? 'Yes' : 'No'}
                            </li>
                        </ul>
                        <div className="equipped-item">
                            <strong>Equipped:</strong> {companion.equippedGear ? companion.equippedGear.item.name : 'None'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="main-visual-container">
                <button onClick={handleBackToDashboard} className="visual-container-button top-corner-button back-to-dashboard" title="Back to Dashboard">
                    <img src="/icons/back.png" alt="Back" />
                </button>
                <button onClick={handleDelete} className="visual-container-button top-corner-button delete-companion-button" title="Delete Companion">
                  <img src="/icons/delete.png" alt="Delete" />
                </button>

                {currentVideo ? (
                <video key={currentVideo} width="100%" autoPlay onEnded={() => setCurrentVideo(null)}>
                    <source src={currentVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                ) : (
                <img src={idleImageUrl} alt={companion.name} className="companion-main-image" />
                )}
                <div className="actions-container-icons">
                    {/* UPDATED: Buttons now have shared classes */}
                    <button onClick={() => handleInteract('feed')} className="visual-container-button action-button" title="Feed"><img src="/icons/feed.png" alt="Feed" /></button>
                    <button onClick={() => handleInteract('play')} className="visual-container-button action-button" title="Play"><img src="/icons/play.png" alt="Play" /></button>
                    <button onClick={() => handleInteract('sleep')} className="visual-container-button action-button" title="Sleep"><img src="/icons/sleep.png" alt="Sleep" /></button>
                    <button onClick={() => handleInteract('clean')} className="visual-container-button action-button" title="Clean"><img src="/icons/clean.png" alt="Clean" /></button>
                    <button onClick={() => handleInteract('train')} className="visual-container-button action-button" title="Train"><img src="/icons/train.png" alt="Train" /></button>
                </div>
                <div className="sanctuary-header">
                    <h1>{companion.name}'s Sanctuary</h1>
                    <p>Species: {companion.speciesName} ({companion.universe.replace('_', ' ')})</p>
                </div>
                
                {interactionMessage && <p className="interaction-feedback">{interactionMessage}</p>}
            </div>

            <div className="ui-panel">
                <div className="inventory-container">
                    <h2>Inventory</h2>
                    <div className="scrollable-content">
                        {inventory.length === 0 ? <p>Your inventory is empty.</p> : inventory.map((invItem) => (
                            <div key={invItem.inventoryItemId} className="inventory-item">
                                <div className="item-info">
                                    <strong>{invItem.item.name} (x{invItem.quantity})</strong>
                                    <p>{invItem.item.description}</p>
                                </div>
                                {invItem.item.itemType === 'CONSUMABLE' ? (
                                    <button onClick={() => handleUseItem(invItem.inventoryItemId)}>Use</button>
                                ) : (
                                    <button className="equip-button" onClick={() => handleEquipItem(invItem.inventoryItemId)}>
                                        {companion.equippedGear?.inventoryItemId === invItem.inventoryItemId ? 'Unequip' : 'Equip'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="minigames-launcher">
                    <button onClick={handleOpenMinigamesModal}>
                        Mini-Games
                    </button>
                </div>
            </div>
        </div>
        <MinigamesModal 
            isOpen={isMinigamesModalOpen} 
            onClose={handleCloseMinigamesModal} 
        />
    </div>
  );
};

export default CompanionSanctuaryPage;