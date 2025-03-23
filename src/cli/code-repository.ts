import { Command } from 'commander';
import { isFailure } from '@/logic/result';
import { findByGithubUsername } from '@/app/services/user.service';
import { logger } from '@/lib/logger';
import { fetchAndSaveCodeRepositories } from '@/app/services/code-repository.service';

export const codeRepository = new Command()
  .command('repo')
  .description('Code repository commands');

codeRepository
  .command('pull')
  .description(
    'Fetch code repositories from GitHub. If the user is not found, it will be fetched from GitHub and saved to the database.',
  )
  .argument(
    '<username>',
    'The username of the user to fetch code repositories from',
  )
  .action(async (username) => {
    const user = await findByGithubUsername({ githubUsername: username });

    if (isFailure(user)) {
      logger.error({
        message: 'Failed to find user',
        data: {
          error: user.error,
        },
      });
      return;
    }

    const repositoriesCount = await fetchAndSaveCodeRepositories({
      githubUsername: username,
      ownerId: user.data.id,
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
  });
