import sqlite3 from 'sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs'

export interface Plant {
  plant_id?: number;
  name: string;
}

export class Database {
  private db: sqlite3.Database;
  private isClosing: boolean = false;
  private schemaVersion: number = 1; //for future migrations

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'nrc_exam_questions_database.db');
    // console.log('Database location:', dbPath);
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Connected to SQLite database');
        this.init();
      }
    });

    // Handle unexpected errors
    this.db.on('error', (err) => {
      console.error('Database error occurred:', err);
    });
  }

  private init() {
    this.db.run('PRAGMA foreign_keys = ON');
    this.db.serialize(() => {
      this.db.run('BEGIN TRANSACTION');

      // load schema from external file
      try {
        const schemaPath = path.join(app.getAppPath(), 'db/schema.sql');

        if (fs.existsSync(schemaPath)) {
          const schema = fs.readFileSync(schemaPath, 'utf8');

          const statements = schema.split(';').filter(stmt => stmt.trim() != '');

          statements.forEach(statement => {
            this.db.run(statement, (err) => {
              if (err) console.error('Scehma statement error:', statement, err);
            });
          });
          console.log('Schema initialized form file');
        } else {
          console.error('Schema file not found at:', schemaPath);
          throw new Error('Database schema file missing');
        }

        this.db.run(`
          CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        this.db.run(`
          INSERT OR IGNORE INTO schema_version (version) VALUES (?)`,
          [this.schemaVersion]);

        this.db.run('COMMIT');
        console.log('Database initialization completed successfully');


      } catch (error) {
        this.db.run("ROLLBACK");
        console.log('Database initialization failed', error);
      }

    })
  }

  async addPlant(plant: Plant): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.run(
        'INSERT INTO plants (name) VALUES (?)',
        [plant.name],
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

  async getPlants(): Promise<Plant[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.all('SELECT * FROM plants', [], (err, rows: Plant[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getPlant(plantId: number): Promise<Plant> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error("Database is closing"));
        return;
      }
      this.db.get("SELECT * FROM plants WHERE plant_id = ?", [plantId], (err, row: Plant) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('Plant not found'));
        } else {
          resolve(row);
        }
      });
    });
  }

  async updatePlant(plant: Plant): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error("Database is closing"));
        return;
      }

      if (plant.plant_id) {
        reject(new Error('Plant ID is required for update'));
        return;
      }

      this.db.run(
        'UPDATE plants SET name =? WHERE plant_id = ?',
        [plant.name, plant.plant_id],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Plant not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deletePlant(plantId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error("Database is closing"));
        return;
      }

      this.db.run(
        'DELETE FROM plants WHERE plant_id = ?',
        [plantId],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Plant not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Check if database is still connected
  isConnected(): boolean {
    try {
      // Test query to verify connection
      this.db.get('SELECT 1', (err) => {
        if (err) return false;
      });
      return !this.isClosing;
    } catch (err) {
      return false;
    }
  }

  close(): void {
    if (this.isClosing) return; // Prevent double-closing

    this.isClosing = true;
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database closed');
      }
    });
  }
}