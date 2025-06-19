import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite3.Database('./gioco_sfortuna.db', (err) => {
  if (err) throw err;
});


export function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Confronta la password in chiaro con l'hash memorizzato
export function checkPassword(user, password) {
  return new Promise((resolve, reject) => {
    const salt = user.salt;
    const storedHash = user.hashed_password;

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        const passwordsMatch = crypto.timingSafeEqual(
          derivedKey, 
          Buffer.from(storedHash, 'hex')
        );
        resolve(passwordsMatch);
      } catch (e) {
        resolve(false);
      }
    });
  });
}

// deserializzazione: recuperare i dati dell'utente loggato ad ogni richiesta
// non restituisce la password, l'utente è loggato, non avrebbe senso
export function getUserById(id) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, username FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}