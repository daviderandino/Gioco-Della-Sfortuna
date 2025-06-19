import React, { useState, useCallback } from 'react';
import '../styles/GameBoard.css';

/*
 Condiviso tra FullGamePage e DemoPage
 GameBoard è un componente che renderizza l'area di gioco.
 Gestisce tutta la logica di Drag and Drop e la visualizzazione delle carte,
 ma non conosce le regole del gioco. Notifica il componente genitore di una
 mossa tramite la callback onGuess.
 */

function GameBoard({ cardToGuess, handCards, onGuess, timeLeft, gameState }) { // riceve cardToGuess, handCards, onGuess, timeLeft e gameState come props da FullGamePage
  const [isDragging, setIsDragging] = useState(false);
  
  // Memorizza l'indice dello slot su cui l'utente sta passando col mouse.
  const [dragOverSlot, setDragOverSlot] = useState(null);

  // Funzione per ordinare le carte della mano in base all'indice di sfortuna
  // useCallback viene usato per memorizzare la funzione e prevenire ricreazioni inutili
  const sortedHand = useCallback(() => {
    return [...handCards].sort((a, b) => a.misfortune_index - b.misfortune_index);
  }, [handCards]);

  const handleDragStart = (e, card) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverSlot(null); // Resetta lo stato di hover alla fine del trascinamento
  };

  
  const handleDragOver = (e, slotIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Aggiorna lo stato per indicare su quale slot siamo
    setDragOverSlot(slotIndex);
  };

  const handleDragLeave = () => {
    // Resetta lo stato quando l'utente esce dall'area di uno slot
    setDragOverSlot(null);
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    const droppedCardId = e.dataTransfer.getData('text/plain');

    if (cardToGuess && cardToGuess.id.toString() === droppedCardId) {
      onGuess(slotIndex);
    }
    // Resetta tutti gli stati visivi alla fine del drop
    setIsDragging(false);
    setDragOverSlot(null);
  };

  const renderHandWithDynamicDropSlots = () => {
    const currentHandSorted = sortedHand();
    const elements = [];

    // Funzione helper per renderizzare un singolo slot
    const renderSlot = (index) => {
      // La classe viene determinata dinamicamente in base allo stato
      const isActive = isDragging && dragOverSlot === index;
      const className = `drop-slot-dynamic ${isDragging ? 'visible' : ''} ${isActive ? 'drag-over-active' : ''}`;
      
      return (
        <div 
          key={`slot-${index}`}
          className={className} 
          onDragOver={(e) => handleDragOver(e, index)} 
          onDragLeave={handleDragLeave} 
          onDrop={(e) => handleDrop(e, index)}
        >
          <span></span>
        </div>
      );
    };

    if (currentHandSorted.length === 0) {
      return (
        <div className="hand-plus-slots-interactive-area">
          {renderSlot(0)}
        </div>
      );
    }
    
    const minIndex = currentHandSorted[0].misfortune_index;
    const maxIndex = currentHandSorted[currentHandSorted.length - 1].misfortune_index;
    
    // Renderizza lo slot più a sinistra (indice 0) solo se la carta con l'indice più basso in mano ha un valore > 1.0.
    if (minIndex > 1.0) {
      elements.push(renderSlot(0));
    } else {
      // Altrimenti, renderizza un segnaposto invisibile per mantenere la struttura
      elements.push(<div key="slot-0-disabled" className="drop-slot-placeholder"></div>);
    }
    
    // Loop attraverso le carte per renderizzare la carta e lo slot successivo
    currentHandSorted.forEach((card, index) => {
      // Renderizza la carta
      elements.push(<div key={card.id} className="card-display in-hand"><img src={card.image_url} alt={card.name} /><p><strong>{card.name}</strong></p><p>Indice: {card.misfortune_index}</p></div>);
      
      const isLastCard = index === currentHandSorted.length - 1;
      
      if (isLastCard) {
        // Se è l'ultima carta, controlla se si può inserire qualcosa a destra.
        // Renderizza lo slot più a destra solo se la carta con l'indice più alto ha un valore < 100.0.
        if (maxIndex < 100.0) {
          elements.push(renderSlot(index + 1));
        } else {
          elements.push(<div key="slot-last-disabled" className="drop-slot-placeholder"></div>);
        }
      } else {
        // Se non è l'ultima carta, è uno slot intermedio, che è sempre attivo.
        elements.push(renderSlot(index + 1));
      }
    });

    return <div className="hand-plus-slots-interactive-area">{elements}</div>;
  };

  const draggableCardClass = `card-display card-to-guess draggable ${isDragging ? 'dragging-card-active' : ''}`;

  return (
    <div className="game-board-container">
        <div className="game-content-wrapper">
            {cardToGuess && (
                <section className="draggable-card-column">
                <h3>Trascina Questa Carta:</h3>
                <div className="draggable-card-wrapper">
                    <div
                      id={`draggable-${cardToGuess.id}`}
                      className={draggableCardClass}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, cardToGuess)}
                      onDragEnd={handleDragEnd}
                    >
                      <img src={cardToGuess.image_url} alt={cardToGuess.name} />
                      <p><strong>{cardToGuess.name}</strong></p>
                      <p className="misfortune-hidden">(Indice di Sfortuna Nascosto)</p>
                    </div>
                </div>
                {(gameState === 'playing' || gameState === 'guessing') && <div className="timer">Tempo: {timeLeft}s</div>}
                </section>
            )}

            <section className="player-hand-column">
                <h2 style={{ textAlign: 'left' }}>La Tua Mano:</h2>
                {renderHandWithDynamicDropSlots()}
            </section>
        </div>
    </div>
  );
}

export default GameBoard;