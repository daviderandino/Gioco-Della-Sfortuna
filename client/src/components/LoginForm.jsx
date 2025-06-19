import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import API from '../API.mjs';
import '../styles/LoginForm.css';

// onLoginSuccess è una funzione passata come prop al componente LoginForm
// che viene chiamata quando il login ha successo, permettendo al componente genitore di
// aggiornare lo stato dell'utente loggato
function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Funzione asincrona eseguita quando utente invia il form di login
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    if (!username || !password) {
      setError('Username e password sono richiesti.');
      setIsLoading(false);
      return;
    }
    try {
      const userData = await API.logIn({ username, password }); 
      // Se il login ha successo, userData conterrà i dati dell'utente
      if (onLoginSuccess) onLoginSuccess(userData); // Passa i dati dell'utente al componente genitore
      navigate('/home');
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h2 className="page-main-title">Gioco della Sfortuna</h2>
      <div className="login-content-area">
        <img src="/images/1.jpg" alt="Situazione sfortunata 1" className="side-image left-image" />
        
        <div className="login-container">
          <h3>Login</h3>
          {error && <p className="login-error">{error}</p>}
          {isLoading && <p>Autenticazione in corso...</p>}
          <form onSubmit={handleSubmit} className="login-form">
             <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" disabled={isLoading} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={isLoading} />
            </div>
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Login in corso...' : 'Login'}
            </button>
          </form>
          <div className="login-footer">
            <p>
              Nessun account? Scopri come funziona: <Link to="/istruzioni">istruzioni e demo</Link>.
            </p>
          </div>
        </div>
        <img src="/images/2.jpg" alt="Situazione sfortunata 2" className="side-image right-image" />
      </div>
    </div>
  );
}

export default LoginForm;