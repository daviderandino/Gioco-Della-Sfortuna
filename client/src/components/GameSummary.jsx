import '../styles/GameSummary.css';

// Condiviso tra FullGamePage e DemoPage
// GameSummary mostra un riepilogo della partita con le carte giocate e la possibilità di 
// iniziare una nuova partita o tornare alla home (o alle istruzioni, nel caso della demo).

function GameSummary({ title, resultMessage, resultStatus, cards, primaryAction, secondaryAction }) {
  return (
    <div className="summary-view">
      <h2>{title}</h2>
      <p className={`round-result-message ${resultStatus}`}>
        {resultMessage}
      </p>
      
      <h3>Riepilogo Carte:</h3>
      <div className="cards-grid summary-cards-horizontal">
        {cards.map(card => (
          <div key={card.id} className="card-display summary-card">
            <img src={card.image_url} alt={card.name} />
            <p><strong>{card.name}</strong></p>
            {card.misfortune_index && <p>Indice: {card.misfortune_index}</p>}
          </div>
        ))}
      </div>

      <div className="summary-actions">
        {primaryAction && (
          <button onClick={primaryAction.action} className="button-link modern-button primary-action">
            {primaryAction.text}
          </button>
        )}
        {secondaryAction && (
          <button onClick={secondaryAction.action} className="button-link modern-button secondary">
            {secondaryAction.text}
          </button>
        )}
      </div>
    </div>
  );
}

export default GameSummary;