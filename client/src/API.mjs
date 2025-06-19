const SERVER_URL = "http://localhost:3001"; 

// Prende l'oggetto response di Fetch e gestisce la risposta trasformandola in JSON o gestendo gli errori
async function handleResponse(response) {
  if (response.ok) {
    if (response.status === 204) {
      return null;
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    }
    return response.text(); 
  } else {
    let errorPayload;
    try {
      errorPayload = await response.json();
    } catch (e) {
      errorPayload = { error: response.statusText, message: `Request failed with status ${response.status}` };
    }
    throw errorPayload.message || errorPayload.error || `API Error: ${response.status}`;
  }
}

// Funzioni per interagire con l'API del server
// Queste funzioni utilizzano Fetch per inviare richieste HTTP al server e gestiscono le risposte
// Ogni funzione restituisce una Promise che risolve con i dati della risposta o rifiuta con un errore
// Le funzioni sono progettate per essere utilizzate per l'autenticazione e per il gioco
// Utilizzano il metodo POST per inviare dati al server e il metodo GET per recuperare dati

const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include', // Includw i cookie per l'autenticazione
  });
  return handleResponse(response);
};

const logOut = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response); 
};


const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include', 
  });
  return handleResponse(response); 
};

const getDemoCards = async () => {
  const response = await fetch(SERVER_URL + '/api/demo/cards', {
    credentials: 'include',
  });
  return handleResponse(response);
};

const startGame = async () => {
  const response = await fetch(SERVER_URL + '/api/games/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', 
  });
  return handleResponse(response); 
};

const getNextCard = async () => {
  const response = await fetch(SERVER_URL + '/api/games/next-card', {
    credentials: 'include', 
  });
  return handleResponse(response); 
};

const saveGame = async () => {
  const response = await fetch(SERVER_URL + '/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(response);
};

const getGameHistory = async () => {
  const response = await fetch(SERVER_URL + '/api/games', {
    credentials: 'include',
  });
  return handleResponse(response);
};

const checkGuess = async (guessData) => {
  const response = await fetch(SERVER_URL + '/api/games/check-guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(guessData),
    credentials: 'include',
  });
  return handleResponse(response);
};

const checkDemoGuess = async (guessData) => {
  const response = await fetch(SERVER_URL + '/api/demo/check-guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(guessData),
  });
  return handleResponse(response);
};

const API = {
  logIn,
  logOut,
  getUserInfo,
  getDemoCards,
  startGame,
  getNextCard,
  saveGame,
  getGameHistory,
  checkGuess,
  checkDemoGuess,
};

export default API;