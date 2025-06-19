import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import API from '../API.mjs';
import GameBoard from './GameBoard'; 
import GameSummary from './GameSummary';
import RoundResultPopup from './RoundResultPopup';
import ConfirmationPopup from './ConfirmationPopup';
import '../styles/FullGamePage.css'; 

function FullGamePage({ user }) {
  const [gameState, setGameState] = useState('ready'); 
  const [roundResult, setRoundResult] = useState(null); 
  const [gameResult, setGameResult] = useState(null); 
  const [handCards, setHandCards] = useState([]); 
  const [cardToGuess, setCardToGuess] = useState(null); 
  const [wrongGuesses, setWrongGuesses] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

// Funzione per iniziare una nuova partita
// Chiede al server di preparare una nuova mano e la prima carta da indovinare
const startNewGame = useCallback(async () => {
  setGameState('loading');
  setError(null);
  setGameResult(null);

  try {
    const manoIniziale = await API.startGame(); 
    if (!Array.isArray(manoIniziale) || manoIniziale.length < 3) {
      throw new Error('Dati della mano iniziale non validi.');
    }
    setHandCards(manoIniziale);

    const primaCartaDaIndovinare = await API.getNextCard();
    setCardToGuess(primaCartaDaIndovinare);
    
    setWrongGuesses(0);
    setRoundResult(null);
    setTimeLeft(30);
    setGameState('playing');
  } catch (err) {
    setError(err.toString());
    if (err.toString().toLowerCase().includes('not authorized') || err.toString().includes('401')) {
      navigate('/login');
    } else {
      setGameState('error');
    }
  }
}, [navigate]);

// Funzione per annullare l'inizio di una nuova partita
const handleCancelGame = useCallback(() => {
  navigate('/home');
}, [navigate]);

// Funzione per gestire il tentativo di indovinare la carta
// Viene chiamata quando l'utente trascina una carta su uno slot
const handleGuess = useCallback(async (droppedSlotIndex) => {
  if (gameState !== 'playing' || !cardToGuess) return;
  setGameState('result-pending');

  try {
    const guessData = {
      cardToGuessId: cardToGuess.id,
      handCardIds: handCards.map(c => c.id),
      droppedSlotIndex: droppedSlotIndex
    };

    const serverResponse = await API.checkGuess(guessData);

    if (serverResponse.result === 'win') {
      setRoundResult('win');
      const newCardWithIndex = { ...cardToGuess, misfortune_index: serverResponse.correctIndex };
      setHandCards(currentHand => [...currentHand, newCardWithIndex]);
    } else {
      setRoundResult(serverResponse.result); 
      setWrongGuesses(currentErrors => currentErrors + 1);
    }

    // Il server ci dice se il gioco è finito
    if (serverResponse.gameStatus === 'win' || serverResponse.gameStatus === 'loss') {
        setGameResult(serverResponse.gameStatus);
        setGameState('game-over');
    } else {
        setGameState('round-result');
    }

  } catch (err) {
    setError(err.toString());
    if (err.toString().toLowerCase().includes('not authorized') || err.toString().includes('401')) {
      navigate('/login');
    } else {
      setGameState('error');
    }
  }
}, [gameState, cardToGuess, handCards, navigate]);

// Funzione per gestire il passaggio alla prossima carta
const handleNextRound = async () => {
  try {
    // Chiede al server la prossima carta
    const prossimaCarta = await API.getNextCard(); 
    setCardToGuess(prossimaCarta);
    setRoundResult(null);
    setTimeLeft(30);
    setGameState('playing');

  } catch (err) {
    // Se l'errore è 404, significa che il mazzo è finito
    if (err.toString().includes('404')) {
        // console.log("Mazzo sul server esaurito.");
        setGameState('game-over'); 
    } else {
        setError(err.toString());
        setGameState('error');
    }
  }
};

// Per gestire il timer della partita
// Se il tempo scade, chiama handleGuess con null per indicare timeout
  useEffect(() => {
    let timerId;
    if (gameState === 'playing' && timeLeft > 0) {
      timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleGuess(null);
    }
    return () => clearTimeout(timerId);
  }, [gameState, timeLeft, handleGuess]);

// Per gestire il salvataggio automatico della partita
useEffect(() => {
  // Quando il gioco finisce, dì al server di salvare.
  if (gameState === 'game-over' && gameResult) {
    API.saveGame().catch(err => {
          // console.error("Impossibile salvare la partita:", err.toString());
      });
  }
}, [gameState, gameResult]);

return (
    <div className="full-game-container">
      {/* --- POPUP DI CONFERMA INIZIALE --- */}
      {/* Appare solo quando il gioco è pronto per iniziare */}
      <ConfirmationPopup 
          show={gameState === 'ready'}
          title="Iniziare una nuova partita?"
          message="Sei sicuro di voler iniziare una nuova sfida?"
          onConfirm={startNewGame}
          onCancel={handleCancelGame}
        />

      <RoundResultPopup 
        show={gameState === 'round-result'}
        result={roundResult}
        onNextRound={handleNextRound}
      />

      <div className="demo-page modern-look">
        
        {/* Messaggio di caricamento mentre il server prepara la partita */}
        {gameState === 'loading' && <div className="loading-message">Caricamento nuova partita...</div>}
        
        {/* Riepilogo di fine partita */}
        {gameState === 'game-over' && (
        <GameSummary 
            title="Partita Terminata!"
            resultMessage={gameResult === 'win' ? 'Hai Vinto!' : 'Hai Perso!'}
            resultStatus={gameResult} 
            cards={[...handCards].sort((a,b) => a.misfortune_index - b.misfortune_index)}
            primaryAction={{ text: 'Gioca Ancora', action: startNewGame }}
            secondaryAction={{ text: 'Torna alla Home', action: () => navigate('/home') }}
        />
      )}

        {error && <div className="error-message">{error}</div>}

        {/* --- VISTA DI GIOCO PRINCIPALE --- */}
        {!error && (gameState === 'playing' || gameState === 'result-pending') && cardToGuess && (
           <>
            <header className="modern-header">
                <h1>Il Gioco della Sfortuna</h1>
                <div className="game-stats">
                    <span>Carte: <strong>{handCards.length} / 6</strong></span>
                    <span>Errori: <strong>{wrongGuesses} / 3</strong></span>
                </div>
            </header>
            <GameBoard
              cardToGuess={cardToGuess}
              handCards={handCards}
              onGuess={handleGuess}
              timeLeft={timeLeft}
              gameState={gameState}
            />
           </>
        )}
      </div>
    </div>
  );
}

export default FullGamePage;