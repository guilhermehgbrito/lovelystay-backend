import { Command } from 'commander';
import { logger } from '@/lib/logger';
import { listMigrations } from '@/app/services/migrations.service';
import { isFailure } from '@/logic/result';

async function listAction(): Promise<void> {
  const migrationsResult = await listMigrations();

  if (isFailure(migrationsResult)) {
    logger.error({
      message: 'Failed to list migrations',
      data: {
        error: migrationsResult.error,
      },
    });
    return;
  }
  migrationsResult.data.forEach((migration, index) => {
    logger.info(`${index + 1}. ${migration}`);
  });
}

export const list = new Command()
  .command('list')
  .description('List all migrations')
  .action(listAction);
