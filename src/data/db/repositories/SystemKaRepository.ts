// db/repositories/SystemRepository.ts
import sqlite3 from 'sqlite3';

export class SystemKaRepository {
  constructor(private db: sqlite3.Database, private isClosing: () => boolean) { }

  async add(system_ka: SystemKa): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      console.log("systemKA",system_ka)

      this.db.run(
        'INSERT INTO system_kas (system_number, ka_number, ka_statement , ro_importance, sro_importance, cfr_content, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [system_ka.system_number, system_ka.ka_number, system_ka.ka_statement, system_ka.ro_importance, system_ka.sro_importance, system_ka.cfr_content, system_ka.category],
        function (err) {
          if (err) {
            reject(err);
            console.error(err)
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getMany(params?: DBSearchParams): Promise<SystemKa[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      // Build WHERE clause dynamically
      const keys = Object.keys(params || {});
      const values = Object.values(params || {});

      let sql = 'SELECT * FROM system_kas';
      if (keys.length > 0) {
        const conditions = keys.map(key => `${key} = ?`).join(' AND ');
        sql += ` WHERE ${conditions}`;
      }

      this.db.all(sql, values, (err, rows: SystemKa[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async get(params: DBSearchParams): Promise<SystemKa> {
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
      const sql = `SELECT * FROM system_kas WHERE ${conditions}`;

      this.db.get(sql, values, (err, row: SystemKa) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('System_Ka not found'));
        } else {
          resolve(row);
        }
      });
    });
  }

  async update(system_ka: SystemKa): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      if (!system_ka.system_number) {
        reject(new Error('System Number is required for update'));
        return;
      }
      if (!system_ka.ka_number) {
        reject(new Error('KA number is required for update'));
        return;
      }
      if (!system_ka.ka_statement) {
        reject(new Error('KA statement is required for update'));
        return;
      }
      if (!system_ka.ro_importance) {
        reject(new Error('RO importance is required for update'));
        return;
      }
      if (!system_ka.sro_importance) {
        reject(new Error('SRO importance is required for update'));
        return;
      }
      if (!system_ka.cfr_content) {
        reject(new Error('CFR content is required for update'));
        return;
      }

      this.db.run(
        `UPDATE system_kas SET
          ka_statement = ?, 
          ro_importance = ?, 
          sro_importance = ?, 
          cfr_content = ?, 
         WHERE system_number = ? AND ka_number = ?`,
        [system_ka.ka_statement, system_ka.ro_importance, system_ka.sro_importance, system_ka.cfr_content, system_ka.system_number, system_ka.ka_number],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('System_Ka not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async delete(systemKaNum: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      this.db.run(
        'DELETE FROM system_kas WHERE system_ka_number = ?',
        [systemKaNum],
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

  async getByQuestionId(questionId: number): Promise<SystemKa[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
      SELECT sk.*
      FROM system_kas sk
      INNER JOIN question_system_kas qsk ON sk.system_number = qsk.system_number AND sk.ka_number = qsk.ka_number
      WHERE qsk.question_id = ?
    `;

      this.db.all(query, [questionId], (err, rows: SystemKa[]) => {
        if (err) {
          reject(err);
        } else {
          const systemKas: SystemKa[] = rows.map(row => ({
            system_number: row.system_number,
            ka_number: row.ka_number,
            category: row.category,
            system_ka_number: row.system_ka_number,
            ka_statement: row.ka_statement,
            ro_importance: row.ro_importance,
            sro_importance: row.sro_importance,
            cfr_content: row.cfr_content,
          }));
          resolve(systemKas);
        }
      });
    });
  }
}