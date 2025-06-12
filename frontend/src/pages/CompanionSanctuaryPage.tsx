import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './CompanionSanctuaryPage.css'; // We will create this file

// This interface should be identical to the one in the Dashboard
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

const CompanionSanctuaryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interactionMessage, setInteractionMessage] = useState(''); // For user feedback

  useEffect(() => {
    if (!id) return;

    const fetchCompanionData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/companions/${id}`);
        setCompanion(response.data);
      } catch (err) {
        console.error("Failed to fetch companion data:", err);
        setError('Could not load your companion. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanionData();
  }, [id]);

  // Function to handle interactions
  const handleInteract = async (action: string) => {
    if (!id) return;
    try {
      // Give instant feedback to the user
      setInteractionMessage(`Performing action: ${action}...`);
      
      const response = await api.put(`/api/companions/${id}/interact?action=${action}`);
      
      // Update the companion state with the new data from the backend
      setCompanion(response.data);
      setInteractionMessage(`${action} successful!`);
    } catch (err: any) {
      console.error(`Failed to perform action: ${action}`, err);
      // Display specific error from backend if available
      const errorMessage = err.response?.data || `Failed to perform ${action}.`;
      setInteractionMessage(errorMessage);
    }
  };

  if (loading) return <div className="sanctuary-message">Loading Sanctuary...</div>;
  if (error) return <div className="sanctuary-message error">{error}</div>;
  if (!companion) return <div className="sanctuary-message">Companion not found.</div>;

  return (
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
        <button onClick={() => handleInteract('heal')}>Heal</button>
      </div>
      
      {interactionMessage && <p className="interaction-feedback">{interactionMessage}</p>}
    </div>
  );
};

export default CompanionSanctuaryPage;