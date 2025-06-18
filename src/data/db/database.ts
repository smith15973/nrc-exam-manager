// db/index.ts
import sqlite3 from 'sqlite3';
import { schema } from './schema';
import { PlantRepository } from './repositories/PlantRepository';
import { ExamRepository } from './repositories/ExamRepository';
import { QuestionRepository } from './repositories/QuestionRepository';
import { QuestionService } from './services/QuestionService';
import { SystemRepository } from './repositories/SystemRepository';
import { KaRepository } from './repositories/KaRepository';

export class Database {
    private db: sqlite3.Database;
    private isClosing: boolean = false;

    // Repository instances
    public plants: PlantRepository;
    public exams: ExamRepository;
    public questions: QuestionRepository;
    public systems: SystemRepository;
    public kas: KaRepository;

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
        3: {
            description: 'Add Full-Text Search (FTS) tables, view, and triggers',
            up: (db: sqlite3.Database) => {
                const ftsSetupSql = `
                    -- Drop existing FTS table to ensure clean state
                    DROP TABLE IF EXISTS questions_fts;

                    -- 1. Create the FTS virtual table
                    CREATE VIRTUAL TABLE questions_fts USING fts5(
                        question_id UNINDEXED,
                        question_text,
                        objective,
                        last_used,
                        exam_level,
                        difficulty_level,
                        cognitive_level,
                        exam_names,
                        ka_descriptions,
                        ka_numbers,
                        system_names,
                        system_numbers,
                        content=questions_search_view
                    );

                    -- 2. Create the search view
                    CREATE VIEW IF NOT EXISTS questions_search_view AS
                    SELECT 
                        q.question_id AS rowid,
                        q.question_text,
                        q.objective,
                        q.last_used,
                        CAST(q.exam_level AS TEXT) as exam_level,
                        CAST(q.difficulty_level AS TEXT) as difficulty_level,
                        CAST(q.cognitive_level AS TEXT) as cognitive_level,
                        COALESCE(GROUP_CONCAT(DISTINCT e.name), '') as exam_names,
                        COALESCE(GROUP_CONCAT(DISTINCT k.ka_description), '') as ka_descriptions,
                        COALESCE(GROUP_CONCAT(DISTINCT k.ka_number), '') as ka_numbers,
                        COALESCE(GROUP_CONCAT(DISTINCT s.name), '') as system_names,
                        COALESCE(GROUP_CONCAT(DISTINCT s.number), '') as system_numbers
                    FROM questions q
                    LEFT JOIN exam_questions eq ON q.question_id = eq.question_id
                    LEFT JOIN exams e ON eq.exam_id = e.exam_id
                    LEFT JOIN question_kas qk ON q.question_id = qk.question_id
                    LEFT JOIN kas k ON qk.ka_number = k.ka_number
                    LEFT JOIN question_systems qs ON q.question_id = qs.question_id
                    LEFT JOIN systems s ON qs.system_number = s.number
                    GROUP BY q.question_id, q.question_text, q.objective, q.last_used, q.exam_level, q.difficulty_level, q.cognitive_level;

                    -- 3. Populate the FTS table
                    INSERT INTO questions_fts SELECT * FROM questions_search_view;

                    -- 4. Create triggers
                    CREATE TRIGGER IF NOT EXISTS questions_fts_update_questions 
                    AFTER UPDATE ON questions
                    BEGIN
                        DELETE FROM questions_fts WHERE question_id = NEW.question_id;
                        INSERT INTO questions_fts SELECT * FROM questions_search_view WHERE question_id = NEW.question_id;
                    END;

                    CREATE TRIGGER IF NOT EXISTS questions_fts_insert_questions
                    AFTER INSERT ON questions
                    BEGIN
                        INSERT INTO questions_fts SELECT * FROM questions_search_view WHERE question_id = NEW.question_id;
                    END;

                    CREATE TRIGGER IF NOT EXISTS questions_fts_delete_questions
                    AFTER DELETE ON questions
                    BEGIN
                        DELETE FROM questions_fts WHERE question_id = OLD.question_id;
                    END;

                    CREATE TRIGGER IF NOT EXISTS questions_fts_update_exam_questions
                    AFTER INSERT ON exam_questions
                    BEGIN
                        DELETE FROM questions_fts WHERE question_id = NEW.question_id;
                        INSERT INTO questions_fts SELECT * FROM questions_search_view WHERE question_id = NEW.question_id;
                    END;

                    CREATE TRIGGER IF NOT EXISTS questions_fts_delete_exam_questions
                    AFTER DELETE ON exam_questions
                    BEGIN
                        DELETE FROM questions_fts WHERE question_id = OLD.question_id;
                        INSERT INTO questions_fts SELECT * FROM questions_search_view WHERE question_id = OLD.question_id;
                    END;

                    CREATE TRIGGER IF NOT EXISTS questions_fts_update_question_kas
                    AFTER INSERT ON question_kas
                    BEGIN
                        DELETE FROM questions_fts WHERE question_id = NEW.question_id;
                        INSERT INTO questions_fts SELECT * FROM questions_search_view WHERE question_id = NEW.question_id;
                    END;

                    CREATE TRIGGER IF NOT EXISTS questions_fts_delete_question_kas
                    AFTER DELETE ON question_kas
                    BEGIN
                        DELETE FROM questions_fts WHERE question_id = OLD.question_id;
                        INSERT INTO questions_fts SELECT * FROM questions_search_view WHERE question_id = OLD.question_id;
                    END;

                    CREATE TRIGGER IF NOT EXISTS questions_fts_update_question_systems
                    AFTER INSERT ON question_systems
                    BEGIN
                        DELETE FROM questions_fts WHERE question_id = NEW.question_id;
                        INSERT INTO questions_fts SELECT * FROM questions_search_view WHERE question_id = NEW.question_id;
                    END;

                    CREATE TRIGGER IF NOT EXISTS questions_fts_delete_question_systems
                    AFTER DELETE ON question_systems
                    BEGIN
                        DELETE FROM questions_fts WHERE question_id = OLD.question_id;
                        INSERT INTO questions_fts SELECT * FROM questions_search_view WHERE question_id = OLD.question_id;
                    END;
                `;
                db.exec(ftsSetupSql, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
    } as const;

    // Current version is the highest migration number
    private readonly currentSchemaVersion = Math.max(...Object.keys(Database.MIGRATIONS).map(Number));

    constructor(dbPath: string, sb: boolean = false) {
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
        this.kas = new KaRepository(this.db, () => this.isClosing);

        this.questionService = new QuestionService(this.questions, this.exams, this.systems, this.kas);
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
