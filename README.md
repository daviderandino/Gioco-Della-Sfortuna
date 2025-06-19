# Exam #1: "GiocoSfortuna"
## Student: s346257 Randino Davide

## React Client Application Routes

- Route `/`: Rotta di default, reindirizza a /home o /login in base allo stato di login.
- Route `/login`: Mostra il form di accesso per l'autenticazione.
- Route `/istruzioni`: Mostra la pagina con le regole del gioco e il link alla modalità demo.
- Route `/demo`: Permette di giocare una versione di prova del gioco (un solo round) senza login. 
- Route `/home`: Home per l'utente loggato, da cui può iniziare a giocare.
- Route `/play-game`: Contiene la logica e l'interfaccia per una partita completa.
- Route `/profile`: Mostra la cronologia di tutte le partite completate dall'utente.

## API Server

- POST `/api/sessions`
  - Esegue il login di un utente. Richiede username e password nel body e restituisce i dati dell'utente.
  - 200 OK
  - 401 UNAUTHORIZED in caso di body errato

  ESEMPIO BODY RICHIESTA:
  <pre> 
    {
    "username": "davider02",
    "password": "davide"
    }
  </pre>
  ESEMPIO BODY RISPOSTA (200 OK):
  <pre> 
    {
    "id": 1,
    "username": "davider02"
    }
    </pre>
- DELETE `/api/sessions/current`
  - Esegue il logout dell'utente corrente, terminando la sessione.
  - 204 NO CONTENT
- GET `/api/sessions/current`
  - Controlla se esiste una sessione attiva, restituendo i dati dell'utente se autenticato o un errore 401.
  - 200 OK
  - 401 UNAUTHORIZED Se non c'è una sessione attiva

  ESEMPIO BODY RISPOSTA (200 OK):
  <pre>
  {
  "id": 1,
  "username": "davider02"
  }
  </pre>
- GET `/api/demo/cards`
  - Fornisce un set di carte casuali per la modalità demo (3 per la mano, 1 da indovinare). Non è accessibile se l'utente è loggato.
  - 200 OK
  - 403 FORBIDDEN Se l'utente è loggato
  - 500 INTERNAL SERVER ERROR Se non ci sono abbastanza carte nel DB

  ESEMPIO BODY RISPOSTA (200 OK):
  <pre>
  {
  "initialHand": [
    {
      "id": 5,
      "name": "Il wi-fi del Poli non funziona ",
      "image_url": "/images/cards/wifi.jpg",
      "misfortune_index": 9
    },
    {
      "id": 25,
      "name": "La tua borraccia perde nello zaino e allaga i tuoi appunti",
      "image_url": "/images/cards/bottigliaAllaga.jpg",
      "misfortune_index": 62.5
    },
    {
      "id": 41,
      "name": "Vieni bocciato all'esame",
      "image_url": "/images/cards/bocciatoEsame.jpg",
      "misfortune_index": 92
    }
  ],
  "cardToGuess": {
    "id": 15,
    "name": "Ti svegli all’orario in cui dovevi già essere in aula",
    "image_url": "/images/cards/svegliaTardi.jpg",
    }
  }
  </pre>

- POST `/api/demo/check-guess`
  - Verifica l'esito di una partita demo. Non è accessibile se l'utente è loggato
  - 200 OK
  - 400 BAD REQUEST Se i dati inviati sono incompleti
  - 403 FORBIDDEN Se l'utente è loggato

  ESEMPIO BODY RICHIESTA:
  <pre>
  {
  "cardToGuessId": 15,
  "handCardIds": [5, 25, 41],
  "droppedSlotIndex": 1
  }
  </pre>

  ESEMPIO BODY RISPOSTA (200 OK):
  <pre>
  {
  "result": "win",
  "summaryHand": [
      {
          "id": 5,
          "name": "Il wi-fi del Poli non funziona ",
          "image_url": "http://localhost:3001/images/cards/wifi.jpg",
          "misfortune_index": 9
      },
      {
          "id": 15,
          "name": "Ti svegli all’orario in cui dovevi già essere in aula",
          "image_url": "http://localhost:3001/images/cards/svegliaTardi.jpg",
          "misfortune_index": 35
      },
      {
          "id": 25,
          "name": "La tua borraccia perde nello zaino e allaga i tuoi appunti",
          "image_url": "http://localhost:3001/images/cards/bottigliaAllaga.jpg",
          "misfortune_index": 62.5
      },
      {
          "id": 41,
          "name": "Vieni bocciato all'esame",
          "image_url": "http://localhost:3001/images/cards/bocciatoEsame.jpg",
          "misfortune_index": 92
      }
  ]
  }
  </pre>

- POST `/api/games/start`
  - Inizia una nuova partita e salva il mazzo in sessione. Restituisce le tre carte della mano
  - 200 OK
  - 401 UNAUTHORIZED Se non c'è una sessione attiva
  - 500 INTERNAL SERVER ERROR Se non ci sono abbastanza carte nel DB

  ESEMPIO BODY RISPOSTA (200 OK)
  <pre>
  [
    {
        "id": 18,
        "name": "Aspettavi una videolezione ma non viene registrato l'audio",
        "image_url": "http://localhost:3001/images/cards/videolezNoAudio.jpg",
        "misfortune_index": 44.5
    },
    {
        "id": 10,
        "name": "Il caffè della macchinetta è finito proprio quando ne avevi bisogno",
        "image_url": "http://localhost:3001/images/cards/caffeFinito.png",
        "misfortune_index": 20
    },
    {
        "id": 2,
        "name": "Vai in bagno al Poli, ma è finita la carta igienica",
        "image_url": "http://localhost:3001/images/cards/noCartaIgienica.jpg",
        "misfortune_index": 3.5
    }
  ]
  </pre>

- GET `/api/games/next-card`
  - Fornisce la prossima carta da indovinare, prendendola dalla sessione
  - 200 OK
  - 401 UNAUTHORIZED Se non c'è una sessione attiva
  - 404 NOT FOUND Se il mazzo è finito o nessuna partita è attiva

  ESEMPIO BODY RISPOSTA (200 OK):
  <pre>
  {
    "id": 7,
    "name": "Devi andare a lezione ma sbagli aula",
    "image_url": "http://localhost:3001/images/cards/aulaSbagliata.jpg"
  }
  </pre>

- POST `/api/game/check-guess`
 - Verifica un singolo tentativo, aggiorna lo stato della partita nella sessione e restituisce l'esito. Restituisce anche gameStatus ('active', 'win', o 'loss') per informare il client se la partita è terminata. 
  - 200 OK
  - 400 BAD REQUEST Se i dati inviati sono incompleti
  - 401 UNAUTHORIZED Se l'utente non è loggato

    ESEMPIO BODY RICHIESTA:
    <pre>
    {
    "cardToGuessId": 42,
    "handCardIds": [10, 25, 50],
    "droppedSlotIndex": 3
    }
    </pre>

    ESEMPIO BODY RISPOSTA (200 OK):
    <pre>
    {
    "result": "win",
    "correctIndex": 75.5
    "gameStatus": "active"
    }
    </pre>

- POST `/api/games`
  - Finalizza e salva la partita corrente. Il server costruisce i dati della partita basandosi sullo stato salvato in sessione. Il body della richiesta deve essere vuoto.
  - 201 CREATED
  - 400 BAD REQUEST Se non c'è una partita completata in sessione
  - 401 UNAUTHORIZED Se non c'è una sessione attiva

  ESEMPIO BODY RISPOSTA (201 Created)
  <pre>
  {
  "gameId": 15
  }
  </pre>
- GET `/api/games`
  - Recupera la cronologia di tutte le partite giocate dall'utente autenticato.
  - 200 OK
  - 401 UNAUTHORIZED Se non c'è una sessione attiva
  - 500 INTERNAL SERVER ERROR Se la sessione è corrotta
  
  ESEMPIO BODY RISPOSTA (200 OK)
  <pre>
  [
  {
    "id": 15,
    "user_id": 1,
    "start_date": "2025-06-11 17:30:00",
    "end_date": "2025-06-11 17:32:15",
    "status": "win",
    "final_card_count": 6,
    "rounds": [
      {
        "id": 25,
        "game_id": 15,
        "round_number": 1,
        "card_id": 15,
        "result": "win",
        "card_name": "Ti svegli all’orario in cui dovevi già essere in aula"
      },
      {
        "id": 26,
        "game_id": 15,
        "round_number": 2,
        "card_id": 40,
        "result": "loss",
        "card_name": "Perdi le chiavi della stanza in residenza"
      }
    ],
    "initialCards": [
      {
        "game_id": 15,
        "card_name": "Il caffè della macchinetta è finito proprio quando ne avevi bisogno",
        "card_id": 10
      },
      {
        "game_id": 15,
        "card_name": "Fai tutta la fila in segreteria… per scoprire che dovevi prenotare",
        "card_id": 20
      }
    ]
  }
  ]
  </pre>

## Database Tables

- Table `users` - Memorizza le credenziali degli utenti registrati 

    (id, username, hashed_password, salt)
- Table `cards` - Contiene i dati di ogni singola carta del gioco. 

    (id, name, image_url, misfortune_index)
- Table `games` - Registra un riepilogo per ogni partita completata.

    (id, user_id, start_date, end_date, status, final_card_count)
- Table `game_rounds` - Registra ogni singolo round giocato in una partita. 

    (id, game_id, round_number, card_id, result)
- Table `game_initial_cards` - Memorizza le carte della mano iniziale per ogni partita. 

    (id, game_id, card_id)

## Main React Components

- `App` (in `App.jsx`): Gestisce lo stato di autenticazione globale e il routing dell'intera applicazione.
- `LoginForm` (in `LoginForm.jsx`): Gestisce l'input dell'utente e la comunicazione con l'API per il processo di login.
- `HomePage` (in `HomePage.jsx`): Pagina di benvenuto per gli utenti autenticati, con le azioni principali (gioca, vedi cronologia, logout).
- `IstruzioniPage` (in `IstruzioniPage.jsx`): Pagina statica che illustra le regole del gioco e consente di avviare una partita Demo.
- `GameBoard` (in `GameBoard.jsx`): Componente di presentazione condiviso che renderizza l'area di gioco interattiva (la mano del giocatore e la carta da indovinare) e gestisce la logica del Drag and Drop.
- `DemoPage` (in `DemoPage.jsx`): Contiene la logica di gioco per la modalità demo.
- `FullGamePage` (in `FullGamePage.jsx`): Gestisce la logica di una partita completa, tracciando punteggio, errori e round successivi.
- `ProfilePage` (in `ProfilePage.jsx`): Recupera e visualizza la cronologia delle partite dell'utente.

## Screenshot

![partita](client/app/public/images/screenshot/partita.png)
![partita](client/app/public/images/screenshot/cronologia.png)

## Users Credentials

- username: 'davider02', password: 'davide'
- username: 'mirrorbreaker', password: 'blackcat' 
- username: 'sfortunato17', password: 'maiunagioia'