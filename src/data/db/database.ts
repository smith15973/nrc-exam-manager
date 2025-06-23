// data/db/database.ts
import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { PlantRepository } from './repositories/PlantRepository';
import { ExamRepository } from './repositories/ExamRepository';
import { QuestionRepository } from './repositories/QuestionRepository';
import { QuestionService } from './services/QuestionService';
import { SystemRepository } from './repositories/SystemRepository';
import { KaRepository } from './repositories/KaRepository';

// Fixed schema - note the corrections
const schema = {
  plants: {
    columns: [
      'plant_id INTEGER PRIMARY KEY AUTOINCREMENT',
      'name TEXT NOT NULL',
    ],
  },
  exams: {
    columns: [
      'exam_id INTEGER PRIMARY KEY AUTOINCREMENT',
      'name TEXT NOT NULL',
      'plant_id INTEGER NOT NULL',
      'FOREIGN KEY (plant_id) REFERENCES plants(plant_id) ON DELETE CASCADE',
    ],
  },
  questions: {
    columns: [
      'question_id INTEGER PRIMARY KEY AUTOINCREMENT',
      'question_text TEXT NOT NULL',
      'img_url TEXT',
      'answer_a TEXT NOT NULL',
      'answer_a_justification TEXT NOT NULL',
      'answer_b TEXT NOT NULL',
      'answer_b_justification TEXT NOT NULL',
      'answer_c TEXT NOT NULL',
      'answer_c_justification TEXT NOT NULL',
      'answer_d TEXT NOT NULL',
      'answer_d_justification TEXT NOT NULL',
      'correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ("A", "B", "C", "D"))',
      'exam_level INTEGER NOT NULL CHECK (exam_level IN (0, 1))',
      'cognitive_level INTEGER NOT NULL CHECK (cognitive_level IN (0, 1))',
      'technical_references TEXT',
      'references_provided TEXT',
      'objective TEXT',
      'last_used TEXT',
    ],
  },
  categories: {
    columns: [
      'category_number TEXT PRIMARY KEY',
      'category_description TEXT NOT NULL'
    ]
  },
  systems: {
    columns: [
      'system_number TEXT PRIMARY KEY',
      'system_name TEXT NOT NULL',
    ],
  },
  kas: {
    columns: [
      'ka_number TEXT PRIMARY KEY',
      'category_number TEXT NOT NULL',
      'FOREIGN KEY (category_number) REFERENCES categories(category_number) ON DELETE CASCADE',
    ]
  },
  system_kas: {
    columns: [
      'system_number TEXT NOT NULL',
      'ka_number TEXT NOT NULL',
      'ka_statement TEXT',
      'ro_importance REAL',
      'sro_importance REAL',
      'cfr_content TEXT',
      'PRIMARY KEY (system_number, ka_number)',
      'FOREIGN KEY (system_number) REFERENCES systems(system_number) ON DELETE CASCADE',
      'FOREIGN KEY (ka_number) REFERENCES kas(ka_number) ON DELETE CASCADE',
    ]
  },
  exam_questions: {
    columns: [
      'exam_id INTEGER NOT NULL',
      'question_id INTEGER NOT NULL',
      'question_number INTEGER NOT NULL',
      'main_system_ka_system TEXT',
      'main_system_ka_ka TEXT',
      'ka_match_justification TEXT NOT NULL',
      'sro_match_justification TEXT',
      'answers_order TEXT',
      'PRIMARY KEY (exam_id, question_id)',
      'FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
      'FOREIGN KEY (main_system_ka_system, main_system_ka_ka) REFERENCES system_kas(system_number, ka_number) ON DELETE CASCADE',
    ],
  },
  question_system_kas: {
    columns: [
      'question_id INTEGER NOT NULL',
      'system_number TEXT NOT NULL',
      'ka_number TEXT NOT NULL',
      'PRIMARY KEY (question_id, system_number, ka_number)',
      'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE',
      'FOREIGN KEY (system_number, ka_number) REFERENCES system_kas(system_number, ka_number) ON DELETE CASCADE',
    ],
  },
  schema_version: {
    columns: [
      'version INTEGER PRIMARY KEY',
      'applied_at TEXT DEFAULT CURRENT_TIMESTAMP',
    ],
  },
};


export class Database {
    private db: sqlite3.Database;
    private isClosing: boolean = false;
    private dbPath: string;

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
                // Create tables in dependency order to avoid foreign key constraint errors
                const tableOrder = [
                    'schema_version',
                    'plants',
                    'categories',
                    'systems',
                    'kas',
                    'system_kas',
                    'exams',
                    'questions',
                    'question_system_kas',
                    'exam_questions'
                ];

                // Enable foreign key constraints
                db.run('PRAGMA foreign_keys = ON');

                tableOrder.forEach(tableName => {
                    if (schema[tableName as keyof typeof schema]) {
                        const { columns } = schema[tableName as keyof typeof schema];
                        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')})`;
                        db.run(sql);
                    }
                });

                // Insert initial schema version
                db.run('INSERT OR IGNORE INTO schema_version (version) VALUES (1)');
            }
        },
    } as const;

    // Current version is the highest migration number
    private readonly currentSchemaVersion = Math.max(...Object.keys(Database.MIGRATIONS).map(Number));

    constructor(dbPath: string, sb: boolean = false) {
        console.log('Database location:', dbPath);
        console.log('Target schema version:', this.currentSchemaVersion);

        this.dbPath = dbPath;

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

        // Generate schema files after all migrations complete
        console.log('🔄 Generating schema and types files...');
        await this.generateSchemaFiles();
        console.log('✅ Schema and types files generated');
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

    private async generateSchemaFiles(): Promise<void> {
        try {
            const schemaInfo = await this.extractSchemaInfo();
            const outputDir = path.dirname(this.dbPath);

            // Generate TypeScript types file
            const typesContent = this.generateTypesFile(schemaInfo);
            const typesPath = path.join(outputDir, 'generated-types.ts');
            fs.writeFileSync(typesPath, typesContent);

            // Generate schema documentation file
            const schemaContent = this.generateSchemaFile(schemaInfo);
            const schemaPath = path.join(outputDir, 'generated-schema.md');
            fs.writeFileSync(schemaPath, schemaContent);

            console.log(`📁 Generated files:`);
            console.log(`   - Types: ${typesPath}`);
            console.log(`   - Schema: ${schemaPath}`);

        } catch (error) {
            console.error('❌ Error generating schema files:', error);
        }
    }

    private async extractSchemaInfo(): Promise<any> {
        return new Promise((resolve, reject) => {
            const schemaInfo: any = {
                tables: {},
                views: {},
                indexes: {},
                generatedAt: new Date().toISOString(),
                schemaVersion: this.currentSchemaVersion
            };

            // Get all tables
            this.db.all(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            `, (err, tables: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                let pendingTables = tables.length;
                if (pendingTables === 0) {
                    resolve(schemaInfo);
                    return;
                }

                tables.forEach(table => {
                    // Get table info
                    this.db.all(`PRAGMA table_info(${table.name})`, (err, columns: any[]) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        schemaInfo.tables[table.name] = {
                            columns: columns.map(col => ({
                                name: col.name,
                                type: col.type,
                                notNull: col.notnull === 1,
                                defaultValue: col.dflt_value,
                                primaryKey: col.pk === 1
                            })),
                            foreignKeys: []
                        };

                        // Get foreign keys
                        this.db.all(`PRAGMA foreign_key_list(${table.name})`, (err, fks: any[]) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            schemaInfo.tables[table.name].foreignKeys = fks.map(fk => ({
                                from: fk.from,
                                table: fk.table,
                                to: fk.to
                            }));

                            pendingTables--;
                            if (pendingTables === 0) {
                                // Get views
                                this.db.all(`
                                    SELECT name, sql FROM sqlite_master 
                                    WHERE type='view'
                                `, (err, views: any[]) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }

                                    views.forEach(view => {
                                        schemaInfo.views[view.name] = {
                                            sql: view.sql
                                        };
                                    });

                                    resolve(schemaInfo);
                                });
                            }
                        });
                    });
                });
            });
        });
    }

    private generateTypesFile(schemaInfo: any): string {
        let content = `// Generated TypeScript types for database schema
// Generated at: ${schemaInfo.generatedAt}
// Schema version: ${schemaInfo.schemaVersion}
// DO NOT EDIT - This file is auto-generated

`;

        // Generate table types
        Object.entries(schemaInfo.tables).forEach(([tableName, tableInfo]: [string, any]) => {
            const interfaceName = this.toPascalCase(tableName);

            content += `export interface ${interfaceName} {\n`;

            tableInfo.columns.forEach((col: any) => {
                const optional = !col.notNull && !col.primaryKey ? '?' : '';
                const tsType = this.sqliteTypeToTypeScript(col.type);
                content += `  ${col.name}${optional}: ${tsType};\n`;
            });

            content += `}\n\n`;

            // Generate insert type (all fields optional except required ones)
            content += `export interface ${interfaceName}Insert {\n`;
            tableInfo.columns.forEach((col: any) => {
                const optional = !col.notNull || col.defaultValue !== null ? '?' : '';
                const tsType = this.sqliteTypeToTypeScript(col.type);
                content += `  ${col.name}${optional}: ${tsType};\n`;
            });
            content += `}\n\n`;

            // Generate update type (all fields optional)
            content += `export interface ${interfaceName}Update {\n`;
            tableInfo.columns.forEach((col: any) => {
                const tsType = this.sqliteTypeToTypeScript(col.type);
                content += `  ${col.name}?: ${tsType};\n`;
            });
            content += `}\n\n`;
        });

        // Generate view types
        Object.entries(schemaInfo.views).forEach(([viewName, viewInfo]: [string, any]) => {
            const interfaceName = this.toPascalCase(viewName);
            content += `export interface ${interfaceName} {\n`;
            content += `  // View columns - types inferred from SQL\n`;
            content += `  [key: string]: any;\n`;
            content += `}\n\n`;
        });

        // Generate database schema type
        content += `export interface DatabaseSchema {\n`;
        Object.keys(schemaInfo.tables).forEach(tableName => {
            content += `  ${tableName}: ${this.toPascalCase(tableName)};\n`;
        });
        content += `}\n\n`;

        // Generate table names enum
        content += `export enum TableNames {\n`;
        Object.keys(schemaInfo.tables).forEach(tableName => {
            content += `  ${this.toConstantCase(tableName)} = '${tableName}',\n`;
        });
        content += `}\n\n`;

        return content;
    }

    private generateSchemaFile(schemaInfo: any): string {
        let content = `# Database Schema Documentation

**Generated at:** ${schemaInfo.generatedAt}  
**Schema version:** ${schemaInfo.schemaVersion}

> ⚠️ **DO NOT EDIT** - This file is auto-generated

## Tables

`;

        Object.entries(schemaInfo.tables).forEach(([tableName, tableInfo]: [string, any]) => {
            content += `### ${tableName}\n\n`;

            content += `| Column | Type | Null | Default | Primary Key |\n`;
            content += `|--------|------|------|---------|-------------|\n`;

            tableInfo.columns.forEach((col: any) => {
                const nullable = col.notNull ? 'NO' : 'YES';
                const defaultVal = col.defaultValue || '-';
                const pk = col.primaryKey ? '✓' : '-';
                content += `| ${col.name} | ${col.type} | ${nullable} | ${defaultVal} | ${pk} |\n`;
            });

            content += `\n`;

            if (tableInfo.foreignKeys.length > 0) {
                content += `**Foreign Keys:**\n`;
                tableInfo.foreignKeys.forEach((fk: any) => {
                    content += `- ${fk.from} → ${fk.table}.${fk.to}\n`;
                });
                content += `\n`;
            }
        });

        if (Object.keys(schemaInfo.views).length > 0) {
            content += `## Views\n\n`;
            Object.entries(schemaInfo.views).forEach(([viewName, viewInfo]: [string, any]) => {
                content += `### ${viewName}\n\n`;
                content += `\`\`\`sql\n${viewInfo.sql}\n\`\`\`\n\n`;
            });
        }

        return content;
    }

    private sqliteTypeToTypeScript(sqliteType: string): string {
        const type = sqliteType.toUpperCase();

        if (type.includes('INT')) return 'number';
        if (type.includes('REAL') || type.includes('FLOAT') || type.includes('DOUBLE')) return 'number';
        if (type.includes('TEXT') || type.includes('CHAR') || type.includes('VARCHAR')) return 'string';
        if (type.includes('BLOB')) return 'Buffer';
        if (type.includes('BOOL')) return 'boolean';
        if (type.includes('DATE') || type.includes('TIME')) return 'string';

        return 'any'; // fallback
    }

    private toPascalCase(str: string): string {
        return str.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join('');
    }

    private toConstantCase(str: string): string {
        return str.toUpperCase();
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

    // Manual schema generation (can be called externally)
    async generateSchema(): Promise<void> {
        console.log('🔄 Manually generating schema and types files...');
        await this.generateSchemaFiles();
        console.log('✅ Schema and types files generated');
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