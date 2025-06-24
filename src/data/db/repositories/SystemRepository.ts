// db/repositories/SystemRepository.ts
import sqlite3 from 'sqlite3';

export class SystemRepository {
  constructor(private db: sqlite3.Database, private isClosing: () => boolean) { }

  async add(system: System): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.run(
        'INSERT INTO systems (number, name) VALUES (?, ?)',
        [system.system_number, system.system_name],
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

  async getMany(params?: DBSearchParams): Promise<System[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      // Build WHERE clause dynamically
      const keys = Object.keys(params || {});
      const values = Object.values(params || {});

      let sql = 'SELECT * FROM systems';
      if (keys.length > 0) {
        const conditions = keys.map(key => `${key} = ?`).join(' AND ');
        sql += ` WHERE ${conditions}`;
      }

      this.db.all(sql, values, (err, rows: System[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async get(params: DBSearchParams): Promise<System> {
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
      const sql = `SELECT * FROM systems WHERE ${conditions}`;

      this.db.get(sql, values, (err, row: System) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('System not found'));
        } else {
          resolve(row);
        }
      });
    });
  }

  async update(system: System): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      if (!system.system_number) {
        reject(new Error('System Number is required for update'));
        return;
      }
      if (!system.system_name) {
        reject(new Error('System Name is required for update'));
        return;
      }

      this.db.run(
        'UPDATE systems SET name = ? WHERE number = ?',
        [system.system_name, system.system_number],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('System not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async delete(systemNum: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      this.db.run(
        'DELETE FROM systems WHERE num = ?',
        [systemNum],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('System not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getByQuestionId(questionId: number): Promise<System[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
      SELECT s.system_number, s.system_name
      FROM systems s
      INNER JOIN question_systems qs ON s.system_number = qs.system_number
      WHERE qs.question_id = ?
      ORDER BY s.system_number
    `;

      this.db.all(query, [questionId], (err, rows: System[]) => {
        if (err) {
          reject(err);
        } else {
          const systems = rows.map(row => ({
            system_number: row.system_number,
            system_name: row.system_name,
          }));
          resolve(systems);
        }
      });
    });
  }
}