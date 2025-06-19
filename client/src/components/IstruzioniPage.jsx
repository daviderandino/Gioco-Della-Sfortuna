import React from 'react';
import { Link } from 'react-router';
import '../styles/IstruzioniPage.css';

function IstruzioniPage() {
  const imagePaths = {
    left1: '/images/3.jpg',
    left2: '/images/5.jpg',
    left3: '/images/2.jpg',
    right1: '/images/4.jpg',
    right2: '/images/6.jpg',
    right3: '/images/1.jpg',
  };

  return (
    <div className="instructions-page-container three-column-layout">
      <div className="image-column left-image-column">
        <img src={imagePaths.left1} alt="Immagine illustrativa 1" className="side-image instruction-page-image" />
        <img src={imagePaths.left2} alt="Immagine illustrativa 2" className="side-image instruction-page-image" />
        <img src={imagePaths.left3} alt="Immagine illustrativa 3" className="side-image instruction-page-image" />
      </div>
      <div className="main-content-column">
        <header className="instructions-header">
          <div className="header-main-content">
            <h1>Gioco della Sfortuna - Istruzioni</h1>
            <p>Benvenuto al Gioco della Sfortuna!</p>
          </div>
          <div className="header-actions">
            <Link to="/login" className="button-link header-button">Login</Link>
          </div>
        </header>

        <section className="instructions-section">
          <h2>Come si Gioca (Versione Completa per Utenti Registrati)</h2>
          <p>
            L'obiettivo del gioco è collezionare un totale di <strong>6 carte</strong>, ognuna rappresentante una situazione orribile.
          </p>
          <ul>
            <li><strong>Inizio Partita:</strong> Riceverai 3 carte casuali...</li>
            <li><strong>Svolgimento del Round:</strong>
                <ol>
                <li>Ti verrà presentata una nuova situazione orribile...</li>
                <li>Osservando le carte che hai già in mano...</li>
                <li>Hai <strong>30 secondi</strong> per fare la tua scelta!</li>
                <li><strong>Se indovini la posizione corretta ottieni una carta</strong></li>
                <li><strong>Se sbagli o il tempo scade perdi il round</strong></li>
                <li>Dopo ogni tentativo, un messaggio ti informerà dell'esito...</li>
                </ol>
            </li>
            <li><strong>Fine della Partita:</strong>
                <ul>
                <li><strong>Vinci</strong> se riesci a collezionare 6 carte.</li>
                <li><strong>Perdi</strong> se sbagli la collocazione di 3 situazioni orribili.</li>
                </ul>
            </li>
          </ul>
          <p>
            <em>Ogni carta ha un Indice di Sfortuna unico... Tra e 1 e 100!</em>
          </p>
        </section>

        <section className="demo-game-info">
          <h2>Modalità Demo per Utenti Anonimi</h2>
          <p>
            Come utente anonimo, puoi provare una versione ridotta del gioco!
          </p>
          <ul>
            <li>Inizierai con 3 carte, come nella versione completa.</li>
            <li>Dovrai giocare <strong>un solo round</strong></li>
            <li>Questa è un'ottima occasione per familiarizzare!</li>
          </ul>
        </section>

        <footer className="instructions-footer">
          <p>Pronto a provare la modalità demo?</p>
          <Link to="/demo" className="button-link">Avvia Demo</Link>
        </footer>
      </div>

      <div className="image-column right-image-column">
        <img src={imagePaths.right1} alt="Immagine illustrativa 4" className="side-image instruction-page-image" />
        <img src={imagePaths.right2} alt="Immagine illustrativa 5" className="side-image instruction-page-image" />
        <img src={imagePaths.right3} alt="Immagine illustrativa 6" className="side-image instruction-page-image" />
      </div>
    </div>
  );
}

export default IstruzioniPage;