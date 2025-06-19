import React from 'react';
import '../styles/RoundResultPopup.css';

// Questo componente è responsabile solo di mostrare il risultato di un round.
function RoundResultPopup({ show, result, onNextRound }) {
  if (!show) {
    return null;
  }

  const getMessage = () => {
    switch (result) {
        case 'win': return 'Posizione Corretta!';
        case 'loss_wrong_position': return 'Posizione Sbagliata!';
        case 'loss_timeout': return 'Tempo scaduto!';
        default: return '';
    }
  };

  return (
    <div className="round-result-popup-overlay">
        <div className="round-result-popup-content">
            <h2>Esito del Round</h2>
            <p className={`round-result-message ${result && result.includes('loss') ? 'loss' : 'win'}`}>
                {getMessage()}
            </p>
            <div>
                <button onClick={onNextRound} className="button-link modern-button">Prossimo Round</button>
            </div>
        </div>
    </div>
  );
}

export default RoundResultPopup;