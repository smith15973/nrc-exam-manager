#!/usr/bin/env ts-node

// scripts/migrate.ts
import { Database } from '../src/data/db/database'
import * as path from 'path';
import * as fs from 'fs';

const DEFAULT_DB_PATH = path.join(process.cwd(), 'database.db');

async function runMigration() {
    console.log('🚀 Starting database migration...');

    // Get database path from command line args or use default
    const dbPath = process.argv[2] || DEFAULT_DB_PATH;

    console.log(`📁 Database path: ${dbPath}`);

    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        console.log(`📁 Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
    }

    try {
        // Create database instance - this will run migrations automatically
        const db = new Database(dbPath);

        // Wait a bit for migrations to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Manually trigger schema generation if needed
        await db.generateSchema();

        console.log('✅ Migration completed successfully!');

        // Close database
        db.close();

        // Exit process
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Migration interrupted');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Migration terminated');
    process.exit(1);
});

// Run migration
runMigration();