// db/index.ts
import sqlite3 from 'sqlite3';
import { schema } from './schema';
import { PlantRepository } from './repositories/PlantRepository';
import { ExamRepository } from './repositories/ExamRepository';
import { QuestionRepository } from './repositories/QuestionRepository';
import { QuestionService } from './services/QuestionService';
import { SystemRepository } from './repositories/SystemRepository';

export class Database {
    private db: sqlite3.Database;
    private isClosing: boolean = false;

    // Repository instances
    public plants: PlantRepository;
    public exams: ExamRepository;
    public questions: QuestionRepository;
    public systems: SystemRepository;

    public questionService: QuestionService;

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

        3: {
            description: 'Add question_systems table to database',
            up: (db: sqlite3.Database) => {
                const sql = `
            CREATE TABLE IF NOT EXISTS question_systems (
                question_id INTEGER NOT NULL,
                system_number TEXT NOT NULL,
                PRIMARY KEY (question_id, system_number),
                FOREIGN KEY (system_number) REFERENCES systems(number) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
            )
        `;
                db.run(sql, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        throw err;
                    }
                });
            }
        }
    } as const;

    // Current version is the highest migration number
    private readonly currentSchemaVersion = Math.max(...Object.keys(Database.MIGRATIONS).map(Number));

    constructor() {
        // const dbPath = path.join(app.getPath('userData'), 'nrc_exam_questions_database.db');
        const dbPath = '/Users/noah/Desktop/Projects/Davis_Besse_2025/nrc-exam-manager/src/data/nrc_exam_questions_database.db';
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

        // Initialize repositories
        this.plants = new PlantRepository(this.db, () => this.isClosing);
        this.exams = new ExamRepository(this.db, () => this.isClosing);
        this.questions = new QuestionRepository(this.db, () => this.isClosing);
        this.systems = new SystemRepository(this.db, () => this.isClosing);

        this.questionService = new QuestionService(this.questions, this.exams);
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
