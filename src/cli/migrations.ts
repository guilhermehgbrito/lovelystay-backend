import { Command } from 'commander';
import { writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import pgPromise from 'pg-promise';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

const MIGRATION_FILE_PATH = path.join(process.cwd(), 'migrations');

/**
 * Create a new migration file
 * @param {string} name
 * @returns {Promise<string>}
 */
async function createMigration(name: string): Promise<string> {
  const migrationName = name.replace(/\s+/g, '_');
  const timestamp = new Date().toISOString().replace(/\D/g, '');
  const migrationFile = `${MIGRATION_FILE_PATH}/${timestamp}_${migrationName}.sql`;
  await writeFile(migrationFile, '');

  return migrationFile;
}

/**
 * List all migrations in the migration file path
 * @param {string} migrationFilePath
 * @returns {Promise<string[]>}
 */
async function listMigrations(migrationFilePath: string): Promise<string[]> {
  const migrations = await readdir(migrationFilePath);
  return migrations.filter((migration) => migration.endsWith('.sql'));
}

/**
 * Apply all migrations to the database
 * @param {string} migrationFilePath
 */
async function migrate(migrationFilePath: string): Promise<void> {
  const migrations = await listMigrations(migrationFilePath);

  for (const migration of migrations.sort()) {
    const migrationSql = new pgPromise.QueryFile(
      path.join(migrationFilePath, migration),
      {
        minify: true,
      },
    );

    logger.info(`Running migration: ${migration}`);
    try {
      await db.none(migrationSql);
      logger.info(`Migration ${migration} completed`);
    } catch (error) {
      logger.error(`Migration ${migration} failed: ${error}`);
      throw error;
    }
  }
}

export const migrations = new Command()
  .command('migrations')
  .description('Migrations commands')
  .addHelpText('after', 'Example: $ migration new create_users_table')
  .addHelpText('after', 'Example: $ migration list')
  .addHelpText('after', 'Example: $ migration up');

migrations
  .command('new <name>')
  .description('Create a new migration file')
  .addHelpText('after', 'Example: $ migration:new create_users_table')
  .action(async (name) => {
    const migrationFile = await createMigration(name);
    logger.info(`Migration file created: ${migrationFile}`);
  });

migrations
  .command('list')
  .description('List all migrations')
  .action(async () => {
    const migrations = await listMigrations(MIGRATION_FILE_PATH);
    migrations.forEach((migration, index) => {
      logger.info(`${index + 1}. ${migration}`);
    });
  });

migrations
  .command('up')
  .description('Run all migrations')
  .action(async () => {
    await migrate(MIGRATION_FILE_PATH);
  });
