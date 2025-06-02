// db/index.ts
import sqlite3 from 'sqlite3';
import { app } from 'electron';
import path from 'path';
import { Migrator, getCurrentSchemaVersion } from './migrator';
import { PlantRepository } from './repositories/PlantRepository';
import { ExamRepository } from './repositories/ExamRepository';
import { QuestionRepository } from './repositories/QuestionRepository';
import { QuestionService } from './services/QuestionService';

export class Database {
    private db: sqlite3.Database;
    private isClosing: boolean = false;
    private migrator: Migrator;

    // Repository instances
    public plants: PlantRepository;
    public exams: ExamRepository;
    public questions: QuestionRepository;
    public questionService: QuestionService;

    constructor() {
        const dbPath = path.join(app.getPath('userData'), 'nrc_exam_questions_database.db');
        console.log('Database location:', dbPath);

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

        // Initialize migrator and repositories
        this.migrator = new Migrator(this.db);
        this.plants = new PlantRepository(this.db, () => this.isClosing);
        this.exams = new ExamRepository(this.db, () => this.isClosing);
        this.questions = new QuestionRepository(this.db, () => this.isClosing);
        this.questionService = new QuestionService(this.questions, this.exams);
    }

    private async init() {
        this.db.run('PRAGMA foreign_keys = ON');

        try {
            const currentVersion = await this.migrator.getCurrentDatabaseVersion();
            const targetVersion = getCurrentSchemaVersion();
            
            console.log(`📊 Current database version: ${currentVersion}`);
            console.log(`🎯 Target schema version: ${targetVersion}`);

            if (currentVersion < targetVersion) {
                await this.migrator.runMigrations(currentVersion, targetVersion);
                console.log('🎉 Database migrations completed successfully');
            } else {
                console.log('✨ Database schema is up to date');
            }
        } catch (error) {
            console.error("❌ Database initialization failed: ", error);
        }
    }

    // Method to rollback to a specific version (useful for development)
    async rollbackTo(version: number): Promise<void> {
        await this.migrator.rollback(version);
    }

    isConnected(): boolean {
        try {
            this.db.get('SELECT 1', (err) => {
                if (err) return false;
            });
            return !this.isClosing;
        } catch (err) {
            return false;
        }
    }

    close(): void {
        if (this.isClosing) return;
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

