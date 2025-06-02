// db/cli.ts - Database management CLI
import { Database } from './index';
import { getCurrentSchemaVersion } from './migrator';

export class DatabaseCLI {
    private database: Database;

    constructor() {
        this.database = new Database();
    }

    async status(): Promise<void> {
        try {
            const currentVersion = await this.database['migrator'].getCurrentDatabaseVersion();
            const targetVersion = getCurrentSchemaVersion();

            console.log('📊 Database Status:');
            console.log(`   Current version: ${currentVersion}`);
            console.log(`   Latest version:  ${targetVersion}`);

            if (currentVersion < targetVersion) {
                console.log(`   Status: ⚠️  Migrations pending (${targetVersion - currentVersion} migrations)`);
            } else if (currentVersion === targetVersion) {
                console.log(`   Status: ✅ Up to date`);
            } else {
                console.log(`   Status: ⚠️  Database is ahead of code (version ${currentVersion} > ${targetVersion})`);
            }
        } catch (error) {
            console.error('❌ Error checking database status:', error);
        }
    }

    async migrate(): Promise<void> {
        try {
            const currentVersion = await this.database['migrator'].getCurrentDatabaseVersion();
            const targetVersion = getCurrentSchemaVersion();

            if (currentVersion >= targetVersion) {
                console.log('✅ Database is already up to date');
                return;
            }

            console.log(`🔄 Running migrations from v${currentVersion} to v${targetVersion}...`);
            await this.database['migrator'].runMigrations(currentVersion, targetVersion);
            console.log('🎉 Migration completed successfully!');
        } catch (error) {
            console.error('❌ Migration failed:', error);
        }
    }

    async rollback(version: number): Promise<void> {
        try {
            console.log(`🔄 Rolling back to version ${version}...`);
            await this.database.rollbackTo(version);
            console.log('✅ Rollback completed successfully!');
        } catch (error) {
            console.error('❌ Rollback failed:', error);
        }
    }

    async reset(): Promise<void> {
        try {
            console.log('⚠️  This will reset the database to version 0 (empty database)');
            console.log('🔄 Rolling back all migrations...');
            await this.database.rollbackTo(0);
            console.log('✅ Database reset completed successfully!');
        } catch (error) {
            console.error('❌ Database reset failed:', error);
        }
    }

    close(): void {
        this.database.close();
    }
}

// CLI entry point
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const cli = new DatabaseCLI();

    try {
        switch (command) {
            case 'status':
                await cli.status();
                break;

            case 'migrate':
                await cli.migrate();
                break;

            case 'rollback':
                const version = parseInt(args[1]);
                if (isNaN(version)) {
                    console.error('❌ Invalid version number');
                    console.log('Usage: npm run db:rollback <version>');
                    process.exit(1);
                }
                await cli.rollback(version);
                break;

            case 'reset':
                await cli.reset();
                break;

            default:
                console.log('🗃️  Database Management CLI');
                console.log('');
                console.log('Available commands:');
                console.log('  status   - Show current database version and migration status');
                console.log('  migrate  - Run pending migrations');
                console.log('  rollback <version> - Rollback to specific version');
                console.log('  reset    - Reset database (rollback all migrations)');
                console.log('');
                console.log('Examples:');
                console.log('  npm run db:status');
                console.log('  npm run db:migrate');
                console.log('  npm run db:rollback 1');
                console.log('  npm run db:reset');
                break;
        }
    } finally {
        cli.close();
    }
}

if (require.main === module) {
    main().catch(console.error);
}