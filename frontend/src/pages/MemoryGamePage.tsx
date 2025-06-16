import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import './MemoryGamePage.css';
import api from '../services/api';

interface Card {
  id: number;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
  imagePath: string;
}

interface GameResult {
  message: string;
  itemsAwarded: {
    item: { name: string };
    quantity: number;
  }[];
}

const initialItems = [
  "Lembas Bread", "Small Health Potion", "Antidote", "Sturdy Frying Pan",
  "Wooden Sword", "Practice Axe", "Luminescent Crystal", "Miniature Sling"
];

const getItemImagePath = (itemName: string) => `/icons/items/${itemName.replace(/ /g, '_')}.png`;


const MemoryGamePage = () => {
  const { id: companionId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [isChecking, setIsChecking] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [error, setError] = useState('');



  const handleFinishGame = useCallback(async () => {
    const score = Math.max(100 - (moves - initialItems.length) * 5, 10);
    
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
        if (isAxiosError(err)) {
            setError(err.response?.data?.message || 'Failed to submit score.');
        } else {
            setError('An unexpected error occurred while finishing the game.');
        }
    }
  }, [moves, companionId]);

  const setupGame = useCallback(() => {
    const pairedItems = [...initialItems, ...initialItems];
    for (let i = pairedItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairedItems[i], pairedItems[j]] = [pairedItems[j], pairedItems[i]];
    }

    const initialCards: Card[] = pairedItems.map((name, index) => ({
      id: index,
      name: name,
      isFlipped: false,
      isMatched: false,
      imagePath: getItemImagePath(name),
    }));

    setCards(initialCards);
    setMoves(0);
    setFlippedIndexes([]);
    setIsChecking(false);
    setGameResult(null);
    setError('');
    setGameState('playing');
  }, []);

  const handleCardClick = (index: number) => {
    if (isChecking || cards[index].isFlipped || cards[index].isMatched || flippedIndexes.length >= 2) {
      return;
    }
    setCards(prev => prev.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
    if (flippedIndexes.length === 0) {
      setMoves(prev => prev + 1);
    }
    setFlippedIndexes(prev => [...prev, index]);
  };


  useEffect(() => {
    if (flippedIndexes.length !== 2) return;
    
    setIsChecking(true);
    const [firstIndex, secondIndex] = flippedIndexes;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    if (firstCard.name === secondCard.name) {
      setCards(prev => prev.map(card => 
        card.name === firstCard.name ? { ...card, isMatched: true } : card
      ));
      setFlippedIndexes([]);
      setIsChecking(false);
    } else {
      setTimeout(() => {
        setCards(prev => prev.map((card, index) => 
          index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card
        ));
        setFlippedIndexes([]);
        setIsChecking(false);
      }, 1000);
    }
  }, [flippedIndexes, cards]);
  
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
        setTimeout(() => {
            handleFinishGame();
        }, 500);
    }
  }, [cards, handleFinishGame]);


  const renderBoard = () => {
    if (gameState === 'idle') {
      return (
        <div className="game-intro">
          <h2>Memory Challenge</h2>
          <p>Find all the matching pairs with the fewest moves!</p>
          <button className="game-button-mem" onClick={setupGame}>Start Game</button>
        </div>
      );
    }
      
    if (gameState === 'finished') {
      return (
        <div className="game-intro">
            <h2>Game Over!</h2>
            {error && <p className="error-message">{error}</p>}
            {gameResult ? (
              <div className="results-box">
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
              </div>
            ) : (
              <p>Calculating rewards...</p>
            )}
            <button className="game-button-mem" onClick={() => navigate(`/companions/${companionId}`)}>Back to Sanctuary</button>
        </div>
      )
    }

    return (
      <div className="memory-game-board">
        <div className="game-info">
            <span>Moves: {moves}</span>
            <button className="game-button-mem secondary" onClick={() => navigate(`/companions/${companionId}`)}>Quit Game</button>
        </div>
        <div className="cards-grid">
          {cards.map((card, index) => (
            <div 
              key={card.id}
              className={`card-container ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="card-inner">
                <div className="card-face card-back"></div>
                <div className="card-face card-front">
                    <img src={card.imagePath} alt={card.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="memory-game-page">
      {renderBoard()}
    </div>
  );
};

export default MemoryGamePage;