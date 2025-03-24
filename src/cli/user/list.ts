import { USER_LISTING_DEFAULT_LIMIT } from '@/app/constants/user.constants';
import { outputTypeSchema, printOutput } from '../common/output-type';
import { outputTypeOption } from '../common/output-type';
import {
  ListUsersError,
  FilterUsersError,
  UserWithLanguages,
} from '@/app/@types/user';
import { User } from '@/app/models/user.model';
import { filterUsers, listUsers } from '@/app/services/user.service';
import { logger } from '@/lib/logger';
import { Result, isFailure } from '@/logic/result';
import { z } from 'zod';
import { Command } from 'commander';

const languageSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9\s\-#.]{1,32}$/,
    'Language must contain only alphanumeric characters, spaces, hyphens, and dots. Should be less than 32 characters',
  )
  .transform((val) => val?.trim().replace(/[^\w.#-]/g, ''));

const listOptionsSchema = z.object({
  page: z.coerce
    .number()
    .min(1)
    .default(1)
    .transform((val) => val || 1),
  limit: z.coerce.number().min(1).max(100).default(USER_LISTING_DEFAULT_LIMIT),
  location: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s-]{1,64}$/,
      'Location must contain only alphanumeric characters, spaces, and hyphens. Should be less than 64 characters',
    )
    .optional(),
  languages: z.array(languageSchema).optional(),
  language: languageSchema.optional(),
  outputType: outputTypeSchema,
});

const listAndFilterUsersAction = async (
  options: z.infer<typeof listOptionsSchema>,
) => {
  const parsedOptions = listOptionsSchema.safeParse(options);

  if (!parsedOptions.success) {
    logger.error({
      message: 'Invalid options',
      data: { error: parsedOptions.error.issues },
    });
    return;
  }

  const languages = parsedOptions.data.language
    ? [parsedOptions.data.language]
    : parsedOptions.data.languages;

  let result: Result<
    ListUsersError | FilterUsersError,
    User[] | UserWithLanguages[]
  >;

  if (parsedOptions.data.location || languages?.length) {
    result = await filterUsers({
      ...parsedOptions.data,
      location: parsedOptions.data.location,
      languages,
    });
  } else {
    result = await listUsers({
      page: parsedOptions.data.page,
      limit: parsedOptions.data.limit,
    });
  }

  if (isFailure(result)) {
    logger.error({
      message: 'Failed to list or filter users',
      data: { error: result.error },
    });
    return;
  }

  printOutput(result.data, { outputType: parsedOptions.data.outputType });
};

export const listUserCommand = new Command()
  .name('list')
  .description('List users')
  .addOption(outputTypeOption)
  .option('-p, --page <page>', 'The page number to fetch', '1')
  .option(
    '-l, --limit <limit>',
    'The number of users to fetch',
    USER_LISTING_DEFAULT_LIMIT.toString(),
  )
  .option('--lo, --location <location>', 'The location of the users to fetch')
  .option(
    '--la, --languages <language> [languages...]',
    'The language of the users to fetch',
  )
  .action(listAndFilterUsersAction);
