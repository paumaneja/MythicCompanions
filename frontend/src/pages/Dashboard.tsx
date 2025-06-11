import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './Dashboard.css';

// Type definitions for our data for type safety
interface Companion {
  id: number;
  name: string;
  speciesName: string;
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  hygiene: number;
  skill: number;
  sick: boolean;
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
  
  // State for the creation form
  const [newCompanionName, setNewCompanionName] = useState('');
  const [selectedUniverse, setSelectedUniverse] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState('');

  const auth = useAuth();
  const navigate = useNavigate();

  // This effect will run once when the component mounts to fetch all necessary data
  useEffect(() => {
    if (!auth.userId) {
      setLoading(false); // Stop loading if there is no user
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both user's companions and the list of available species in parallel
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

  // --- Logic for dependent dropdowns ---
  const universes = [...new Set(speciesList.map(s => s.universe))];
  const filteredSpecies = selectedUniverse ? speciesList.filter(s => s.universe === selectedUniverse) : [];
  
  const handleUniverseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUniverse(e.target.value);
    setSelectedSpeciesId(''); // Reset species selection when universe changes
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
      // Add the new companion to the list in the UI without needing a full refresh
      setCompanions(prevCompanions => [...prevCompanions, response.data]);
      // Reset form fields
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
      <div className="pet-container">
        {companions.map((companion) => (
          <div key={companion.id} className="pet-card" onClick={() => handleCompanionClick(companion.id)}>
            <h2 className="pet-name">{companion.name}</h2>
            <p style={{color:'black'}}>({companion.speciesName})</p>
          </div>
        ))}
        
        {/* Creation Card */}
        <div className="pet-card">
          <h2 className="pet-name">Create a New Companion</h2>
          <input
            type="text"
            placeholder="Companion Name"
            value={newCompanionName}
            onChange={(e) => setNewCompanionName(e.target.value)}
          />

          <select value={selectedUniverse} onChange={handleUniverseChange} className="pet-type-select">
            <option value="" disabled>1. Select a Universe</option>
            {universes.map(universe => (
              <option key={universe} value={universe}>{universe.replace('_', ' ')}</option>
            ))}
          </select>

          <select 
            value={selectedSpeciesId} 
            onChange={(e) => setSelectedSpeciesId(e.target.value)} 
            disabled={!selectedUniverse}
            className="pet-type-select"
          >
            <option value="" disabled>2. Select a Species</option>
            {filteredSpecies.map(species => (
              <option key={species.id} value={species.id}>{species.name}</option>
            ))}
          </select>

          <button onClick={handleCreateCompanion} className="create-pet-button">Create Companion</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;