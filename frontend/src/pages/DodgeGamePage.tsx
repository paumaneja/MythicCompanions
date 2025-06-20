// frontend/src/pages/DodgeGamePage.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import './DodgeGamePage.css';
import api from '../services/api';

// --- Constants de Diseño (nuestro lienzo original) ---
const DESIGN_WIDTH = 800;
const DESIGN_HEIGHT = 600;
const DESIGN_PLAYER_WIDTH = 50;
const DESIGN_PLAYER_HEIGHT = 50;
const DESIGN_PLAYER_SPEED = 8;
const DESIGN_OBSTACLE_WIDTH = 40;
const DESIGN_OBSTACLE_HEIGHT = 40;
const DESIGN_INITIAL_OBSTACLE_SPEED = 3;
const INITIAL_SPAWN_INTERVAL = 1200;
const SPEED_INCREASE_RATE = 0.2;
const SPAWN_DECREASE_RATE = 15;
const STARTING_LIVES = 3;

// --- Types ---
type GameObject = { id: number; x: number; y: number; };
type GameState = 'idle' | 'playing' | 'gameOver';

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

    // --- NUEVO: Referencia al contenedor del juego ---
    const gameAreaRef = useRef<HTMLDivElement>(null);

    // --- Display State (para React a renderizar) ---
    const [gameState, setGameState] = useState<GameState>('idle');
    const [obstaclesToRender, setObstaclesToRender] = useState<GameObject[]>([]);
    const [lives, setLives] = useState(STARTING_LIVES);
    const [time, setTime] = useState(0);

    // --- Dimensiones y escala dinámicas ---
    const [gameDimensions, setGameDimensions] = useState({ width: DESIGN_WIDTH, height: DESIGN_HEIGHT });
    const [scaleFactor, setScaleFactor] = useState(1);
    const [playerPositionX, setPlayerPositionX] = useState(DESIGN_WIDTH / 2 - DESIGN_PLAYER_WIDTH / 2);

    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [error, setError] = useState('');

    // --- Game Logic Refs (no causan re-renders) ---
    const playerX = useRef(gameDimensions.width / 2);
    const obstaclesRef = useRef<GameObject[]>([]);
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const gameTime = useRef(0);
    const currentLives = useRef(STARTING_LIVES);
    const obstacleSpeed = useRef(DESIGN_INITIAL_OBSTACLE_SPEED * scaleFactor);
    const spawnInterval = useRef(INITIAL_SPAWN_INTERVAL);
    const lastSpawnTime = useRef(0);
    const animationFrameId = useRef<number | null>(null);

    // NOU: Detectar si és un dispositiu tàctil al carregar la pàgina
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    // --- NUEVO: Hook para medir el contenedor y establecer dimensiones ---
    useEffect(() => {
        const measureContainer = () => {
            if (gameAreaRef.current) {
                const containerWidth = gameAreaRef.current.clientWidth;
                const newScaleFactor = containerWidth / DESIGN_WIDTH;
                const newHeight = DESIGN_HEIGHT * newScaleFactor;
                
                setGameDimensions({ width: containerWidth, height: newHeight });
                setScaleFactor(newScaleFactor);
                playerX.current = containerWidth / 2;
                setPlayerPositionX(containerWidth / 2);
            }
        };

        measureContainer();

        // NOU: Només escoltem el 'resize' si no estem jugant
        if (gameState !== 'playing') {
            window.addEventListener('resize', measureContainer);
        }

        // La funció de neteja s'executa quan el component es desmunta o `gameState` canvia
        return () => window.removeEventListener('resize', measureContainer);
    }, [gameState]);

    // --- Game Loop (actualizado con lógica responsiva) ---
    const gameLoop = useCallback((timestamp: number) => {
        // Tamaños y velocidades escalados
        const PLAYER_WIDTH = DESIGN_PLAYER_WIDTH * scaleFactor;
        const PLAYER_HEIGHT = DESIGN_PLAYER_HEIGHT * scaleFactor;
        const PLAYER_SPEED = DESIGN_PLAYER_SPEED * scaleFactor;
        const OBSTACLE_WIDTH = DESIGN_OBSTACLE_WIDTH * scaleFactor;
        const OBSTACLE_HEIGHT = DESIGN_OBSTACLE_HEIGHT * scaleFactor;

        const newTime = Math.floor((timestamp - gameTime.current) / 1000);
        setTime(newTime);
        obstacleSpeed.current = (DESIGN_INITIAL_OBSTACLE_SPEED + newTime * SPEED_INCREASE_RATE) * scaleFactor;
        spawnInterval.current = Math.max(300, INITIAL_SPAWN_INTERVAL - newTime * SPAWN_DECREASE_RATE);

        if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) playerX.current -= PLAYER_SPEED;
        if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) playerX.current += PLAYER_SPEED;
        playerX.current = Math.max(0, Math.min(playerX.current, gameDimensions.width - PLAYER_WIDTH));
        setPlayerPositionX(playerX.current);

        if (timestamp - lastSpawnTime.current > spawnInterval.current) {
            lastSpawnTime.current = timestamp;
            obstaclesRef.current.push({ id: timestamp, x: Math.random() * (gameDimensions.width - OBSTACLE_WIDTH), y: -OBSTACLE_HEIGHT });
        }

        let lifeLost = false;
        const playerRect = { x: playerX.current, y: gameDimensions.height - PLAYER_HEIGHT, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };

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
            return obstacle.y < gameDimensions.height;
        });

        if (lifeLost) {
            currentLives.current -= 1;
            setLives(currentLives.current);
            if (currentLives.current <= 0) {
                setGameState('gameOver');
                return;
            }
        }

        setObstaclesToRender([...obstaclesRef.current]);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [gameDimensions, scaleFactor]);

    const startGame = () => {
        setGameState('idle');
        setTimeout(() => {
            currentLives.current = STARTING_LIVES;
            setLives(STARTING_LIVES);
            setTime(0);
            obstaclesRef.current = [];
            setObstaclesToRender([]);
            playerX.current = gameDimensions.width / 2 - (DESIGN_PLAYER_WIDTH * scaleFactor) / 2;
            setPlayerPositionX(playerX.current);
            obstacleSpeed.current = DESIGN_INITIAL_OBSTACLE_SPEED * scaleFactor;
            spawnInterval.current = INITIAL_SPAWN_INTERVAL;
            keysPressed.current = {};
            setGameState('playing');
        }, 50);
    };

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

    // Funcions per gestionar els controls tàctils
    const handleControlPress = (direction: 'ArrowLeft' | 'ArrowRight') => {
        keysPressed.current[direction] = true;
    };

    const handleControlRelease = (direction: 'ArrowLeft' | 'ArrowRight') => {
        keysPressed.current[direction] = false;
    };

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

    const renderContent = () => {
        if (gameState === 'idle') {
            return (
                <div className="game-page-wrapper">
                <div className="game-intro-container">
                <h2> Dodge Challenge </h2>
                <p> Use the Arrow Keys or A / D to move and dodge the falling objects!</p>
                <button className="game-button"onClick={startGame}>Start Game</button>
                <button className="game-button secondary"onClick={() => navigate(`/companions/${companionId}`)}>Return to Sanctuary</button>
                </div>
                </div>
            );
        }

        const PLAYER_WIDTH = DESIGN_PLAYER_WIDTH * scaleFactor;
        const PLAYER_HEIGHT = DESIGN_PLAYER_HEIGHT * scaleFactor;
        const OBSTACLE_WIDTH = DESIGN_OBSTACLE_WIDTH * scaleFactor;
        const OBSTACLE_HEIGHT = DESIGN_OBSTACLE_HEIGHT * scaleFactor;

        return (
            <div className="dodge-game-container">
                <div className="dodge-game-page">
                    <div 
                        ref={gameAreaRef} 
                        className="game-area"
                        style={{ height: gameDimensions.height }}
                    >
                        <div className="game-ui">
                            <span>Lives: {lives < 0 ? 0 : lives}</span>
                            <span>Time: {time}s</span>
                        </div>

                        {gameState === 'playing' && (
                            <>
                                <img
                                    src="/games/ewok_minigame.png"
                                    className="player"
                                    alt="Player"
                                    style={{
                                        left: playerPositionX,
                                        width: PLAYER_WIDTH,
                                        height: PLAYER_HEIGHT
                                    }}
                                />
                                {obstaclesToRender.map(o =>
                                    <div 
                                        key={o.id} 
                                        className="obstacle" 
                                        style={{
                                            left: o.x,
                                            top: o.y,
                                            width: OBSTACLE_WIDTH,
                                            height: OBSTACLE_HEIGHT
                                        }} 
                                    />
                                )}
                            </>
                        )}
                         {gameState === 'gameOver' && (
                            <div className="game-overlay">
                                <h2>Game Over</h2>
                                <p>You survived {time} seconds!</p>
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
                                <button className="game-button-dodge" onClick={startGame}>Play again</button>
                                <button className="game-button-dodge secondary" onClick={() => navigate(`/companions/${companionId}`)}>Back to Sanctuary</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Conditional rendering of mobile controls */}
                {isTouchDevice && gameState === 'playing' && (
                    <div className="mobile-controls-container">
                        <div 
                            className="control-button left"
                            onMouseDown={() => handleControlPress('ArrowLeft')}
                            onMouseUp={() => handleControlRelease('ArrowLeft')}
                            onTouchStart={() => handleControlPress('ArrowLeft')}
                            onTouchEnd={() => handleControlRelease('ArrowLeft')}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <span>&#9664;</span> {/* Fletxa esquerra */}
                        </div>
                        <div 
                            className="control-button right"
                            onMouseDown={() => handleControlPress('ArrowRight')}
                            onMouseUp={() => handleControlRelease('ArrowRight')}
                            onTouchStart={() => handleControlPress('ArrowRight')}
                            onTouchEnd={() => handleControlRelease('ArrowRight')}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <span>&#9654;</span> {/* Fletxa dreta */}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return renderContent();
};

export default DodgeGamePage;