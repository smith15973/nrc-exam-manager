import sqlite3 from 'sqlite3';
import { app } from 'electron';
import path from 'path';

export interface User {
  id?: number;
  name: string;
  email: string;
}

export class Database {
  private db: sqlite3.Database;
  private isClosing: boolean = false;

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'app.db');
    console.log('Database location:', dbPath);
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
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      )
    `);
  }

  async addUser(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }
      
      this.db.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [user.name, user.email],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }
      
      this.db.all('SELECT * FROM users', [], (err, rows: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
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