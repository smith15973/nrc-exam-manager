// db/repositories/StemRepository.ts
import sqlite3 from 'sqlite3';

export class StemRepository {
  constructor(private db: sqlite3.Database, private isClosing: () => boolean) { }

  async add(stem: Stem): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.run(
        'INSERT INTO stems (stem_id, stem_statement) VALUES (?, ?)',
        [stem.stem_id, stem.stem_statement],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getMany(params?: DBSearchParams): Promise<Stem[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      // Build WHERE clause dynamically
      const keys = Object.keys(params || {});
      const values = Object.values(params || {});

      let sql = 'SELECT * FROM stems';
      if (keys.length > 0) {
        const conditions = keys.map(key => `${key} = ?`).join(' AND ');
        sql += ` WHERE ${conditions}`;
      }

      this.db.all(sql, values, (err, rows: Stem[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async get(params: DBSearchParams): Promise<Stem> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      const keys = Object.keys(params || {});
      const values = Object.values(params || {});

      if (keys.length === 0) {
        reject(new Error("No search parameters provided"));
        return;
      }

      const conditions = keys.map(key => `${key} = ?`).join(' AND ');
      const sql = `SELECT * FROM stems WHERE ${conditions}`;

      this.db.get(sql, values, (err, row: Stem) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('Stem not found'));
        } else {
          resolve(row);
        }
      });
    });
  }

  async update(stem: Stem): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      if (!stem.stem_id) {
        reject(new Error('Stem Number is required for update'));
        return;
      }
      if (!stem.stem_statement) {
        reject(new Error('Stem Name is required for update'));
        return;
      }

      this.db.run(
        'UPDATE stems SET stem_statement = ? WHERE stem_id = ?',
        [stem.stem_statement, stem.stem_id],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Stem not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async delete(stemNum: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      this.db.run(
        'DELETE FROM stems WHERE stem_id = ?',
        [stemNum],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Stem not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getByQuestionId(questionId: number): Promise<Stem[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
      SELECT s.stem_id, s.stem_statement
      FROM stems s
      INNER JOIN question_stems qs ON s.stem_id = qs.stem_id
      WHERE qs.question_id = ?
      ORDER BY s.stem_id
    `;

      this.db.all(query, [questionId], (err, rows: Stem[]) => {
        if (err) {
          reject(err);
        } else {
          const stems: Stem[] = rows.map(row => ({
            stem_id: row.stem_id,
            stem_statement: row.stem_statement,
          }));
          resolve(stems);
        }
      });
    });
  }
}