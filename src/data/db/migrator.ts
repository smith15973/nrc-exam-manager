// db/migrator.ts
import sqlite3 from 'sqlite3';
interface Migration {
  version: number;
  description: string;
  up: (db: sqlite3.Database) => Promise<void>;
  down?: (db: sqlite3.Database) => Promise<void>; // Optional rollback
}

export class Migrator {
    private db: sqlite3.Database;

    constructor(db: sqlite3.Database) {
        this.db = db;
    }

    async getCurrentDatabaseVersion(): Promise<number> {
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

    async runMigrations(fromVersion: number, toVersion: number): Promise<void> {
        console.log(`🔄 Running migrations from v${fromVersion} to v${toVersion}`);

        const migrationsToRun = migrations
            .filter(m => m.version > fromVersion && m.version <= toVersion)
            .sort((a, b) => a.version - b.version);

        for (const migration of migrationsToRun) {
            console.log(`📝 Applying migration v${migration.version}: ${migration.description}`);
            await this.runMigration(migration);
            console.log(`✅ Migration v${migration.version} completed`);
        }
    }

    private async runMigration(migration: Migration): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');

                migration.up(this.db)
                    .then(() => {
                        // Record the migration
                        this.db.run(
                            'INSERT OR REPLACE INTO schema_version (version) VALUES (?)',
                            [migration.version],
                            (err) => {
                                if (err) {
                                    this.db.run('ROLLBACK');
                                    reject(err);
                                } else {
                                    this.db.run('COMMIT', (commitErr) => {
                                        if (commitErr) reject(commitErr);
                                        else resolve();
                                    });
                                }
                            }
                        );
                    })
                    .catch((error) => {
                        this.db.run('ROLLBACK');
                        reject(error);
                    });
            });
        });
    }

    async rollback(toVersion: number): Promise<void> {
        const currentVersion = await this.getCurrentDatabaseVersion();

        if (toVersion >= currentVersion) {
            throw new Error('Cannot rollback to a version higher than or equal to current version');
        }

        console.log(`🔄 Rolling back from v${currentVersion} to v${toVersion}`);

        const migrationsToRollback = migrations
            .filter(m => m.version > toVersion && m.version <= currentVersion)
            .sort((a, b) => b.version - a.version); // Reverse order for rollback

        for (const migration of migrationsToRollback) {
            if (migration.down) {
                console.log(`📝 Rolling back migration v${migration.version}: ${migration.description}`);
                await this.runRollback(migration);
                console.log(`✅ Rollback v${migration.version} completed`);
            } else {
                console.warn(`⚠️ No rollback defined for migration v${migration.version}`);
            }
        }
    }

    private async runRollback(migration: Migration): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!migration.down) {
                reject(new Error(`No down migration defined for version ${migration.version}`));
                return;
            }

            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');

                migration.down!(this.db)
                    .then(() => {
                        // Remove the migration record
                        this.db.run(
                            'DELETE FROM schema_version WHERE version = ?',
                            [migration.version],
                            (err) => {
                                if (err) {
                                    this.db.run('ROLLBACK');
                                    reject(err);
                                } else {
                                    this.db.run('COMMIT', (commitErr) => {
                                        if (commitErr) reject(commitErr);
                                        else resolve();
                                    });
                                }
                            }
                        );
                    })
                    .catch((error) => {
                        this.db.run('ROLLBACK');
                        reject(error);
                    });
            });
        });
    }
}

// Helper function to run SQL commands as promises
const runSQL = (db: sqlite3.Database, sql: string, params: any[] = []): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Get the current schema version (highest migration version)
export const getCurrentSchemaVersion = (): number => {
    return Math.max(...migrations.map(m => m.version));
};

export const migrations: Migration[] = [
    {
        version: 1,
        description: 'Create initial schema',
        up: async (db: sqlite3.Database) => {
            // Create plants table
            await runSQL(db, `
                CREATE TABLE plants (
                    plant_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL
                )
            `);

            // Create exams table
            await runSQL(db, `
                CREATE TABLE exams (
                    exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    plant_id INTEGER NOT NULL,
                    FOREIGN KEY (plant_id) REFERENCES plants(plant_id) ON DELETE CASCADE
                )
            `);

            // Create questions table
            await runSQL(db, `
                CREATE TABLE questions (
                    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    question_text TEXT NOT NULL,
                    category TEXT,
                    exam_level TEXT,
                    technical_references TEXT,
                    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
                    cognitive_level TEXT,
                    objective TEXT,
                    last_used TEXT
                )
            `);

            // Create exam_questions junction table
            await runSQL(db, `
                CREATE TABLE exam_questions (
                    exam_id INTEGER NOT NULL,
                    question_id INTEGER NOT NULL,
                    PRIMARY KEY (exam_id, question_id),
                    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
                    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
                )
            `);

            // Create answers table
            await runSQL(db, `
                CREATE TABLE answers (
                    answer_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    question_id INTEGER NOT NULL,
                    answer_text TEXT NOT NULL,
                    is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
                    justification TEXT,
                    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
                )
            `);

            // Create question_ka_numbers table
            await runSQL(db, `
                CREATE TABLE question_ka_numbers (
                    question_id INTEGER NOT NULL,
                    ka_number TEXT NOT NULL,
                    ka_statement TEXT,
                    ka_importance TEXT,
                    PRIMARY KEY (question_id, ka_number),
                    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
                )
            `);

            // Create question_system_numbers table
            await runSQL(db, `
                CREATE TABLE question_system_numbers (
                    question_id INTEGER NOT NULL,
                    system_number TEXT NOT NULL,
                    system_description TEXT,
                    PRIMARY KEY (question_id, system_number),
                    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
                )
            `);

            // Create schema_version table
            await runSQL(db, `
                CREATE TABLE schema_version (
                    version INTEGER PRIMARY KEY,
                    applied_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `);
        },
        down: async (db: sqlite3.Database) => {
            // Drop tables in reverse order to avoid foreign key issues
            const tables = [
                'question_system_numbers',
                'question_ka_numbers',
                'answers',
                'exam_questions',
                'questions',
                'exams',
                'plants',
                'schema_version'
            ];

            for (const table of tables) {
                await runSQL(db, `DROP TABLE IF EXISTS ${table}`);
            }
        }
    },
    {
        version: 2,
        description: 'Add option column to answers table',
        up: async (db: sqlite3.Database) => {
            await runSQL(db, 'ALTER TABLE answers ADD COLUMN option TEXT');
        },
        down: async (db: sqlite3.Database) => {
            // SQLite doesn't support DROP COLUMN, so we'd need to recreate the table
            // For simplicity, we'll leave this empty, but in production you might want to implement this
            console.warn('Rollback for migration 2 not implemented - SQLite limitation');
        }
    },
    // Add future migrations here...
    // {
    //     version: 3,
    //     description: 'Add new feature',
    //     up: async (db: sqlite3.Database) => {
    //         // Your migration code here
    //     }
    // }
];
