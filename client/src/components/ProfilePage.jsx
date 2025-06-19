import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router'; 
import API from '../API.mjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import GameHistoryCard from './GameHistoryCard';
import '../styles/ProfilePage.css';

dayjs.extend(utc); // per poter interpretare correttamente le date UTC

function ProfilePage({ user }) { // riceve user come prop dal componente App
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // si attiva una sola volta quando il componente viene montato per 1a volta
  useEffect(() => {
    const fetchHistory = async () => { // recuperare lo storico delle partite giocate
      try {
        setLoading(true);
        setError(null);
        const data = await API.getGameHistory();
        setHistory(data);
      } catch (err) {
        // console.error("Errore fetchHistory:", err);
        setError(err.toString());
        if (err.toString().toLowerCase().includes('not authorized') || err.toString().includes('401')) {
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [navigate]);

  if (loading) {
    return <div className="profile-page modern-look"><p>Caricamento cronologia...</p></div>;
  }
  if (error) {
    return <div className="profile-page modern-look error-view"><p>{error}</p><Link to="/home" className="button-link modern-button secondary">Torna alla Home</Link></div>;
  }

return (
    <div className="profile-page modern-look">
      <header className="modern-header profile-header">
        <h1>Cronologia Partite di {user.username}</h1>
        <Link to="/home" className="button-link modern-button secondary">
          Torna alla Home
        </Link>
      </header>
      
      <div className="history-content">
        {history.length === 0 ? (
          <p className="cronologia-vuota">Non hai ancora completato nessuna partita.</p>
        ) : (
          // per ogni partita, renderizza il componente GameHistoryCard.
          history.map(game => (
            <GameHistoryCard key={game.id} game={game} />
          ))
        )}
      </div>
    </div>
  );
}

export default ProfilePage;