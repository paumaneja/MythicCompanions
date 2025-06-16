// frontend/src/pages/DodgeGamePage.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import './DodgeGamePage.css';
import api from '../services/api';

// --- Constants ---
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const PLAYER_SPEED = 8;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 40;
const INITIAL_OBSTACLE_SPEED = 3;
const INITIAL_SPAWN_INTERVAL = 1200;
const SPEED_INCREASE_RATE = 0.2;
const SPAWN_DECREASE_RATE = 15;
const STARTING_LIVES = 3;

// --- Types ---
type GameObject = { id: number; x: number; y: number; };
type GameState = 'idle' | 'playing' | 'gameOver';

// Interface for the reward data from the backend
interface GameResult {
  message: string;
  itemsAwarded: {
    item: { name: string };
    quantity: number;
  }[];
}

const DodgeGamePage = () => {
  const { id: companionId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- Display State (for React to render) ---
  const [gameState, setGameState] = useState<GameState>('idle');
  const [obstaclesToRender, setObstaclesToRender] = useState<GameObject[]>([]);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [time, setTime] = useState(0);
  const [playerPositionX, setPlayerPositionX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [error, setError] = useState('');

  // --- Game Logic Refs (live inside the loop, don't cause re-renders) ---
  const playerX = useRef(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const obstaclesRef = useRef<GameObject[]>([]);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameTime = useRef(0);
  const currentLives = useRef(STARTING_LIVES);
  const obstacleSpeed = useRef(INITIAL_OBSTACLE_SPEED);
  const spawnInterval = useRef(INITIAL_SPAWN_INTERVAL);
  const lastSpawnTime = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  // --- Game Loop (no dependencies, created only once) ---
  const gameLoop = useCallback((timestamp: number) => {
    // 1. Update Time and Difficulty
    const newTime = Math.floor((timestamp - gameTime.current) / 1000);
    setTime(newTime);
    obstacleSpeed.current = INITIAL_OBSTACLE_SPEED + newTime * SPEED_INCREASE_RATE;
    spawnInterval.current = Math.max(300, INITIAL_SPAWN_INTERVAL - newTime * SPAWN_DECREASE_RATE);

    // 2. Move Player
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) playerX.current -= PLAYER_SPEED;
    if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) playerX.current += PLAYER_SPEED;
    playerX.current = Math.max(0, Math.min(playerX.current, GAME_WIDTH - PLAYER_WIDTH));
    setPlayerPositionX(playerX.current);
    
    // 3. Spawn New Obstacles
    if (timestamp - lastSpawnTime.current > spawnInterval.current) {
      lastSpawnTime.current = timestamp;
      obstaclesRef.current.push({ id: timestamp, x: Math.random() * (GAME_WIDTH - OBSTACLE_WIDTH), y: -OBSTACLE_HEIGHT });
    }

    // 4. Update Obstacles and Check Collisions
    let lifeLost = false;
    const playerRect = { x: playerX.current, y: GAME_HEIGHT - PLAYER_HEIGHT, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    
    obstaclesRef.current = obstaclesRef.current.filter(obstacle => {
      obstacle.y += obstacleSpeed.current;
      const obstacleRect = { x: obstacle.x, y: obstacle.y, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT };
      const hasCollision = 
        playerRect.x < obstacleRect.x + obstacleRect.width &&
        playerRect.x + playerRect.width > obstacleRect.x &&
        playerRect.y < obstacleRect.y + obstacleRect.height &&
        playerRect.y + playerRect.height > obstacleRect.y;

      if (hasCollision) {
        lifeLost = true;
        return false;
      }
      return obstacle.y < GAME_HEIGHT;
    });

    if (lifeLost) {
      currentLives.current -= 1;
      setLives(currentLives.current);
      if (currentLives.current <= 0) {
        setGameState('gameOver');
        return; // Stop the loop immediately
      }
    }

    // 5. Sync refs with state for rendering
    setObstaclesToRender([...obstaclesRef.current]);
    
    // 6. Continue the loop
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, []);

  const startTimeRef = useRef(0);
  // --- Game State Control ---
  useEffect(() => {
    if (gameState === 'playing') {
      const now = performance.now();
      startTimeRef.current = now;
      gameTime.current = now;
      lastSpawnTime.current = now;
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [gameState, gameLoop]);

  useEffect(() => {
    if (currentLives.current <= 0) {
      setGameState('gameOver');
    }
  }, [lives]);

  // Submit score on game over
   useEffect(() => {
    if (gameState === 'gameOver') {
      const finalScore = time;
      setGameResult(null); // Reset previous results
      setError('');

      api.post<GameResult>('/api/game/complete-minigame', {
        companionId: Number(companionId), score: finalScore
      })
      .then(response => {
        setGameResult(response.data); // Save successful response
      })
      .catch(err => {
        if (isAxiosError(err) && err.response) {
            setError(err.response.data.message || 'Failed to submit score.');
        } else {
            setError('An unexpected error occurred while finishing the game.');
        }
        console.error("Failed to submit score:", err);
      });
    }
  }, [gameState, time, companionId]);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    setGameState('idle');
    setTimeout(() => {
      currentLives.current = STARTING_LIVES;
      setLives(STARTING_LIVES);
      setTime(0);
      obstaclesRef.current = [];
      setObstaclesToRender([]);
      playerX.current = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
      setPlayerPositionX(playerX.current);
      obstacleSpeed.current = INITIAL_OBSTACLE_SPEED;
      spawnInterval.current = INITIAL_SPAWN_INTERVAL;
      keysPressed.current = {};
      setGameState('playing');
    }, 50);
  };

  return (
    <div className="dodge-game-page">
      <div className="game-area" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        {(gameState === 'playing' || gameState === 'gameOver') && (
          <div className="game-ui">
            <span>Vides: {lives < 0 ? 0 : lives}</span>
            <span>Temps: {time}s</span>
          </div>
        )}
        {gameState === 'idle' && (
          <div className="game-overlay">
            <h2>Dodge Challenge</h2>
            <p>Use the Arrow Keys or A/D to move and dodge the falling objects!</p>
            <button className="game-button-dodge" onClick={startGame}>Start Game</button>
          </div>
        )}
        {gameState === 'playing' && (
          <>
            <div className="player" style={{ left: playerPositionX, width: PLAYER_WIDTH, height: PLAYER_HEIGHT }} />
            {obstaclesToRender.map(o => <div key={o.id} className="obstacle" style={{ left: o.x, top: o.y, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT }} />)}
          </>
        )}
{gameState === 'gameOver' && (
          <div className="game-overlay">
            <h2>Game Over</h2>
            <p>You survived for {time} seconds!</p>
            
            <div className="results-box">
              {error && <p className="error-message">{error}</p>}
              {!error && !gameResult && <p>Calculating rewards...</p>}
              {gameResult && (
                  <>
                      <p className="result-message">"{gameResult.message}"</p>
                      {gameResult.itemsAwarded?.length > 0 && (
                          <div className="rewards">
                              <h3>Rewards:</h3>
                              <ul>
                                  {gameResult.itemsAwarded.map((reward, index) => (
                                      <li key={index}>{reward.item.name} (x{reward.quantity})</li>
                                  ))}
                              </ul>
                          </div>
                      )}
                  </>
              )}
            </div>

            <button className="game-button-dodge" onClick={startGame}>Play Again</button>
            <button className="game-button-dodge secondary" onClick={() => navigate(`/companions/${companionId}`)}>Back to Sanctuary</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DodgeGamePage;