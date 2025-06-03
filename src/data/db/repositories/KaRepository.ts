// db/repositories/KaRepository.ts
import sqlite3 from 'sqlite3';

export class KaRepository {
  constructor(private db: sqlite3.Database, private isClosing: () => boolean) { }

  async add(ka: Ka): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.run(
        'INSERT INTO kas (ka_number, ka_description) VALUES (?, ?)',
        [ka.ka_number, ka.ka_description],
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

  async getMany(params: DBSearchParams): Promise<Ka[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      // Build WHERE clause dynamically
      const keys = Object.keys(params || {});
      const values = Object.values(params || {});

      let sql = 'SELECT * FROM kas';
      if (keys.length > 0) {
        const conditions = keys.map(key => `${key} = ?`).join(' AND ');
        sql += ` WHERE ${conditions}`;
      }

      this.db.all(sql, values, (err, rows: Ka[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async get(params: DBSearchParams): Promise<Ka> {
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
      const sql = `SELECT * FROM kas WHERE ${conditions}`;

      this.db.get(sql, values, (err, row: Ka) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('Ka not found'));
        } else {
          resolve(row);
        }
      });
    });
  }

  async update(ka: Ka): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      if (!ka.ka_number) {
        reject(new Error('Ka Number is required for update'));
        return;
      }
      if (!ka.ka_description) {
        reject(new Error('Ka description is required for update'));
        return;
      }

      this.db.run(
        'UPDATE kas SET description = ? WHERE ka_number = ?',
        [ka.ka_description, ka.ka_number],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Ka not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async delete(kaNumber: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      this.db.run(
        'DELETE FROM kas WHERE ka_number = ?',
        [kaNumber],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Ka not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getByQuestionId(questionId: number): Promise<Ka[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
      SELECT k.ka_number, k.ka_description
      FROM kas k
      INNER JOIN question_kas qk ON k.ka_number = qk.ka_number
      WHERE qk.question_id = ?
      ORDER BY k.ka_number
    `;

      this.db.all(query, [questionId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const kas = rows.map(row => ({
            ka_number: row.ka_number,
            ka_description: row.ka_description,
          }));
          resolve(kas);
        }
      });
    });
  }
}