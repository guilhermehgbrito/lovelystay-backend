import { findByGithubUsername } from '@/app/services/user.service';
import { fetchFromGithubAndSave } from '@/app/services/user.service';
import { logger } from '@/lib/logger';
import { isFailure } from '@/logic/result';
import { Command } from 'commander';
import {
  outputTypeOption,
  outputTypeSchema,
  printOutput,
} from '../common/output-type';
import { z } from 'zod';
import { coalesce } from '@/logic/coalesce';

const getUserOptionsSchema = z.object({
  force: z.boolean().default(false),
  outputType: outputTypeSchema,
});

const getUserAction = async (
  username: string,
  options: z.infer<typeof getUserOptionsSchema>,
) => {
  const parsedOptions = getUserOptionsSchema.safeParse(options);

  if (!parsedOptions.success) {
    logger.error({
      message: 'Invalid options',
      data: { error: parsedOptions.error.issues },
    });
    return;
  }

  const functions = [() => findByGithubUsername({ githubUsername: username })];

  // If the force option is set, we fetch the user from the GitHub API first
  // Otherwise, we try to find the user in the database first and only fetch from the GitHub API if the user is not found
  if (parsedOptions.data.force) {
    functions.unshift(() =>
      fetchFromGithubAndSave({ githubUsername: username }),
    );
  } else {
    functions.push(() => fetchFromGithubAndSave({ githubUsername: username }));
  }

  const userResult = await coalesce(...functions);

  if (!userResult || isFailure(userResult)) {
    logger.error({
      message: 'Failed to find user',
      data: { error: userResult?.error },
    });
    return;
  }

  printOutput(userResult.data, { outputType: parsedOptions.data.outputType });
};

export const getUserCommand = new Command()
  .name('get')
  .description('Get user information')
  .argument('<username>', 'The username of the user to get')
  .addOption(outputTypeOption)
  .option(
    '-f, --force',
    'Force the user to be fetched from the GitHub API',
    false,
  )
  .action(getUserAction);
