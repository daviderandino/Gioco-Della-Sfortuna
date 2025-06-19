// server/init-db.mjs
import sqlite3 from 'sqlite3';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const DBSOURCE = "gioco_sfortuna.db";
const saltRounds = 10;
const scryptAsync = promisify(scrypt);

const initialUsers = [
  { username: 'davider02', password: 'davide' },
  { username: 'mirrorbreaker', password: 'blackcat' },
  { username: 'sfortunato17', password: 'maiunagioia' }
];

const API_BASE_URL = "http://localhost:3001";

const initialCardsData = [
  { "id": 1, "name": "Vai in bagno al Poli, ma è finito il sapone", "image_url": `${API_BASE_URL}/images/cards/saponeFinito.jpg`, "misfortune_index": 1.0 },
  { "id": 2, "name": "Vai in bagno al Poli, ma è finita la carta igienica", "image_url": `${API_BASE_URL}/images/cards/noCartaIgienica.jpg`, "misfortune_index": 3.5 },
  { "id": 3, "name": "Il distributore automatico del Poli si mangia i tuoi soldi", "image_url": `${API_BASE_URL}/images/cards/distribMangiaSoldi.jpg`, "misfortune_index": 5.0 },
  { "id": 4, "name": "Finisce il piatto che volevi in mensa", "image_url": `${API_BASE_URL}/images/cards/mensa.jpg`, "misfortune_index": 7.5 },
  { "id": 5, "name": "Il wi-fi del Poli non funziona ", "image_url": `${API_BASE_URL}/images/cards/wifi.jpg`, "misfortune_index": 9.0 },
  { "id": 6, "name": "Aula studio occupata", "image_url": `${API_BASE_URL}/images/cards/aulaStudioOccupata.jpg`, "misfortune_index": 10.0 },
  { "id": 7, "name": "Devi andare a lezione ma sbagli aula", "image_url": `${API_BASE_URL}/images/cards/aulaSbagliata.jpg`, "misfortune_index": 12.0 },
  { "id": 8, "name": "Ti perdi all'interno del Poli perché non conosci la mappa", "image_url": `${API_BASE_URL}/images/cards/uniLabirinto.jpg`, "misfortune_index": 15.0 },
  { "id": 9, "name": "Vieni rimproverato dal prof per aver parlato in aula", "image_url": `${API_BASE_URL}/images/cards/rimproverato.jpg`, "misfortune_index": 18.0 },
  { "id": 10, "name": "Il caffè della macchinetta è finito proprio quando ne avevi bisogno", "image_url": `${API_BASE_URL}/images/cards/caffeFinito.png`, "misfortune_index": 20.0 },
  { "id": 11, "name": "Il proiettore in aula non funziona e il professore non può mostrare le slides ", "image_url": `${API_BASE_URL}/images/cards/proiettore.jpg`, "misfortune_index": 25.0 },
  { "id": 12, "name": "Esci in ritardo e prendi il tram sbagliato", "image_url": `${API_BASE_URL}/images/cards/tramSbagliato.jpg`, "misfortune_index": 28.0 },
  { "id": 13, "name": "Lasci il microfono acceso durante la lezione online", "image_url": `${API_BASE_URL}/images/cards/micAcceso.jpg`, "misfortune_index": 30.5 },
  { "id": 14, "name": "Il bus per andare al Poli non passa", "image_url": `${API_BASE_URL}/images/cards/busTorino.jpg`, "misfortune_index": 33.0 },
  { "id": 15, "name": "Ti svegli all'orario in cui dovevi già essere in aula", "image_url": `${API_BASE_URL}/images/cards/svegliaTardi.jpg`, "misfortune_index": 35.0 },
  { "id": 16, "name": "Aria fredda accesa in inverno al Poli", "image_url": `${API_BASE_URL}/images/cards/ariaCondiz.jpg`, "misfortune_index": 38.0 },
  { "id": 17, "name": "In residenza parte l'allarme antincendio alle 3 di notte", "image_url": `${API_BASE_URL}/images/cards/alarm3am.jpg`, "misfortune_index": 40.0 },
  { "id": 18, "name": "Aspettavi una videolezione ma non viene registrato l'audio", "image_url": `${API_BASE_URL}/images/cards/videolezNoAudio.jpg`, "misfortune_index": 44.5 },
  { "id": 19, "name": "La gente parla in aula studio e non riesci a concentrarti", "image_url": `${API_BASE_URL}/images/cards/aulaStudio.jpg`, "misfortune_index": 46.0 },
  { "id": 20, "name": "Fai tutta la fila in segreteria… per scoprire che dovevi prenotare", "image_url": `${API_BASE_URL}/images/cards/filaSegreteria.jpg`, "misfortune_index": 48.0 },
  { "id": 21, "name": "Consumi tutto lo stack a causa di una ricorsione infinita", "image_url": `${API_BASE_URL}/images/cards/stackOverflow.jpg`, "misfortune_index": 49.0 },
  { "id": 22, "name": "Perdi ore a cercare un bug… era un == al posto di ===", "image_url": `${API_BASE_URL}/images/cards/jsUguale.jpg`, "misfortune_index": 50.0 },
  { "id": 23, "name": "Entra un piccione in aula e ti piomba addosso", "image_url": `${API_BASE_URL}/images/cards/piccione.jpg`, "misfortune_index": 55.5 },
  { "id": 24, "name": "Hai scelto un corso a scelta che non ti soddisfa", "image_url": `${API_BASE_URL}/images/cards/corsoNoioso.jpg`, "misfortune_index": 58.0 },
  { "id": 25, "name": "La tua borraccia perde nello zaino e allaga i tuoi appunti", "image_url": `${API_BASE_URL}/images/cards/bottigliaAllaga.jpg`, "misfortune_index": 62.5 },
  { "id": 26, "name": "Il tuo coinquilino ospita ospiti rumorosi la notte prima di un appello", "image_url": `${API_BASE_URL}/images/cards/partyCoinquilino.jpg`, "misfortune_index": 65.0 },
  { "id": 27, "name": "Perdi un quaderno pieno di appunti importanti", "image_url": `${API_BASE_URL}/images/cards/quadernoPerso.jpg`, "misfortune_index": 68.0 },
  { "id": 28, "name": "Il software che ti serve per un progetto non è compatibile con il tuo sistema operativo", "image_url": `${API_BASE_URL}/images/cards/linux.jpg`, "misfortune_index": 72.0 },
  { "id": 29, "name": "Dimentichi la calcolatrice a casa il giorno dell'esame", "image_url": `${API_BASE_URL}/images/cards/calcolatrice.jpg`, "misfortune_index": 75.0 },
  { "id": 30, "name": "Ti ritrovi a dover lavorare da solo in un progetto di gruppo", "image_url": `${API_BASE_URL}/images/cards/gruppoSolo.jpg`, "misfortune_index": 78.5 },
  { "id": 31, "name": "Lockdown browser non ti funziona il giorno dell'esame", "image_url": `${API_BASE_URL}/images/cards/lockdown.png`, "misfortune_index": 79.0 },
  { "id": 32, "name": "Hai dimenticato l'abbonamento a casa e la GTT ti fa una multa", "image_url": `${API_BASE_URL}/images/cards/multaGtt.jpg`, "misfortune_index": 80.0 },
  { "id": 33, "name": "Piove, dimentichi l'ombrello, e il tuo laptop è nello zaino", "image_url": `${API_BASE_URL}/images/cards/pioveLaptop.jpg`, "misfortune_index": 82.0 },
  { "id": 34, "name": "Crownlabs non funziona e l'esame di programmazione sarà su carta", "image_url": `${API_BASE_URL}/images/cards/crownlabs.jpg`, "misfortune_index": 84.0 },
  { "id": 35, "name": "Ti cade il caffè sulla tastiera del laptop", "image_url": `${API_BASE_URL}/images/cards/caffeCade.jpg`, "misfortune_index": 85.0 },
  { "id": 36, "name": "Dimentichi i documenti di identità a casa il giorno dell'esame", "image_url": `${API_BASE_URL}/images/cards/smartcardDimenticata.jpg`, "misfortune_index": 86.0 },
  { "id": 37, "name": "Hai la febbre il giorno dell'esame", "image_url": `${API_BASE_URL}/images/cards/febbreEsame.jpg`, "misfortune_index": 87.0 },
  { "id": 38, "name": "Dimentichi di pagare le tasse universitarie", "image_url": `${API_BASE_URL}/images/cards/tasse.jpg`, "misfortune_index": 89.0 },
  { "id": 39, "name": "Scopri tardi che avresti dovuto usare Rust invece di C++ per evitare 42 memory leak", "image_url": `${API_BASE_URL}/images/cards/rust.jpg`, "misfortune_index": 90.0 },
  { "id": 40, "name": "Perdi le chiavi della stanza in residenza", "image_url": `${API_BASE_URL}/images/cards/chiavi.jpg`, "misfortune_index": 91.0 },
  { "id": 41, "name": "Vieni bocciato all'esame", "image_url": `${API_BASE_URL}/images/cards/bocciatoEsame.jpg`, "misfortune_index": 92.0 },
  { "id": 42, "name": "Ti dimentichi di prenotarti all'esame", "image_url": `${API_BASE_URL}/images/cards/prenotEsame.png`, "misfortune_index": 93.0 },
  { "id": 43, "name": "Volevi andare in Erasmus ma scopri che il bando è scaduto", "image_url": `${API_BASE_URL}/images/cards/ripErasmus.jpg`, "misfortune_index": 94.0 },
  { "id": 44, "name": "Dopo lezione scopri che la tua bici è stata rubata", "image_url": `${API_BASE_URL}/images/cards/biciRubata.jpg`, "misfortune_index": 95.0 },
  { "id": 45, "name": "Ti crasha il PC a 2 minuti dalla consegna del progetto", "image_url": `${API_BASE_URL}/images/cards/crashPc2min.jpg`, "misfortune_index": 96.0 },
  { "id": 46, "name": "Il professore che ti segue la tesi non risponde da mesi", "image_url": `${API_BASE_URL}/images/cards/profTesi.jpg`, "misfortune_index": 97.0 },
  { "id": 47, "name": "La batteria del laptop muore a metà esame e sei senza caricatore", "image_url": `${API_BASE_URL}/images/cards/batteriaEsame.jpg`, "misfortune_index": 98.0 },
  { "id": 48, "name": "Scopri il giorno dell'esame che il progetto funzionava solo sul tuo pc", "image_url": `${API_BASE_URL}/images/cards/progettoMioPc.png`, "misfortune_index": 98.5 },
  { "id": 49, "name": "Il professore perde il tuo esame", "image_url": `${API_BASE_URL}/images/cards/profPerdeEsame.jpg`, "misfortune_index": 99.5 },
  { "id": 50, "name": "Qualcuno ti ruba la password e ti fa rinuncia agli studi", "image_url": `${API_BASE_URL}/images/cards/rinunciaStudi.jpg`, "misfortune_index": 100.0 }
];


const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("Errore fatale durante la connessione al DB:", err.message);
    throw err;
  }
  console.log(`Connesso al database SQLite '${DBSOURCE}'.`);

  db.serialize(async () => {
    console.log('Creazione/verifica tabelle e seeding dati...');

    // Tabella Utenti
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        salt TEXT NOT NULL
      )`, (tableErr) => {
        if (tableErr) { console.error("Errore creazione tabella users:", tableErr.message); reject(tableErr); }
        else { console.log("Tabella 'users' creata/verificata."); resolve(); }
      });
    });

const userInsertStmt = db.prepare(`INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)`);
for (const user of initialUsers) {
  try {
    const salt = randomBytes(16).toString('hex'); // 1. Genera un sale casuale
    // 2. Crea l'hash usando la password, il sale e una lunghezza di 64 byte
    const hashedPassword = (await scryptAsync(user.password, salt, 64)).toString('hex');
    
    await new Promise((resolve, reject) => {
      // 3. Salva username, hash E il sale nel database
      userInsertStmt.run(user.username, hashedPassword, salt, function(insertErr) {
        if (insertErr) { 
          console.error(`Errore inserimento utente ${user.username}:`, insertErr.message);
          reject(insertErr);
        } else {
          if (this.changes > 0) console.log(`Utente '${user.username}' inserito.`);
          else console.log(`Utente '${user.username}' già esistente.`);
          resolve();
        }
      });
    });
  } catch (processingError) { 
    console.error(`Errore processamento utente ${user.username}:`, processingError); 
  }
}
await new Promise(resolve => userInsertStmt.finalize(resolve));

    // Tabella Carte
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        image_url TEXT NOT NULL,
        misfortune_index REAL NOT NULL UNIQUE
      )`, (tableErr) => {
        if (tableErr) { console.error("Errore creazione tabella cards:", tableErr.message); reject(tableErr); }
        else { console.log("Tabella 'cards' creata/verificata."); resolve(); }
      });
    });

     // Tabella Partite
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_date DATETIME,
        status TEXT NOT NULL,
        final_card_count INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) { console.error("Errore creazione tabella games:", err); reject(err); }
        else { console.log("Tabella 'games' creata/verificata."); resolve(); }
      });
    });

    // Tabella Round di Gioco
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS game_rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        round_number INTEGER NOT NULL,
        card_id INTEGER NOT NULL,
        result TEXT NOT NULL,
        FOREIGN KEY (game_id) REFERENCES games(id),
        FOREIGN KEY (card_id) REFERENCES cards(id)
      )`, (err) => {
        if (err) { console.error("Errore creazione tabella game_rounds:", err); reject(err); }
        else { console.log("Tabella 'game_rounds' creata/verificata."); resolve(); }
      });
    });

    // <-- MODIFICA QUI: Aggiunta creazione tabella game_initial_cards -->
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS game_initial_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        card_id INTEGER NOT NULL,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (card_id) REFERENCES cards(id)
      )`, (err) => {
        if (err) { console.error("Errore creazione tabella game_initial_cards:", err); reject(err); }
        else { console.log("Tabella 'game_initial_cards' creata/verificata."); resolve(); }
      });
    });
    // <-- FINE MODIFICA -->

    const cardInsertStmt = db.prepare(`INSERT OR IGNORE INTO cards (name, image_url, misfortune_index) VALUES (?, ?, ?)`);
    for (const card of initialCardsData) {
      await new Promise((resolve, reject) => {
        // Non c'è bisogno di usare card.id qui perché l'ID è AUTOINCREMENT
        cardInsertStmt.run(card.name, card.image_url, card.misfortune_index, function(insertErr) {
          if (insertErr) { console.error(`Errore inserimento carta ${card.name}:`, insertErr.message); reject(insertErr); }
          else {
            if (this.changes > 0) console.log(`Carta '${card.name}' inserita.`);
            else console.log(`Carta '${card.name}' già esistente.`);
            resolve();
          }
        });
      });
    }
    await new Promise(resolve => cardInsertStmt.finalize(resolve)); // Attendi finalizzazione

    // Qui dovresti creare anche le tabelle games e game_log se non l'hai già fatto
    // ... (codice per CREATE TABLE games e game_log omesso per brevità, ma andrebbe qui) ...

    console.log("Operazioni su DB di inizializzazione completate.");
    db.close((closeErr) => {
      if (closeErr) console.error("Errore chiusura DB:", closeErr.message);
      else console.log('Connessione al database chiusa.');
    });
  });
});