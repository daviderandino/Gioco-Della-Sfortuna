import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'; 
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import IstruzioniPage from './components/IstruzioniPage';
import DemoPage from './components/DemoPage';
import FullGamePage from './components/FullGamePage';
import ProfilePage from './components/ProfilePage';
import API from './API.mjs'; 


function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // evitare "sfarfallio" durante il caricamento iniziale

  // passata come prop al LoginForm
  const handleLogin = (userData) => {
    setLoggedInUser(userData);
  };

  const handleLogout = async () => {
    try {
      await API.logOut(); 
      setLoggedInUser(null);
    } catch (error) {
      console.error("Errore API durante il logout:", error);
    }
  };
  
  // Controlla se l'utente è già loggato all'avvio dell'app (quando il componente viene montato)
  // e aggiorna lo stato di loggedInUser
  useEffect(() => {
    const checkSession = async () => {
      setLoadingUser(true);
      try {
        const user = await API.getUserInfo();
        setLoggedInUser(user);
      } catch (error) {
        setLoggedInUser(null);
      } finally {
        setLoadingUser(false); 
      }
    };
    checkSession(); 
  }, []); 


  // Mostra un messaggio di caricamento iniziale mentre si verifica lo stato di login
  if (loadingUser) {
    return <div>Caricamento applicazione...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={loggedInUser ? <Navigate to="/home" /> : <LoginForm onLoginSuccess={handleLogin} />}
        />
        <Route 
          path="/istruzioni" 
          element={loggedInUser ? <Navigate to="/home" /> : <IstruzioniPage />} 
        />
        
        <Route 
          path="/demo" 
          element={loggedInUser ? <Navigate to="/home" /> : <DemoPage />} 
        />
        
        <Route 
          path="/home" 
          element={
            loggedInUser 
              ? <HomePage user={loggedInUser} onLogout={handleLogout} /> 
              : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/play-game" 
          element={
            loggedInUser 
              ? <FullGamePage user={loggedInUser} /> 
              : <Navigate to="/login" />
          } 
        />
        <Route
          path="/profile"
          element={
            loggedInUser
              ? <ProfilePage user={loggedInUser} />
              : <Navigate to="/login" />
          }
        />
        <Route 
          path="/" 
          element={<Navigate to={loggedInUser ? "/home" : "/login"} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;