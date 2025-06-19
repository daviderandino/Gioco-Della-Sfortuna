import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./gioco_sfortuna.db', (err) => {
  if (err) {
    // console.error("Errore connessione DB in dao-cards:", err.message);
    throw err;
  }
});


// ad esempio, il giocatore ha visto le carte con id [10,25,48,7]
// getRandomCardsFromDB(1, [10,25,48,7])
// -> ottengo una carta casuale il cui id non è in [10,25,48,7]
export function getRandomCardsFromDB(count, excludeIds = []) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM cards`;
    const params = [];

    if (excludeIds.length > 0) {
      // Crea una stringa di placeholders (?,?,?) per gli ID da escludere
      // serve per prevenire SQL injection
      // (utente che inserisce una query in un campo di input)
      const placeholders = excludeIds.map(() => '?').join(',');
      sql += ` WHERE id NOT IN (${placeholders})`;
      params.push(...excludeIds);
    }

    sql += ` ORDER BY RANDOM() LIMIT ?`;
    params.push(count);

    db.all(sql, params, (err, rows) => {
      if (err) {
        // console.error("Errore recupero carte casuali:", err);
        reject(err);
      } else {
        if (rows.length < count && excludeIds.length < 50) {
          // console.warn(`Richieste ${count} carte, trovate ${rows.length}. Potrebbero non esserci abbastanza carte uniche disponibili.`);
        }
        resolve(rows);
      }
    });
  });
}

export function getCardsByIds(ids) {
  return new Promise((resolve, reject) => {
    if (!ids || ids.length === 0) {
      return resolve([]);
    }
    const placeholders = ids.map(() => '?').join(',');
    const sql = `SELECT * FROM cards WHERE id IN (${placeholders})`;
    
    db.all(sql, ids, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}