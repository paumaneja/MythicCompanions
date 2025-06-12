import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

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
  // useParams allows us to read URL parameters, like the :id
  const { id } = useParams<{ id: string }>();
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [id]); // This effect will re-run if the ID changes

  if (loading) return <div>Loading Sanctuary...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!companion) return <div>Companion not found.</div>;

  return (
    <div>
      <h1>{companion.name}'s Sanctuary</h1>
      <p>Species: {companion.speciesName} ({companion.universe.replace('_', ' ')})</p>
      <hr />
      <h2>Stats</h2>
      <ul>
        <li>❤️ Health: {companion.health} / 100</li>
        <li>🍗 Hunger: {companion.hunger} / 100</li>
        <li>😴 Energy: {companion.energy} / 100</li>
        <li>😊 Happiness: {companion.happiness} / 100</li>
        <li>🧼 Hygiene: {companion.hygiene} / 100</li>
        <li>🎓 Skill: {companion.skill} / 100</li>
        <li>Sick: {companion.sick ? 'Yes' : 'No'}</li>
      </ul>
    </div>
  );
};

export default CompanionSanctuaryPage;