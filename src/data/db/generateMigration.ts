// scripts/generateMigration.ts
// Run this script to generate a new migration file template

import fs from 'fs';
import path from 'path';
import { migrations } from './migrator';


function generateMigrationTemplate(description: string): string {
    const nextVersion = Math.max(...migrations.map(m => m.version)) + 1;

    return `// Migration ${nextVersion}: ${description}
// Generated on ${new Date().toISOString()}

import sqlite3 from 'sqlite3';

// Helper function to run SQL commands as promises
const runSQL = (db: sqlite3.Database, sql: string, params: any[] = []): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

export const migration${nextVersion} = {
    version: ${nextVersion},
    description: '${description}',
    up: async (db: sqlite3.Database) => {
        // TODO: Add your migration logic here
        // Example:
        // await runSQL(db, 'CREATE TABLE new_table (id INTEGER PRIMARY KEY, name TEXT)');
        // await runSQL(db, 'ALTER TABLE existing_table ADD COLUMN new_column TEXT');
        
        throw new Error('Migration not implemented yet!');
    },
    down: async (db: sqlite3.Database) => {
        // TODO: Add rollback logic here (optional but recommended)
        // Example:
        // await runSQL(db, 'DROP TABLE new_table');
        // await runSQL(db, 'ALTER TABLE existing_table DROP COLUMN new_column'); // Note: SQLite limitations
        
        console.warn('Rollback for migration ${nextVersion} not implemented');
    }
};

// Don't forget to add this migration to the migrations array in migrations.ts!
`;
}

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Usage: npm run generate:migration "Migration description"');
        console.error('Example: npm run generate:migration "Add user authentication tables"');
        process.exit(1);
    }

    const description = args.join(' ');
    const nextVersion = Math.max(...migrations.map(m => m.version)) + 1;
    const filename = `migration_${nextVersion.toString().padStart(3, '0')}_${description.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}.ts`;
    const filepath = path.join(__dirname, '..', 'db', 'migrations', filename);

    // Create migrations directory if it doesn't exist
    const migrationsDir = path.dirname(filepath);
    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const template = generateMigrationTemplate(description);

    try {
        fs.writeFileSync(filepath, template);
        console.log(`✅ Migration file created: ${filepath}`);
        console.log(`📝 Next steps:`);
        console.log(`   1. Edit the migration file to add your changes`);
        console.log(`   2. Import and add the migration to the migrations array in migrations.ts`);
        console.log(`   3. Test your migration thoroughly before deploying`);
        console.log(``);
        console.log(`💡 Remember to:`);
        console.log(`   - Always test migrations on a backup database first`);
        console.log(`   - Consider backwards compatibility`);
        console.log(`   - Add appropriate indexes for performance`);
        console.log(`   - Document any breaking changes`);
    } catch (error) {
        console.error('❌ Error creating migration file:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}


