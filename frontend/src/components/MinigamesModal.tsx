// frontend/src/components/MinigamesModal.tsx

import { Link, useParams } from 'react-router-dom';
import './MinigamesModal.css';

// Define the properties the component will receive
interface MinigamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MinigamesModal = ({ isOpen, onClose }: MinigamesModalProps) => {
  const { id: companionId } = useParams<{ id: string }>();

  // If the modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  return (
    // The modal-overlay is the semi-transparent background
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation prevents the modal from closing if we click inside it */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select a Minigame</h2>
          {/* The close button */}
          <button onClick={onClose} className="modal-close-button">&times;</button>
        </div>
        <div className="modal-body">
          <p>Choose a game to play with your companion. Playing games can improve stats and earn you rewards!</p>
          <div className="minigame-selection">
            {/* Link to the future Clicker Game page */}
            <Link to={`/companions/${companionId}/play/clicker-game`} className="minigame-button">
              Clicker Game
            </Link>
              <Link to={`/companions/${companionId}/play/memory-game`} className="minigame-button">
              Memory Game
            </Link>
            {/* Add buttons for other minigames here in the future */}
            <button className="minigame-button-disabled" disabled>
              Puzzle Challenge (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinigamesModal;