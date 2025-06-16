import { Link, useParams } from 'react-router-dom';
import './MinigamesModal.css';

interface MinigamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MinigamesModal = ({ isOpen, onClose }: MinigamesModalProps) => {
  const { id: companionId } = useParams<{ id: string }>();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select a Minigame</h2>
          <button onClick={onClose} className="modal-close-button">&times;</button>
        </div>
        <div className="modal-body">
          <p>Choose a game to play with your companion. Playing games can improve stats and earn you rewards!</p>
          <div className="minigame-selection">
            <Link to={`/companions/${companionId}/play/clicker-game`} className="minigame-button">
              Clicker Game
            </Link>
            <Link to={`/companions/${companionId}/play/memory-game`} className="minigame-button">
              Memory Game
            </Link>
            {/* UPDATED: The Quiz Game is now an active Link */}
            <Link to={`/companions/${companionId}/play/quiz-game`} className="minigame-button">
              Lore Quiz
            </Link>
            <button className="minigame-button-disabled" disabled>
              Object Dodge (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinigamesModal;