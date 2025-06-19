import React from 'react';
import dayjs from 'dayjs';
import '../styles/GameHistoryCard.css'; 

// Riceve un singolo oggetto 'game' come prop e si occupa solo di visualizzarlo.
function GameHistoryCard({ game }) {
  return (
    <div className={`game-record ${game.status}`}>
      {/* Intestazione con data e risultato della partita */}
      <div className="game-summary-header">
        <h3>Partita del {dayjs.utc(game.end_date).local().format('DD/MM/YYYY, HH:mm:ss')}</h3>
        <span className={`game-status-badge ${game.status}`}>
          {game.status === 'win' ? 'Vittoria' : 'Sconfitta'}
        </span>
      </div>
      <p>
        Punteggio Finale: {game.final_card_count}{" "}
        {game.final_card_count === 1 ? "carta" : "carte"}
      </p>
      
      {/* Sezione per le Carte Iniziali */}
      {game.initialCards && game.initialCards.length > 0 && (
        <div className="initial-cards-container">
          <h4>Carte Iniziali:</h4>
          <ul>
            {game.initialCards.map(card => (
              <li key={`initial-${card.card_id}`}>
                "{card.card_name || 'Carta Sconosciuta'}"
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sezione per i Round Giocati */}
      <div className="rounds-container">
        <h4>Round Giocati:</h4>
        <ul>
          {game.rounds && game.rounds.length > 0 ? (
            game.rounds.map(round => (
              <li key={round.id || `round-${round.round_number}-${round.card_id}`} className={`round-detail ${round.result}`}>
                <span>Round {round.round_number}: "{round.card_name || 'Carta sconosciuta'}"</span>
                <span className="round-result-badge">{round.result === 'win' ? 'Indovinato' : 'Non Indovinato'}</span>
              </li>
            ))
          ) : (
            <li>Nessun dettaglio sui round disponibile.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default GameHistoryCard;