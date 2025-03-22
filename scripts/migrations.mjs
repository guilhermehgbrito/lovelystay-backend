#!/usr/bin/env node

import { program } from 'commander';
import { writeFile, readdir } from 'fs/promises';
import path from 'path';
import pgPromise from 'pg-promise';
import { fileURLToPath } from 'url';

const MIGRATION_FILE_PATH = path.resolve(fileURLToPath(import.meta.url), '../../src/lib/db/migrations');

/**
 * @type {import('pg-promise').IDatabase<any>}
 */
let db;

/**
 * Create a new migration file
 * @param {string} name
 * @returns {Promise<string>}
 */
async function createMigration(name) {
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
async function listMigrations(migrationFilePath) {
  const migrations = await readdir(migrationFilePath);
  return migrations.filter((migration) => migration.endsWith('.sql'));
}

/**
 * Apply all migrations to the database
 * @param {string} migrationFilePath
 */
async function migrate(migrationFilePath) {
  db = pgPromise()(process.env.DATABASE_URL);

  const migrations = await listMigrations(migrationFilePath);

  for (const migration of migrations.toSorted()) {
    const migrationSql = new pgPromise.QueryFile(path.join(migrationFilePath, migration), {
      minify: true,
    });

    console.log(`Running migration: ${migration}`);
    try {
      await db.none(migrationSql);
      console.log(`Migration ${migration} completed`);
    } catch (error) {
      console.error(`Migration ${migration} failed: ${error}`);
      throw error;
    }
  }

  await db.$pool.end();
}

program
  .enablePositionalOptions()
  .command('new <name>')
  .description('Create a new migration file')
  .addHelpText(
    'after',
    'Example: $ migration:new create_users_table'
  )
  .action(async (name) => {
    const migrationFile = await createMigration(name);
    console.log(`Migration file created: ${migrationFile}`);
  })

program
  .command('list')
  .description('List all migrations')
  .action(async () => {
    const migrations = await listMigrations(MIGRATION_FILE_PATH);
    migrations.forEach((migration, index) => {
      console.log(`${index + 1}. ${migration}`);
    });
  });

program
  .command('up')
  .description('Run all migrations')
  .action(async () => {
    await migrate(MIGRATION_FILE_PATH);
  });

program.parse(process.argv);

['SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection'].forEach((signal) => {
  process.on(signal, async () => {
    await db.$pool.end();
  });
});
