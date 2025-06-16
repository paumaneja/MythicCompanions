import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './Dashboard.css';

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
  equippedGear: { item: { name: string } } | null; 
  speciesAssets: { [key: string]: string }; 
}

interface Species {
    id: number;
    name: string;
    universe: string;
}

const Dashboard = () => {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newCompanionName, setNewCompanionName] = useState('');
  const [selectedUniverse, setSelectedUniverse] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState('');

  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const companionsPromise = api.get(`/api/companions/owner/${auth.userId}`);
        const speciesPromise = api.get('/api/species');
        const [companionsResponse, speciesResponse] = await Promise.all([companionsPromise, speciesPromise]);
        setCompanions(companionsResponse.data);
        setSpeciesList(speciesResponse.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError('Could not load your dashboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.userId]);

  const universes = [...new Set(speciesList.map(s => s.universe))];
  const filteredSpecies = selectedUniverse ? speciesList.filter(s => s.universe === selectedUniverse) : [];
  
  const handleUniverseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUniverse(e.target.value);
    setSelectedSpeciesId('');
  };
  
  const handleCreateCompanion = async () => {
    if (!newCompanionName || !selectedSpeciesId) {
      alert('Please provide a name and select a species.');
      return;
    }

    try {
      const response = await api.post('/api/companions', {
        name: newCompanionName,
        speciesId: Number(selectedSpeciesId)
      });
      setCompanions(prevCompanions => [...prevCompanions, response.data]);
      setNewCompanionName('');
      setSelectedUniverse('');
      setSelectedSpeciesId('');
    } catch (err) {
      console.error('Failed to create companion:', err);
      alert('Could not create your companion.');
    }
  };

  const handleCompanionClick = (id: number) => {
    navigate(`/companions/${id}`);
  };

  if (loading) return <div className="dashboard-message">Loading dashboard...</div>;
  if (error) return <div className="dashboard-message error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-container"> {/* UPDATED: Changed class name for clarity */}
        {companions.map((companion) => {
            let imageUrl = '/images/placeholder.png';
            if (companion.speciesAssets) {
                const defaultImage = companion.speciesAssets['image_default'];
                let equippedImage = null;

                if (companion.equippedGear && companion.equippedGear.item) {
                    const weaponKey = `image_weapon_${companion.equippedGear.item.name.replace(/ /g, '_')}`;
                    equippedImage = companion.speciesAssets[weaponKey];
                }

                const filename = equippedImage || defaultImage;
                if (filename) {
                    imageUrl = `/images/${filename}`;
                }
            }

            return (
                <div key={companion.id} className="companion-card" onClick={() => handleCompanionClick(companion.id)}>
                    <img src={imageUrl} alt={companion.speciesName} className="companion-image" />
                    <div className="companion-info">
                        <h2 className="companion-name">{companion.name}</h2>
                        {/* NEW: Added species and universe info */}
                        <p className="companion-details">{companion.speciesName}</p>
                        
                        {/* NEW: Added stat bars */}
                        <div className="stat-bars-summary">
                            <div className="stat-item-summary">
                                <span className="stat-label">Hunger</span>
                                <div className="stat-bar-background-summary"><div className="stat-bar-fill-summary hunger" style={{ width: `${companion.hunger}%` }}></div></div>
                            </div>
                             <div className="stat-item-summary">
                                <span className="stat-label">Happiness</span>
                                <div className="stat-bar-background-summary"><div className="stat-bar-fill-summary happiness" style={{ width: `${companion.happiness}%` }}></div></div>
                            </div>
                             <div className="stat-item-summary">
                                <span className="stat-label">Hygiene</span>
                                <div className="stat-bar-background-summary"><div className="stat-bar-fill-summary hygiene" style={{ width: `${companion.hygiene}%` }}></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
        
        {/* The creation card remains the same for now */}
        <div className="companion-card creation-card">
            <h2 className="companion-name">Create a New Companion</h2>
            <input type="text" placeholder="Companion Name" value={newCompanionName} onChange={(e) => setNewCompanionName(e.target.value)} />
            <select value={selectedUniverse} onChange={handleUniverseChange}>
              <option value="" disabled>1. Select a Universe</option>
              {universes.map(universe => <option key={universe} value={universe}>{universe.replace('_', ' ')}</option>)}
            </select>
            <select value={selectedSpeciesId} onChange={(e) => setSelectedSpeciesId(e.target.value)} disabled={!selectedUniverse}>
              <option value="" disabled>2. Select a Species</option>
              {filteredSpecies.map(species => <option key={species.id} value={species.id}>{species.name}</option>)}
            </select>
            <button onClick={handleCreateCompanion} className="create-companion-button">Create</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;