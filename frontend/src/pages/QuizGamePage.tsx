import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import './QuizGamePage.css';
import api from '../services/api';

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  universe: 'STARWARS' | 'LORD_OF_THE_RINGS';
}

interface GameResult {
  message: string;
  itemsAwarded: {
    item: { name: string };
    quantity: number;
  }[];
}

type GameState = 'idle' | 'loading' | 'playing' | 'finished';

const TIME_PER_QUESTION = 30;

const QuizGamePage = () => {
  const { id: companionId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [error, setError] = useState('');
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const advanceToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setTimeLeft(TIME_PER_QUESTION);
    } else {
      setGameState('finished');
    }
  }, [currentQuestionIndex, questions.length]);

  const handleAnswerClick = (answer: string) => {
    if (questions[currentQuestionIndex].correctAnswer === answer) {
      setScore(prevScore => prevScore + 1);
    }
    advanceToNextQuestion();
  };

  const handleStartGame = async () => {
    setGameState('loading');
    setError('');
    setGameResult(null);
    try {
      const response = await api.get<Question[]>(`/api/game/quiz/questions/${companionId}`);
      if (response.data && response.data.length > 0) {
        setQuestions(response.data);
        setCurrentQuestionIndex(0);
        setScore(0);
        setTimeLeft(TIME_PER_QUESTION);
        setGameState('playing');
      } else {
        setError('Could not load questions for this companion. Please try again later.');
        setGameState('idle');
      }
    } catch (err) {
      console.error("Error fetching quiz questions:", err);
      setError('Failed to fetch quiz questions from the server.');
      setGameState('idle');
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft === 0) {
      advanceToNextQuestion();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameState, timeLeft, advanceToNextQuestion]);

  useEffect(() => {
    const submitScore = async () => {
        if (gameState === 'finished' && companionId) {
            
            const finalScore = questions.length > 0 ? (score / questions.length) * 100 : 0;
            
            try {
                const response = await api.post<GameResult>('/api/game/complete-minigame', {
                    companionId: Number(companionId),
                    score: finalScore, // Send the scaled score
                });
                setGameResult(response.data);
            } catch (err) {
                if (isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Failed to submit score.');
                } else {
                    setError('An unexpected error occurred while finishing the game.');
                }
            }
        }
    }
    submitScore();
  }, [gameState, score, questions, companionId]);

  const renderGame = () => {
    switch (gameState) {
      case 'loading':
        return <div className="quiz-container"><h2>Loading Quiz...</h2></div>;

      case 'playing': {
        const currentQuestion = questions[currentQuestionIndex];
        return (
          <div className="quiz-container">
            <div className="quiz-header">
              <span>Question {currentQuestionIndex + 1} / {questions.length}</span>
              <span className="timer">Time: {timeLeft}s</span>
            </div>
            <div className="question-text">
              <p>{currentQuestion.questionText}</p>
            </div>
            <div className="answer-options">
              {currentQuestion.options.map((option, index) => (
                <button key={index} className="answer-button" onClick={() => handleAnswerClick(option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      }
      
      case 'finished':
        return (
          <div className="quiz-container">
            <h2>Quiz Finished!</h2>
            <p className="final-score">You scored {score} out of {questions.length}!</p>
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
            ) : !error && <p>Calculating rewards...</p>}
            <button className="quiz-button" onClick={() => navigate(`/companions/${companionId}`)}>Back to Sanctuary</button>
          </div>
        );

      case 'idle':
      default:
        return (
          <div className="game-intro-container">
            <h2>Lore Quiz</h2>
            {error && <p className="error-message">{error}</p>}
            <p>Test your knowledge! You have {TIME_PER_QUESTION} seconds per question.</p>
            <button className="game-button" onClick={handleStartGame}>Start Quiz</button>
            <button className="game-button secondary" onClick={() => navigate(`/companions/${companionId}`)}>Return to Sanctuary</button>
          </div>
        );
    }
  };

  return <div className="game-page-wrapper">{renderGame()}</div>;
};

export default QuizGamePage;