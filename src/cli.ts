import { Command, program } from 'commander';
import { isFailure } from './logic/result';
import {
  findByGithubUsername,
  findFromGithubAndSave,
} from './app/services/user.service';
import { logger } from './lib/logger';

const user = new Command().command('user').description('User commands');

user
  .command('get')
  .description('Get user information')
  .argument('<username>', 'The username of the user to get')
  .option(
    '-f, --force',
    'Force the user to be fetched from the GitHub API',
    false,
  )
  .action(async (username, options) => {
    const user = options.force
      ? await findFromGithubAndSave({ githubUsername: username })
      : await findByGithubUsername({ githubUsername: username });

    if (isFailure(user)) {
      logger.error(user.error);
      return;
    }

    logger.info(user.data);
  });

program.addCommand(user);
