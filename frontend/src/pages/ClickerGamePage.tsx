import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ClickerGamePage.css';
import { isAxiosError } from 'axios';

interface GameResult {
  message: string;
  itemsAwarded: {
    item: { name: string };
    quantity: number;
  }[];
}
type GameState = 'idle' | 'playing' | 'finished';

const GAME_DURATION = 15;

const ClickerGamePage = () => {
  const { id: companionId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [error, setError] = useState('');

  const handleGameFinish = useCallback(async () => {
    setGameState('finished');
    if (!companionId) {
      setError('Companion ID is missing.');
      return;
    }

    try {
      const response = await api.post('/api/game/complete-minigame', {
        companionId: Number(companionId),
        score: score,
      });
      setGameResult(response.data);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to submit score.');
      } else {
        setError('An unexpected error occurred while finishing the game.');
      }
      console.error(err);
    }
  }, [companionId, score]);

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft === 0) {
      return;
    }
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [gameState, timeLeft]);
  
  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      handleGameFinish();
    }
  }, [timeLeft, gameState, handleGameFinish]);

  const handleStartGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setError('');
    setGameResult(null);
    setGameState('playing');
  };

  const handleTargetClick = () => {
    setScore((prevScore) => prevScore + 1);
  };
  
  const renderGameState = () => {
    switch (gameState) {
      case 'playing':
        return (
          <div className="game-playing-container">
            <div className="game-stats">
              <span>Score: {score}</span>
              <span>Time Left: {timeLeft}s</span>
            </div>
            <div className="game-area">
              <button className="click-target" onClick={handleTargetClick}>
                Click Me!
              </button>
            </div>
          </div>
        );
      
      case 'finished':
        return (
          <div className="game-finished-container">
            <h2>Game Over!</h2>
            {error && <p className="error-message">{error}</p>}
            {gameResult ? (
              <div className="results-box">
                <p className="result-message">"{gameResult.message}"</p>
                {gameResult.itemsAwarded && gameResult.itemsAwarded.length > 0 && (
                  <div className="rewards">
                    <h3>Rewards:</h3>
                    <ul>
                      {gameResult.itemsAwarded.map((reward, index) => (
                        <li key={index}>
                          {reward.item.name} (x{reward.quantity})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p>Submitting score...</p>
            )}
            <button className="game-button" onClick={() => navigate(`/companions/${companionId}`)}>
              Back to Sanctuary
            </button>
          </div>
        );

      case 'idle':
      default:
        return (
          <div className="game-idle-container">
            <h2>Clicker Challenge</h2>
            <p>Click the target as many times as you can in {GAME_DURATION} seconds!</p>
            <button className="game-button" onClick={handleStartGame}>
              Start Game
            </button>
             <button className="game-button secondary" onClick={() => navigate(`/companions/${companionId}`)}>
              Return to Sanctuary
            </button>
          </div>
        );
    }
  };

  return (
    <div className="clicker-game-page">
      {renderGameState()}
    </div>
  );
};

export default ClickerGamePage;