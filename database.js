import SQLite from 'react-native-sqlite-storage';

let db = null;

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db = SQLite.openDatabase(
      { name: 'dictionary.db', location: 'default' },
      () => {
        db.transaction(tx => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT, definition TEXT);'
          );

          tx.executeSql('SELECT COUNT(*) as count FROM words', [], (_, result) => {
            const count = result.rows.item(0).count;
            if (count === 0) {
              const data = [
                ['hello', 'A common greeting.'],
                ['help', 'To assist someone.'],
                ['verisimilitude', 'The appearance of being true or real.'],
                ['world', 'The earth, together with all of its countries and peoples.'],
                ['hell', 'A place regarded in various religions as a spiritual realm of evil.']
              ];

              Promise.all(
                data.map(([word, definition]) => {
                  return new Promise((res, rej) => {
                    tx.executeSql(
                      'INSERT INTO words (word, definition) VALUES (?, ?);',
                      [word, definition],
                      () => {
                        console.log(`✅ Inserted: ${word}`);
                        res();
                      },
                      (_, error) => {
                        console.log(`❌ Insert error for ${word}:`, error);
                        rej(error);
                      }
                    );
                  });
                })
              )
                .then(() => resolve())
                .catch(err => reject(err));
            } else {
              resolve();
            }
          });
        });
      },
      error => {
        console.log('❌ Open DB error:', error);
        reject(error);
      }
    );
  });
}

export function getDb() {
  if (!db) throw new Error('DB chưa init!');
  return db;
}
