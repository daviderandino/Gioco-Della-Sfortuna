import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import API from '../API.mjs';
import GameBoard from './GameBoard'; 
import GameSummary from './GameSummary';
import ConfirmationPopup from './ConfirmationPopup'; 
import '../styles/DemoPage.css';


function DemoPage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('confirm'); 
  const [handCards, setHandCards] = useState([]); 
  const [cardToGuess, setCardToGuess] = useState(null); 
  const [timeLeft, setTimeLeft] = useState(30); 
  const [roundResult, setRoundResult] = useState(null); 
  const [showSummary, setShowSummary] = useState(false); 
  const [wonCardsInSummary, setWonCardsInSummary] = useState([]); 
  const [errorLoading, setErrorLoading] = useState(null); 

  const fetchDemoData = useCallback(async () => {
    setGameState('loading');
    setErrorLoading(null);
    setShowSummary(false); 
    try {
      const data = await API.getDemoCards(); 
      if (!data.initialHand || !data.cardToGuess || data.initialHand.length < 3) {
          throw new Error("Dati ricevuti per la demo non validi.");
      }
      setHandCards(data.initialHand); 
      setCardToGuess(data.cardToGuess); 
      setRoundResult(null); 
      setTimeLeft(30); 
      setGameState('guessing'); 
    } catch (err) {
      setErrorLoading(err.toString()); 
      setGameState('error'); 
    }
  }, []);
  
  const handleGuess = useCallback(async (droppedSlotIndex) => {
    if (gameState !== 'guessing' || cardToGuess === null) return;
    setGameState('result');
    if (droppedSlotIndex === null) {
      setRoundResult('timeout');
      setWonCardsInSummary([...handCards].sort((a, b) => a.name.localeCompare(b.name)));
      setShowSummary(true);
      return;
    }
    try {
      const guessData = {
        cardToGuessId: cardToGuess.id,
        handCardIds: handCards.map(c => c.id),
        droppedSlotIndex: droppedSlotIndex
      };
      const serverResponse = await API.checkDemoGuess(guessData);
      setRoundResult(serverResponse.result);
      setWonCardsInSummary(serverResponse.summaryHand);
      setShowSummary(true);
    } catch (err) {
      setErrorLoading(err.toString());
      setGameState('error');
    }
  }, [gameState, cardToGuess, handCards]);

  useEffect(() => {
    let timerId;
    if (gameState === 'guessing' && timeLeft > 0 && !showSummary) {
      timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === 'guessing' && timeLeft === 0 && !showSummary) {
      handleGuess(null); 
    }
    return () => clearTimeout(timerId);
  }, [gameState, timeLeft, handleGuess, showSummary]);


  return (
    <div className="demo-page-container">
        <ConfirmationPopup
            show={gameState === 'confirm'}
            title="Avviare la Demo?"
            message="Avrai un solo round per posizionare la carta correttamente."
            onConfirm={fetchDemoData}
            onCancel={() => navigate('/istruzioni')}
            confirmText="Avvia"
            cancelText="Indietro"
        />

        {gameState === 'loading' && <div className="demo-page modern-look">Caricamento Partita Demo...</div>}
        
        {errorLoading && <div className="demo-page modern-look error-view">{errorLoading}</div>}
        
        {showSummary && (
            <div className="demo-page modern-look">
            <GameSummary
                title="Partita Terminata!"
                resultMessage={roundResult === 'win' ? 'Hai indovinato!' : (roundResult === 'timeout' ? 'Tempo Scaduto!' : 'Non hai indovinato.')}
                resultStatus={roundResult === 'win' ? 'win' : 'loss'}
                cards={wonCardsInSummary}
                primaryAction={{ text: "Gioca un'altra Demo", action: () => setGameState('confirm') }}
                secondaryAction={{ text: 'Torna alle Istruzioni', action: () => navigate('/istruzioni') }}
            />
            </div>
        )}

        {(gameState === 'guessing' || gameState === 'result') && !showSummary && (
            <div className="demo-page modern-look">
            <header className="demo-game-header modern-header">
                <h1>Partita Demo</h1>
                <p>Trascina la nuova carta per ordinarla correttamente nella tua mano!</p>
            </header>
            <GameBoard
                cardToGuess={cardToGuess}
                handCards={handCards}
                onGuess={handleGuess}
                timeLeft={timeLeft}
                gameState={gameState}
            />
            </div>
        )}
    </div>
  );
}

export default DemoPage;