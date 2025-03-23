import { Command } from 'commander';
import { logger } from '@/lib/logger';
import { migrate } from '@/app/services/migrations.service';

async function upAction(): Promise<void> {
  try {
    await migrate();
  } catch (error) {
    logger.error({
      message: 'Failed to run migrations',
      data: {
        error,
      },
    });
    throw error;
  }
}

export const up = new Command()
  .command('up')
  .description('Run all migrations')
  .action(upAction);
