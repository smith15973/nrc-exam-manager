// db/index.ts
import sqlite3 from 'sqlite3';
import { schema } from './schema';
import { PlantRepository } from './repositories/PlantRepository';
import { ExamRepository } from './repositories/ExamRepository';
import { QuestionRepository } from './repositories/QuestionRepository';
import { QuestionService } from './services/QuestionService';
import { SystemRepository } from './repositories/SystemRepository';
import { KaRepository } from './repositories/KaRepository';
import { SystemKaRepository } from './repositories/SystemKaRepository';
import { StemRepository } from './repositories/StemRepository';
import { ExamQuestionRepository } from './repositories/ExamQuestionRepository';

export class Database {
    private db: sqlite3.Database;
    private isClosing = false;

    // Repository instances
    public plants: PlantRepository;
    public exams: ExamRepository;
    public questions: QuestionRepository;
    public systems: SystemRepository;
    public stems: StemRepository;
    public kas: KaRepository;
    public system_kas: SystemKaRepository;
    public exam_questions: ExamQuestionRepository;

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
            description: 'Add Global Search View',
            up: (db: sqlite3.Database) => {
                const globalSearchViewSetupSQL = `
                -- Create a comprehensive view for global question search
                CREATE VIEW IF NOT EXISTS question_search_view AS
                SELECT 
                    q.question_id,
                    q.question_text,
                    q.answer_a,
                    q.answer_b,
                    q.answer_c,
                    q.answer_d,
                    q.answer_a_justification,
                    q.answer_b_justification,
                    q.answer_c_justification,
                    q.answer_d_justification,
                    q.correct_answer,
                    q.exam_level,
                    q.cognitive_level,
                    q.technical_references,
                    q.references_provided,
                    q.objective,
                    q.img_url,
                    
                    -- Exam information
                    GROUP_CONCAT(DISTINCT e.name) AS exam_names,
                    GROUP_CONCAT(DISTINCT p.name) AS plant_names,
                    GROUP_CONCAT(DISTINCT eq.question_number) AS question_numbers,
                    
                    -- System KA information
                    GROUP_CONCAT(DISTINCT sk.system_ka_number) AS system_ka_numbers,
                    GROUP_CONCAT(DISTINCT sk.ka_statement) AS ka_statements,
                    GROUP_CONCAT(DISTINCT sk.category) AS categories,
                    GROUP_CONCAT(DISTINCT sk.cfr_content) AS cfr_contents,
                    GROUP_CONCAT(DISTINCT s.system_name) AS system_names,
                    
                    -- Stem information
                    GROUP_CONCAT(DISTINCT st.stem_statement) AS stem_statements,
                    
                    -- KA match justifications
                    GROUP_CONCAT(DISTINCT eq.ka_match_justification) AS ka_match_justifications,
                    GROUP_CONCAT(DISTINCT eq.sro_match_justification) AS sro_match_justifications,
                    
                    -- Create a comprehensive searchable text field
                    q.question_text || ' ' ||
                    q.answer_a || ' ' ||
                    q.answer_b || ' ' ||
                    q.answer_c || ' ' ||
                    q.answer_d || ' ' ||
                    COALESCE(q.answer_a_justification, '') || ' ' ||
                    COALESCE(q.answer_b_justification, '') || ' ' ||
                    COALESCE(q.answer_c_justification, '') || ' ' ||
                    COALESCE(q.answer_d_justification, '') || ' ' ||
                    COALESCE(q.technical_references, '') || ' ' ||
                    COALESCE(q.references_provided, '') || ' ' ||
                    COALESCE(q.objective, '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT e.name), '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT p.name), '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT sk.system_ka_number), '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT sk.system_number), '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT sk.ka_number), '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT sk.ka_statement), '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT sk.cfr_content), '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT s.system_name), '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT st.stem_statement), '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT eq.ka_match_justification), '') || ' ' ||
                    COALESCE(GROUP_CONCAT(DISTINCT eq.sro_match_justification), '') AS searchable_text

                FROM questions q
                LEFT JOIN exam_questions eq ON q.question_id = eq.question_id
                LEFT JOIN exams e ON eq.exam_id = e.exam_id
                LEFT JOIN plants p ON e.plant_id = p.plant_id
                LEFT JOIN question_system_kas qsk ON q.question_id = qsk.question_id
                LEFT JOIN system_kas sk ON qsk.system_number = sk.system_number AND qsk.ka_number = sk.ka_number
                LEFT JOIN systems s ON sk.system_number = s.system_number
                LEFT JOIN kas k ON sk.ka_number = k.ka_number
                LEFT JOIN stems st ON k.stem_id = st.stem_id

                GROUP BY q.question_id;
                `
                db.exec(globalSearchViewSetupSQL, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
        // 2: {
        //     description: 'Add Full-Text Search (FTS) tables, view, and triggers',
        //     up: (db: sqlite3.Database) => {
        //         const ftsSetupSql = `
        // -- 2. Create the search view
        //             CREATE VIEW IF NOT EXISTS questions_search_view AS
        //             SELECT 
        //                 q.question_id AS rowid,
        //                 q.question_text,
        //                 q.objective,
        //                 q.last_used,
        //                 CAST(q.exam_level AS TEXT) as exam_level,
        //                 CAST(q.difficulty_level AS TEXT) as difficulty_level,
        //                 CAST(q.cognitive_level AS TEXT) as cognitive_level,
        //                 COALESCE(GROUP_CONCAT(DISTINCT e.name), '') as exam_names,
        //                 COALESCE(GROUP_CONCAT(DISTINCT k.ka_description), '') as ka_descriptions,
        //                 COALESCE(GROUP_CONCAT(DISTINCT k.ka_number), '') as ka_numbers,
        //                 COALESCE(GROUP_CONCAT(DISTINCT s.name), '') as system_names,
        //                 COALESCE(GROUP_CONCAT(DISTINCT s.number), '') as system_numbers
        //             FROM questions q
        //             LEFT JOIN exam_questions eq ON q.question_id = eq.question_id
        //             LEFT JOIN exams e ON eq.exam_id = e.exam_id
        //             LEFT JOIN question_kas qk ON q.question_id = qk.question_id
        //             LEFT JOIN kas k ON qk.ka_number = k.ka_number
        //             LEFT JOIN question_systems qs ON q.question_id = qs.question_id
        //             LEFT JOIN systems s ON qs.system_number = s.number
        //             GROUP BY q.question_id, q.question_text, q.objective, q.last_used, q.exam_level, q.difficulty_level, q.cognitive_level;
        //         `;
        //         db.exec(ftsSetupSql, (err) => {
        //             if (err) {
        //                 throw err;
        //             }
        //         });
        //     }
        // }
    } as const;

    // Current version is the highest migration number
    private readonly currentSchemaVersion = Math.max(...Object.keys(Database.MIGRATIONS).map(Number));

    constructor(dbPath: string, sb = false) {
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
        this.stems = new StemRepository(this.db, () => this.isClosing);
        this.kas = new KaRepository(this.db, () => this.isClosing);
        this.system_kas = new SystemKaRepository(this.db, () => this.isClosing);
        this.exam_questions = new ExamQuestionRepository(this.db, () => this.isClosing);

        this.questionService = new QuestionService(this.questions, this.exams, this.systems, this.kas, this.system_kas);
    }

    private async getCurrentSchemaVersion(): Promise<number> {
        return new Promise((resolve) => {
            this.db.get(
                'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1',
                (err, row: { version: number } | undefined) => {
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

    private async runMigration(
        version: number,
        migration: { description: string; up: (db: sqlite3.Database) => void }
    ): Promise<void> {
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
