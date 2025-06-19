import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./gioco_sfortuna.db', (err) => {
  if (err) {
    // console.error("Errore connessione DB in dao-games:", err.message);
    throw err;
  }
});


export function saveGame(userId, status, finalCardCount, rounds, initialCardIds) { 
  return new Promise((resolve, reject) => {
    const gameSql = `INSERT INTO games (user_id, status, final_card_count, end_date) VALUES (?, ?, ?, datetime('now'))`;
    db.run(gameSql, [userId, status, finalCardCount], function(err) {
      if (err) return reject(err);

      const gameId = this.lastID;
      const roundSql = `INSERT INTO game_rounds (game_id, round_number, card_id, result) VALUES (?, ?, ?, ?)`;
      const initialCardsSql = `INSERT INTO game_initial_cards (game_id, card_id) VALUES (?, ?)`; 

      db.serialize(() => {
        db.exec('BEGIN TRANSACTION');
        
        const roundStmt = db.prepare(roundSql);
        for (const round of rounds) {
          roundStmt.run(gameId, round.round_number, round.card_id, round.result);
        }
        roundStmt.finalize();

        const initialStmt = db.prepare(initialCardsSql);
        for (const cardId of initialCardIds) {
          initialStmt.run(gameId, cardId);
        }
        initialStmt.finalize();
        
        // rollback per evitare dati parziali o corrotti nel db
        db.exec('COMMIT', (err) => {
            if (err) {
              db.exec('ROLLBACK');
              return reject(err);
            }
            resolve(gameId); 
        });
      });
    });
  });
}

export function getGameHistoryByUserId(userId) { 
  return new Promise((resolve, reject) => {
    const gamesSql = `SELECT * FROM games WHERE user_id = ? ORDER BY end_date DESC`;
    db.all(gamesSql, [userId], (err, games) => {
      if (err) return reject(err);
      if (games.length === 0) return resolve([]);

      const gameIds = games.map(g => g.id);
      const placeholders = gameIds.map(() => '?').join(',');

      const roundsSql = `
        SELECT gr.*, c.name as card_name, c.image_url as card_image_url
        FROM game_rounds gr
        JOIN cards c ON gr.card_id = c.id
        WHERE gr.game_id IN (${placeholders})
        ORDER BY gr.game_id, gr.round_number
      `;

      const initialCardsSql = `
        SELECT gic.game_id, c.name as card_name, c.id as card_id
        FROM game_initial_cards gic JOIN cards c ON gic.card_id = c.id
        WHERE gic.game_id IN (${placeholders})
      `;

      Promise.all([
        // Esegue le query per rounds e initialCards in parallelo
        new Promise((res, rej) => db.all(roundsSql, gameIds, (e, r) => e ? rej(e) : res(r))),
        new Promise((res, rej) => db.all(initialCardsSql, gameIds, (e, r) => e ? rej(e) : res(r)))
      ]).then(([rounds, initialCards]) => {
        const history = games.map(game => ({
          ...game,
          rounds: rounds.filter(round => round.game_id === game.id),
          initialCards: initialCards.filter(card => card.game_id === game.id)
        }));
        
        resolve(history);
      }).catch(reject);
    });
  });
}