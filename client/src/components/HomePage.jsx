import React from 'react';
import { useNavigate } from 'react-router';
import '../styles/HomePage.css';

function HomePage({ user, onLogout }) { // props da App.jsx
  const navigate = useNavigate();

  const handleStartNewGame = () => {
    navigate('/play-game');
  };

  const handleViewHistory = () => {
    navigate('/profile');
  };

  return (
    <div className="homepage-container modern-look">
      <header className="modern-header homepage-header">
        <h1>
          Benvenuto, {user.username}!
        </h1>
        <p>Pronto per una nuova sfida al Gioco della Sfortuna?</p>
      </header>

      <div className="homepage-actions">
        <button
          onClick={handleStartNewGame}
          className="button-link modern-button primary-action"
          aria-label="Inizia una nuova partita completa"
        >
          Inizia Nuova Partita
        </button>
        <button
          onClick={handleViewHistory}
          className="button-link modern-button"
          aria-label="Visualizza la cronologia delle tue partite"
        >
          Vedi Cronologia Partite
        </button>
        <button
           onClick={onLogout}
           className="button-link modern-button danger"
           style={{marginTop: '10px'}}
           aria-label="Effettua il logout"
         >
           Logout
         </button>
      </div>
    </div>
  );
}

export default HomePage;