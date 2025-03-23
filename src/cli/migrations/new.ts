import { Command } from 'commander';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createMigration } from '@/app/services/migrations.service';
import { isFailure } from '@/logic/result';

const newMigrationSchema = z.object({
  name: z.string().min(1, 'Migration name is required'),
});

async function newMigrationAction(name: string): Promise<void> {
  const parsedOptions = newMigrationSchema.safeParse({ name });

  if (!parsedOptions.success) {
    logger.error({
      message: 'Invalid input',
      data: { error: parsedOptions.error.errors },
    });
    return;
  }

  const { name: validatedName } = parsedOptions.data;
  const migrationFile = await createMigration(validatedName);

  if (isFailure(migrationFile)) {
    logger.error({
      message: 'Failed to create migration file',
      data: { error: migrationFile.error },
    });
    return;
  }

  logger.info(`Migration file created: ${migrationFile.data}`);
}

export const newMigration = new Command()
  .command('new')
  .description('Create a new migration file')
  .argument('<name>', 'The name of the migration')
  .addHelpText('after', 'Example: $ migration new create_users_table')
  .action(newMigrationAction);
