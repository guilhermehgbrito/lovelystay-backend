import { readdir, writeFile } from 'node:fs/promises';
import { MIGRATION_FILE_PATH } from '../constants/migrations.constants';
import {
  FailureError,
  Result,
  failure,
  isFailure,
  success,
} from '@/logic/result';
import { logger } from '@/lib/logger';
import { db, pgp } from '@/lib/db';
import path from 'node:path';

export type MigrationsErrorCodes = 'UNKNOWN';
export type MigrationsError = FailureError<MigrationsErrorCodes>;

/**
 * Create a new migration file
 * @param name - The name of the migration
 * @returns The path to the new migration file
 */
export async function createMigration(
  name: string,
): Promise<Result<MigrationsError, string>> {
  try {
    const migrationName = name.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().replace(/\D/g, '');
    const migrationFile = `${MIGRATION_FILE_PATH}/${timestamp}_${migrationName}.sql`;
    await writeFile(migrationFile, '');

    return success(migrationFile);
  } catch (error) {
    return failure<MigrationsError>({
      cause: error,
      code: 'UNKNOWN',
    });
  }
}

/**
 * List all migrations
 * @returns An array of migration files
 */
export async function listMigrations(): Promise<
  Result<MigrationsError, string[]>
> {
  try {
    const migrations = await readdir(MIGRATION_FILE_PATH);
    return success(
      migrations.filter((migration) => migration.endsWith('.sql')),
    );
  } catch (error) {
    return failure<MigrationsError>({
      cause: error,
      code: 'UNKNOWN',
    });
  }
}

/**
 * Run all migrations
 * @returns A result indicating success or failure
 */
export async function migrate(): Promise<Result<MigrationsError, void>> {
  const migrationsResult = await listMigrations();

  if (isFailure(migrationsResult)) {
    logger.error({
      message: 'Failed to list migrations',
      data: {
        error: migrationsResult.error,
      },
    });
    return failure<MigrationsError>({
      cause: migrationsResult.error,
      code: 'UNKNOWN',
    });
  }

  for (const migration of migrationsResult.data.sort()) {
    const migrationSql = new pgp.QueryFile(
      path.join(MIGRATION_FILE_PATH, migration),
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
      return failure<MigrationsError>({
        cause: error,
        code: 'UNKNOWN',
      });
    }
  }

  return success(undefined);
}
