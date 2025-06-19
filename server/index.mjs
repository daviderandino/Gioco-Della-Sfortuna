import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import ConnectSQLite3 from 'connect-sqlite3';
import { saveGame, getGameHistoryByUserId } from './dao-games.mjs'; 
import { getUserByUsername, checkPassword } from './dao-users.mjs';
import { getRandomCardsFromDB, getCardsByIds } from './dao-cards.mjs';


const app = express();
const PORT = process.env.PORT || 3001; // Porta per il server API

app.use(morgan('dev')); 
app.use(express.json()); 


// client e server girano su porte diverse. Per sicurezza i browser
// bloccherebbero le richieste del client verso il server
// cors dice "fidati delle richieste che arrivano da :5173"
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true, // Permette invio e ricezione dei cookie di sessione
};
app.use(cors(corsOptions));
app.use(express.static('public'));
const SQLiteStore = ConnectSQLite3(session);

async function getUser(username, password) {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return null;
    }

    const passwordMatch = await checkPassword(user, password);
    if (!passwordMatch) {
      return null; 
    }

    // Se tutto è corretto, restituisci l'utente (senza la password hashata)
    return { id: user.id, username: user.username };

  } catch (err) {
    // console.error("Errore durante l'autenticazione dell'utente:", err);
    return null;
  }
}

// LocalStrategy: username e password
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  if(!user)
    // chiama callback con null per l'utente, false per autenticazione fallita e un messaggio di errore
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

// salva oggetto user nel caso di login riuscito
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

// ad ogni richiesta successiva, recupera l'utente dalla sessione e lo passa a req.user
passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

// Middleware per proteggere le route
export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
};

// --- Middleware per proteggere le route per utenti NON autenticati ---
export const isAnonymous = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(403).json({ error: 'Authenticated users cannot access this resource.' });
  }
  return next();
};

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: './' }), // Memorizza sessioni in sessions.db nella root del server
  secret: 'shhhhh... it\'s a secret!', 
  resave: false,
  saveUninitialized: false, 
}));

app.use(passport.authenticate('session'));

// Route per l'Autenticazione 

// POST /api/sessions - Login
app.post('/api/sessions', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // username o password errati
      return res.status(401).json({ message: info.message || 'Username o password errati' });
    }
    // Autenticazione riuscita, stabilisci la sessione
    req.login(user, (err) => { 
      if (err) return next(err);
      // Restituisci info utente (senza password!)
      return res.status(200).json({ id: user.id, username: user.username });
    });
  })(req, res, next);
});

// DELETE /api/sessions/current - Logout
app.delete('/api/sessions/current', (req, res, next) => {
  req.logout((err) => { 
    if (err) return next(err);
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie('connect.sid'); // Nome del cookie di sessione di default
      return res.status(204).end(); // No content, logout avvenuto con successo
    });
  });
});

// GET /api/sessions/current - Controlla stato sessione
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) { 
    res.status(200).json({ id: req.user.id, username: req.user.username });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// GET /api/demo/cards - Fornisce carte per la demo
app.get('/api/demo/cards', isAnonymous, async (req, res, next) => {
  try {
    const DEMO_CARD_COUNT = 4;
    const cards = await getRandomCardsFromDB(DEMO_CARD_COUNT);

    if (cards.length < DEMO_CARD_COUNT) {
      return res.status(500).json({ error: 'Non ci sono abbastanza carte nel database per avviare la demo.' });
    }

    // Separa la mano dalla carta da indovinare
    const initialHand = cards.slice(0, 3);
    const cardToGuess = cards[3];

    // Rimuove l'indice dalla carta da indovinare
    const secureCardToGuess = (({ misfortune_index, ...card }) => card)(cardToGuess);
    
    // Memorizza l'orario di inizio nella sessione del server
    req.session.demoStartTime = Date.now();

    // Salva la sessione e solo dopo invia la risposta
    req.session.save(err => {
      if (err) {
        // Se c'è un errore nel salvataggio della sessione, è un errore 500
        return next(err);
      }
      // Se il salvataggio va a buon fine, invia i dati al client
      res.json({ 
        initialHand: initialHand,
        cardToGuess: secureCardToGuess 
      });
    });
  } catch (error) {
    // console.error("Errore API /api/cards/demo:", error);
    res.status(500).json({ error: 'Errore nel recuperare le carte per la demo.' });
  }
});

// POST /api/demo/check-guess - Verifica il tentativo di indovinare la carta nella Demo
app.post('/api/demo/check-guess', isAnonymous, async (req, res) => {
  const { cardToGuessId, handCardIds, droppedSlotIndex } = req.body;

  const TIME_LIMIT_MS = 31000; // 31 secondi, 1s di tolleranza
  const startTime = req.session.demoStartTime;

  // Calcola il tempo trascorso e verifica se è scaduto
  if (Date.now() - startTime > TIME_LIMIT_MS) {
    const allInvolvedCards = await getCardsByIds([cardToGuessId, ...handCardIds]);
    const handCards = allInvolvedCards.filter(c => c.id !== cardToGuessId);
    
    // Salva la sessione e rispondi
    return req.session.save(() => {
        res.json({
            result: 'loss',
            summaryHand: handCards.sort((a, b) => a.misfortune_index - b.misfortune_index)
        });
    });
  }

  if (!cardToGuessId || !Array.isArray(handCardIds) || droppedSlotIndex === undefined) {
    return res.status(400).json({ error: 'Dati del tentativo mancanti o malformati.' });
  }

  try {
    // Recupera tutte le carte coinvolte (carta da indovinare + mano)
    const allInvolvedCardIds = [cardToGuessId, ...handCardIds]; 
    const allInvolvedCards = await getCardsByIds(allInvolvedCardIds);

    // Trova la carta da indovinare e la mano
    const cardToGuess = allInvolvedCards.find(c => c.id === cardToGuessId);
    const handCards = allInvolvedCards.filter(c => c.id !== cardToGuessId);

    // Se non trovi la carta da indovinare o la mano, ritorna errore
    const currentHandSorted = [...handCards].sort((a, b) => a.misfortune_index - b.misfortune_index);
    const newCardIndexValue = cardToGuess.misfortune_index;
    let isCorrect = false;

    // Controlla se l'indice della carta da indovinare è corretto rispetto alla posizione scelta
    if (droppedSlotIndex !== null) {
      if (currentHandSorted.length === 0) { isCorrect = true; }
      else if (droppedSlotIndex === 0) { isCorrect = newCardIndexValue < currentHandSorted[0].misfortune_index; }
      // Se è l'ultimo slot, controlla se l'indice è maggiore dell'ultimo della mano
      else if (droppedSlotIndex === currentHandSorted.length) { isCorrect = newCardIndexValue > currentHandSorted[currentHandSorted.length - 1].misfortune_index; }
      // Se è in mezzo, controlla se l'indice è tra i due adiacenti
      else { isCorrect = newCardIndexValue > currentHandSorted[droppedSlotIndex - 1].misfortune_index && newCardIndexValue < currentHandSorted[droppedSlotIndex].misfortune_index; }
    }

    let finalHandForSummary = [];
    if (isCorrect) {
      // Se l'indovinato è corretto, aggiungi la carta da indovinare alla mano
      finalHandForSummary = [...handCards, cardToGuess].sort((a,b) => a.misfortune_index - b.misfortune_index);
    } else {
      // Se l'indovinato è sbagliato, restituisci la mano senza modifiche
      finalHandForSummary = currentHandSorted;
    }
    
    res.json({
      // Risultato del tentativo
      result: isCorrect ? 'win' : 'loss',
      summaryHand: finalHandForSummary
    });

  } catch (error) {
    // console.error("Errore API /api/demo/check-guess:", error);
    res.status(500).json({ error: 'Errore durante la verifica del tentativo demo.' });
  }
});


// Inizia una nuova partita e salva il mazzo in sessione
app.post('/api/games/start', isLoggedIn, async (req, res, next) => {
  try {
    // 9 per sicurezza, tanto l'impatto sul DB è minimo
    const FULL_GAME_CARD_COUNT = 9;
    const cards = await getRandomCardsFromDB(FULL_GAME_CARD_COUNT);

    if (cards.length < FULL_GAME_CARD_COUNT) {
      return res.status(500).json({ error: 'Non ci sono abbastanza carte nel database per avviare una partita.' });
    }

    const initialHand = cards.slice(0, 3);
    const deckToGuess = cards.slice(3);

    // Salva l'intero stato iniziale della partita in sessione
    req.session.currentGame = {
      initialCards: initialHand.map(c => c.id),
      currentHand: initialHand,                 
      deck: deckToGuess,                       
      rounds: [],                          
      errors: 0,                              
      status: 'active'                        
    };

    req.session.currentRoundStartTime = Date.now();
    
    req.session.save(err => {
      if (err) return next(err);
      // Invia al client SOLO la mano iniziale 
      res.json(initialHand); 
    });

  } catch (error) {
    // console.error("Errore API /api/games/start:", error);
    res.status(500).json({ error: 'Errore nell\'avviare la partita.' });
  }
});

// GET /api/games/next-card - Fornisce la prossima carta da indovinare, prendendola dalla sessione
app.get('/api/games/next-card', isLoggedIn, (req, res, next) => {
  if (!req.session.currentGame || req.session.currentGame.deck.length === 0) {
    return res.status(404).json({ error: 'Nessuna partita attiva o mazzo esaurito.' });
  }
  // Prende la prima carta dal mazzo e la rimuove
  const cardToGuess = req.session.currentGame.deck.shift();

  req.session.currentRoundStartTime = Date.now();

  req.session.save(err => {
    if (err) return next(err);

    // Rimuove l'indice di sfortuna prima di inviare la carta al client 
    const { misfortune_index, ...secureCardToGuess } = cardToGuess;
    
    res.json(secureCardToGuess);
  });
});

// POST /api/games/check-guess - Verifica il tentativo di indovinare la carta
app.post('/api/games/check-guess', isLoggedIn, async (req, res) => {
  const { cardToGuessId, handCardIds, droppedSlotIndex } = req.body;
  const TIME_LIMIT_MS = 30000;

  if (!req.session.currentGame || req.session.currentGame.status !== 'active') {
    return res.status(400).json({ error: 'Nessuna partita attiva.' });
  }

  if (!cardToGuessId || !Array.isArray(handCardIds)) {
    return res.status(400).json({ error: 'Dati del tentativo mancanti o malformati.' });
  }

  const roundStartTime = req.session.currentRoundStartTime;
  req.session.currentRoundStartTime = null; 
  // Per fare la validazione del timer
  const durationMs = Date.now() - roundStartTime;

  let isCorrect = false;
  let roundResultForClient = 'loss_wrong_position';

  // se il tempo è scaduto (anche se il client prova a barare) o non è stato selezionato uno slot valido conta come errore
  if (durationMs > TIME_LIMIT_MS || droppedSlotIndex === null) {
      req.session.currentGame.errors++;
      req.session.currentGame.rounds.push({ round_number: req.session.currentGame.rounds.length + 1, result: 'loss', card_id: cardToGuessId });
      if (req.session.currentGame.errors >= 3) {
        req.session.currentGame.status = 'loss';
      }
      return req.session.save(() => res.json({ result: 'loss_timeout', gameStatus: req.session.currentGame.status }));
  }

  try {
    // come nella demo
    const allInvolvedCards = await getCardsByIds([cardToGuessId, ...handCardIds]);
    const cardToGuess = allInvolvedCards.find(c => c.id === cardToGuessId);
    
    const currentHandSorted = [...req.session.currentGame.currentHand].sort((a, b) => a.misfortune_index - b.misfortune_index);
    const newCardIndexValue = cardToGuess.misfortune_index;
    if (droppedSlotIndex === 0) { isCorrect = newCardIndexValue < currentHandSorted[0].misfortune_index; }
    else if (droppedSlotIndex === currentHandSorted.length) { isCorrect = newCardIndexValue > currentHandSorted[currentHandSorted.length - 1].misfortune_index; }
    else { isCorrect = newCardIndexValue > currentHandSorted[droppedSlotIndex - 1].misfortune_index && newCardIndexValue < currentHandSorted[droppedSlotIndex].misfortune_index; }

    if (isCorrect) {
      roundResultForClient = 'win';
      req.session.currentGame.currentHand.push(cardToGuess);
      req.session.currentGame.rounds.push({ round_number: req.session.currentGame.rounds.length + 1, result: 'win', card_id: cardToGuessId });
    } else {
      req.session.currentGame.errors++;
      req.session.currentGame.rounds.push({ round_number: req.session.currentGame.rounds.length + 1, result: 'loss', card_id: cardToGuessId });
    }
    
    if (req.session.currentGame.currentHand.length >= 6) {
      req.session.currentGame.status = 'win';
    } else if (req.session.currentGame.errors >= 3) {
      req.session.currentGame.status = 'loss';
    }

    req.session.save(() => {
        res.json({
            result: roundResultForClient,
            correctIndex: cardToGuess.misfortune_index,
            gameStatus: req.session.currentGame.status 
        });
    });

  } catch (error) {
    // console.error("Errore API /api/game/check-guess:", error);
    res.status(500).json({ error: 'Errore durante la verifica del tentativo.' });
  }
});

// POST /api/games - Salva una partita completata
app.post('/api/games', isLoggedIn, async (req, res) => {
  if (!req.session.currentGame || req.session.currentGame.status === 'active') {
    return res.status(400).json({ error: 'Nessuna partita completata da salvare.' });
  }

  const userId = req.user.id;
  const gameData = req.session.currentGame;

  try {
    // Chiama `saveGame` con i dati dalla sessione
    const gameId = await saveGame(
      userId,
      gameData.status,
      gameData.currentHand.length,
      gameData.rounds,
      gameData.initialCards
    );
    
    // Pulisce la sessione per evitare di salvare la stessa partita due volte
    req.session.currentGame = null;
    
    req.session.save(() => {
        res.status(201).json({ gameId });
    });

  } catch (error) {
    // console.error("Errore API /api/games POST:", error);
    res.status(500).json({ error: 'Errore nel salvare la partita.' });
  }
});

// GET /api/games - Recupera la cronologia delle partite dell'utente
app.get('/api/games', isLoggedIn,async (req, res) => {
  if (!req.user || typeof req.user.id === 'undefined') {
    //console.error('Errore API /api/games GET: req.user o req.user.id non definito dopo isLoggedIn.');
    return res.status(500).json({ error: 'Errore interno del server: utente non valido o sessione corrotta.' });
  }

  const userId = req.user.id; 
  
  try {
    const history = await getGameHistoryByUserId(userId);
    res.json(history);
  } catch (error) {
    // console.error("Errore API /api/games GET:", error);
    res.status(500).json({ error: 'Errore nel recuperare la cronologia.' });
  }
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server API in ascolto su http://localhost:${PORT}`);
});