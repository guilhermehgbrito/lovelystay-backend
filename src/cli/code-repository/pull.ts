import { Command } from 'commander';
import { z } from 'zod';
import { isFailure } from '@/logic/result';
import { logger } from '@/lib/logger';
import { fetchAndSaveCodeRepositories } from '@/app/services/code-repository.service';
import { usernameSchema } from '../common/username';

const pullSchema = z.object({
  username: usernameSchema,
});

async function pullAction(username: string): Promise<void> {
  const parsedOptions = pullSchema.safeParse({ username });

  if (!parsedOptions.success) {
    logger.error({
      message: 'Invalid input',
      data: { error: parsedOptions.error.errors },
    });
    return;
  }

  const { username: validatedUsername } = parsedOptions.data;

  const repositoriesCount = await fetchAndSaveCodeRepositories({
    githubUsername: validatedUsername,
  });

  if (isFailure(repositoriesCount)) {
    logger.error({
      message: 'Failed to fetch code repositories',
      data: {
        error: repositoriesCount.error,
      },
    });
    return;
  }

  logger.info({
    message: 'Fetched code repositories',
    data: {
      totalSaved: repositoriesCount.data.totalSaved,
      totalFailed: repositoriesCount.data.totalFailed,
    },
  });
}

export const pull = new Command()
  .command('pull')
  .description(
    'Fetch code repositories from GitHub. If the user is not found, it will be fetched from GitHub and saved to the database.',
  )
  .argument(
    '<username>',
    'The username of the user to fetch code repositories from',
  )
  .action(pullAction);
