import { Command, Option } from 'commander';
import { isFailure } from '@/logic/result';
import {
  findByGithubUsername,
  fetchFromGithubAndSave,
  filterUsers,
  listUsers,
} from '@/app/services/user.service';
import { logger } from '@/lib/logger';
import { USER_LISTING_DEFAULT_LIMIT } from '@/app/constants/user.constants';

import { User } from '@/app/models/user.model';
import { UserWithLanguages } from '@/app/@types/user';
export const user = new Command().command('user').description('User commands');
const outputTypes = ['json', 'csv', 'table'] as const;
type OutputType = (typeof outputTypes)[number];

const outputTypeOption = new Option(
  '-t, --output-type <type>',
  'The type of output to use',
)
  .choices(outputTypes)
  .default('json')
  .argParser((value) => value?.toLowerCase());

const printOutput = <T>(data: T, options: { outputType: OutputType }) => {
  switch (options.outputType) {
    case 'json': {
      console.log(JSON.stringify(data, null, 2));
      break;
    }
    case 'csv': {
      const isArray = Array.isArray(data);
      const headers = Object.keys(isArray ? data[0] || {} : data || {});
      console.log(headers.join(','));
      for (const item of isArray ? data : [data]) {
        console.log(headers.map((header) => item[header]).join(','));
      }
      break;
    }
    case 'table': {
      console.table(data);
      break;
    }
    default: {
      throw new Error(`Invalid output type: ${options.outputType}`);
    }
  }
};

user
  .command('get')
  .description('Get user information')
  .argument('<username>', 'The username of the user to get')
  .addOption(outputTypeOption)
  .option(
    '-f, --force',
    'Force the user to be fetched from the GitHub API',
    false,
  )
  .action(async (username, options) => {
    const user = options.force
      ? await fetchFromGithubAndSave({ githubUsername: username })
      : await findByGithubUsername({ githubUsername: username });

    if (isFailure(user)) {
      logger.error({
        message: 'Failed to find user',
        data: {
          error: user.error,
        },
      });
      return;
    }

    printOutput([user.data], { outputType: options.outputType });
  });

const languageOption = new Option(
  '--la, --languages <language> [languages...]',
  'The language of the users to fetch',
);

user
  .command('list')
  .description('List users')
  .addOption(outputTypeOption)
  .option('-p, --page <page>', 'The page number to fetch', '1')
  .option(
    '-l, --limit <limit>',
    'The number of users to fetch',
    USER_LISTING_DEFAULT_LIMIT.toString(),
  )
  .option('--lo, --location <location>', 'The location of the users to fetch')
  .addOption(languageOption)
  .action(async (options) => {
    const pageOptions = {
      page: parseInt(options.page),
      limit: parseInt(options.limit),
    };

    const languages = options.language ? [options.language] : options.languages;

    let users: User[] | UserWithLanguages[] = [];

    if (options.location || languages?.length) {
      const result = await filterUsers({
        ...pageOptions,
        location: options.location,
        languages,
      });

      if (isFailure(result)) {
        logger.error({
          message: 'Failed to filter users',
          data: {
            error: result.error,
          },
        });
        return;
      }

      users = result.data;
    } else {
      const result = await listUsers(pageOptions);

      if (isFailure(result)) {
        logger.error({
          message: 'Failed to list users',
          data: {
            error: result.error,
          },
        });
        return;
      }

      users = result.data;
    }

    printOutput(users, { outputType: options.outputType });
  });
