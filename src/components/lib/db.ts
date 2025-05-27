// db/db.ts
import sqlite3 from 'sqlite3';
import { app } from 'electron';
import path from 'path';
import { schema } from './schema';

export class Database {
  private db: sqlite3.Database;
  private isClosing: boolean = false;
  
  // Define what changed in each version
  private static readonly MIGRATIONS = {
    1: {
      description: 'Initial schema creation',
      up: (db: sqlite3.Database) => {
        // Create all tables from schema
        Object.entries(schema).forEach(([tableName, { columns }]) => {
          const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')})`;
          db.run(sql);
        });
      }
    },
    2: {
      description: 'Add option column to answers table',
      up: (db: sqlite3.Database) => {
        // Add the option column that you added to your schema
        db.run('ALTER TABLE answers ADD COLUMN option TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            throw err;
          }
        });
      }
    },
  } as const;
  
  // Current version is the highest migration number
  private readonly currentSchemaVersion = Math.max(...Object.keys(Database.MIGRATIONS).map(Number));
  
  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'nrc_exam_questions_database.db');
    console.log('Database location:', dbPath);
    console.log('Target schema version:', this.currentSchemaVersion);
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Connected to SQLite database');
        this.init();
      }
    });

    this.db.on('error', (err) => {
      console.error('Database error occurred:', err);
    });
  }

  private async getCurrentSchemaVersion(): Promise<number> {
    return new Promise((resolve) => {
      this.db.get(
        'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1',
        (err, row: any) => {
          if (err) {
            resolve(0); // Fresh database
          } else {
            resolve(row ? row.version : 0);
          }
        }
      );
    });
  }

  private async runMigrations(fromVersion: number, toVersion: number) {
    console.log(`🔄 Running migrations from v${fromVersion} to v${toVersion}`);
    
    for (let version = fromVersion + 1; version <= toVersion; version++) {
      const migration = Database.MIGRATIONS[version as keyof typeof Database.MIGRATIONS];
      if (migration) {
        console.log(`📝 Applying migration v${version}: ${migration.description}`);
        await this.runMigration(version, migration);
        console.log(`✅ Migration v${version} completed`);
      }
    }
  }

  private async runMigration(version: number, migration: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        try {
          // Run the migration
          migration.up(this.db);
          
          // Record the migration
          this.db.run(
            'INSERT OR REPLACE INTO schema_version (version) VALUES (?)', 
            [version]
          );
          
          this.db.run('COMMIT', (err) => {
            if (err) reject(err);
            else resolve();
          });
          
        } catch (error) {
          this.db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }

  private async init() {
    this.db.run('PRAGMA foreign_keys = ON');
    
    try {
      const currentVersion = await this.getCurrentSchemaVersion();
      console.log(`📊 Current schema version: ${currentVersion}`);
      
      if (currentVersion < this.currentSchemaVersion) {
        await this.runMigrations(currentVersion, this.currentSchemaVersion);
        console.log('🎉 Database migrations completed successfully');
      } else {
        console.log('✨ Database schema is up to date');
      }
    } catch (error) {
      console.error("❌ Database initialization failed: ", error);
    }
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

  async getPlantsWithExams(): Promise<Plant[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
      SELECT
        p.*,
        e.exam_id,
        e.name as exam_name,
        e.plant_id as exam_plant_id
      FROM plants p
      LEFT JOIN exams e ON p.plant_id = e.plant_id
      ORDER BY p.plant_id, e.exam_id
        `;

      this.db.all(query, [], (err, rows: any) => {
        if (err) {
          reject(err);
        } else {
          const plantsMap = new Map<number, Plant>();

          rows.forEach((row: any) => {
            const plantId = row.plant_id;

            //add plant to map if not already added
            if (!plantsMap.has(plantId)) {
              plantsMap.set(plantId, {
                plant_id: plantId,
                name: row.name,
                exams: []
              });
            }

            const plant = plantsMap.get(plantId)!;

            // Add exam if it exists (LEFT JOIN might have null exam data)
            if (row.exam_id) {
              plant.exams!.push({
                exam_id: row.exam_id,
                name: row.exam_name,
                plant_id: row.exam_plant_id
              });
            }
          });

          // Convert map to array
          const plants = Array.from(plantsMap.values());
          resolve(plants);
        }
      });

    })
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

  async getPlantWithExams(plantId: number): Promise<Plant> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
      SELECT
        p.*,
        e.exam_id,
        e.name as exam_name,
        e.plant_id as exam_plant_id
      FROM plants p
      LEFT JOIN exams e ON p.plant_id = e.plant_id
      WHERE p.plant_id = ?
        `;

      this.db.all(query, [plantId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {

          const row: any = rows[0]
          const plant: Plant = {
            plant_id: row.plant_id,
            name: row.name,
            exams: rows
              .filter(row => row.exam_id) // Only include rows with actual exams
              .map(row => ({
                exam_id: row.exam_id,
                name: row.exam_name,
                plant_id: row.exam_plant_id
              }))
          }

          resolve(plant);
        }
      })
    });
  }

  async updatePlant(plant: Plant): Promise<Plant> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error("Database is closing"));
        return;
      }

      if (!plant.plant_id) {
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
            resolve(plant);
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

  // exams

  async addExam(exam: Exam): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.run(
        'INSERT INTO exams (name, plant_id) VALUES (?, ?)',
        [exam.name, exam.plant_id],
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

  async getExams(): Promise<Exam[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      // SQL query to join exams with plants
      const query = `
      SELECT 
        e.*,
        p.plant_id AS plant_plant_id,
        p.name AS plant_name
      FROM exams e
      LEFT JOIN plants p ON e.plant_id = p.plant_id
    `;

      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Transform the flat rows into nested objects
          const exams = rows.map((row: any) => {
            // Extract exam fields
            const exam: any = {
              exam_id: row.exam_id,
              name: row.name,
              // Add other exam fields
              plant_id: row.plant_id,
              // Create nested plant object
              plant: row.plant_plant_id ? {
                plant_id: row.plant_plant_id,
                name: row.plant_name,
                // Add other plant fields
              } : undefined
            };
            return exam;
          });

          resolve(exams);
        }
      });
    });
  }

  async getExam(examId: number): Promise<Exam> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      // SQL query to join exams with plants
      const query = `
      SELECT 
        e.*,
        p.plant_id AS plant_plant_id,
        p.name AS plant_name
      FROM exams e
      LEFT JOIN plants p ON e.plant_id = p.plant_id
      WHERE exam_id = ?
    `;

      this.db.all(query, [examId], (err, rows) => {
        if (err) {
          reject(err);
        } else if (!rows || rows.length === 0) {
          reject(new Error('Exam not found'));
        } else {
          // Extract the first row as the exam
          const row: any = rows[0];
          const exam: any = {
            exam_id: row.exam_id,
            name: row.name,
            // Add other exam fields
            plant_id: row.plant_id,
            // Create nested plant object
            plant: row.plant_plant_id ? {
              plant_id: row.plant_plant_id,
              name: row.plant_name,
              // Add other plant fields
            } : null
          };
          resolve(exam);
        }
      });
    });
  }

  async updateExam(exam: Exam): Promise<Exam> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error("Database is closing"));
        return;
      }

      if (!exam.exam_id) {
        reject(new Error('Exam ID is required for update'));
        return;
      }
      if (!exam.plant_id) {
        reject(new Error('Plant ID is required for update'));
        return;
      }

      this.db.run(
        'UPDATE exams SET (name, plant_id) = (?, ?) WHERE exam_id = ?',
        [exam.name, exam.plant_id, exam.exam_id],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Exam not found'));
          } else {
            resolve(exam);
          }
        }
      );
    });
  }

  async deleteExam(examId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error("Database is closing"));
        return;
      }

      this.db.run(
        'DELETE FROM exams WHERE exam_id = ?',
        [examId],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Exam not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }


  // questions
  async addQuestion(question: Question): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.run(
        'INSERT INTO questions (question_text, category, exam_level, technical_references, difficulty_level, cognitive_level, objective, last_used) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [question.question_text, question.category, question.exam_level, question.technical_references, question.difficulty_level, question.cognitive_level, question.objective, question.last_used],
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

  async getQuestions(): Promise<Question[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.all('SELECT * FROM questions', [], (err, rows: Question[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  async getQuestion(questionId: number): Promise<Question> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.get('SELECT * FROM questions WHERE question_id = ?', [questionId], (err, row: Question) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error("Question not found"))
        } else {
          resolve(row);
        }
      });
    });
  }



  async getQuestionAll(questionId: number): Promise<Question> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
      SELECT
        q.*,
        a.answer_id,
        a.answer_text,
        a.question_id AS answer_question_id,
        a.is_correct,
        a.option,
        a.justification,
        e.exam_id,
        e.name AS exam_name,
        e.plant_id AS exam_plant_id
      FROM questions q
      LEFT JOIN answers a ON q.question_id = a.question_id
      LEFT JOIN exam_questions eq ON q.question_id = eq.question_id
      LEFT JOIN exams e ON eq.exam_id = e.exam_id
      WHERE q.question_id = ?
        `;

      this.db.all(query, [questionId], (err, rows: QuestionAll[]) => {
        console.log(JSON.stringify(rows));
        if (err) {
          reject(err);
        } else {

          const row: any = rows[0]
          const question: Question = {
            question_id: row.quesiton_id,
            question_text: row.question_text,
            category: row.category,
            exam_level: row.exam_level,
            technical_references: row.technical_references,
            difficulty_level: row.difficulty_level,
            cognitive_level: row.cognitive_level,
            objective: row.objective,
            last_used: row.last_used,
            answers: rows
              .filter(row => row.answer_id) // Only include rows with actual answers
              .map(row => ({
                answer_id: row.answer_id,
                question_id: row.answer_question_id,
                answer_text: row.answer_text,
                is_correct: row.is_correct,
                option: row.option,
                justification: row.justification
              })) as [Answer, Answer, Answer, Answer],
            exams: rows
              .filter(row => row.exam_id) // Only include rows with actual exams
              .map(row => ({
                exam_id: row.exam_id!,
                name: row.exam_name!,
                plant_id: row.exam_plant_id!,
              }))
          }

          resolve(question);
        }
      })
    });

  }



  async updateQuestion(question: Question): Promise<Question> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error("Database is closing"));
        return;
      }

      if (!question.question_id) {
        reject(new Error('Question ID is required for update'));
        return;
      }

      this.db.run(
        'UPDATE questions SET (question_text) = (?) WHERE question_id = ?',
        [question.question_text, question.question_id],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Question not found'));
          } else {
            resolve(question);
          }
        }
      );
    });
  }

  async deleteQuestion(questionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing) {
        reject(new Error("Database is closing"));
        return;
      }

      this.db.run(
        'DELETE FROM questions WHERE question_id = ?',
        [questionId],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Question not found'));
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