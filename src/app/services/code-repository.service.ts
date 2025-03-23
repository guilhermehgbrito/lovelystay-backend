import {
  success,
  isFailure,
  Result,
  FailureError,
  failure,
} from '@/logic/result';
import { findByGithubUsername } from './user.service';
import { GitHubErrorCodes, GitHubRepository } from '@/lib/github/types';
import {
  getGitHubRepositoryLanguages,
  getGitHubUserRepositoriesStream,
} from '@/lib/github/api/users';
import { db } from '@/lib/db';
import { ProgrammingLanguage } from '../models/code-repository.model';
import { logger } from '@/lib/logger';

export type FetchAndSaveCodeRepositoriesParams = {
  githubUsername: string;
  ownerId?: number;
};

export type FetchAndSaveCodeRepositoriesErrorCodes =
  | 'UNKNOWN'
  | GitHubErrorCodes;
export type FetchAndSaveCodeRepositoriesError =
  FailureError<FetchAndSaveCodeRepositoriesErrorCodes>;
export type FetchAndSaveCodeRepositoriesResult = Result<
  FetchAndSaveCodeRepositoriesError,
  { totalSaved: number; totalFailed: number }
>;

/**
 * Fetches and saves code repositories for a user.
 * @param {FetchAndSaveCodeRepositoriesParams} params
 * @returns {Promise<FetchAndSaveCodeRepositoriesResult>}
 */
export const fetchAndSaveCodeRepositories = async (
  params: FetchAndSaveCodeRepositoriesParams,
): Promise<FetchAndSaveCodeRepositoriesResult> => {
  let ownerId = params.ownerId;

  if (!ownerId) {
    const user = await findByGithubUsername({
      githubUsername: params.githubUsername,
    });

    if (isFailure(user)) return user;

    if (!user.data)
      return failure<FetchAndSaveCodeRepositoriesError>({
        code: 'NOT_FOUND',
        cause: {
          message: 'User not found',
          username: params.githubUsername,
        },
      });

    ownerId = user.data.id;
  }

  let totalSaved = 0;
  let totalFailed = 0;

  for await (const repositories of getGitHubUserRepositoriesStream({
    username: params.githubUsername,
  })) {
    const languages = await fetchLanguagesForRepositories({
      githubUsername: params.githubUsername,
      repositories,
    });

    if (isFailure(languages)) {
      totalFailed += repositories.length;
      continue;
    }

    totalSaved += repositories.length;

    if (isFailure(languages)) return languages;

    const savedRepositories = await db.codeRepositories.saveMany(
      repositories.map((r, i) => ({
        ownerId,
        name: r.name,
        description: r.description,
        remoteName: 'github',
        languages: languages.data[i],
      })),
    );

    if (isFailure(savedRepositories)) {
      logger.error({
        message: 'Failed to save repositories',
        data: {
          errors: savedRepositories.error,
        },
      });

      totalFailed += repositories.length;
    }
  }

  return success({ totalSaved, totalFailed });
};

export type FetchLanguagesForRepositoriesParams = {
  githubUsername: string;
  repositories: GitHubRepository[];
};

export type FetchLanguagesForRepositoriesErrorCodes =
  | 'UNKNOWN'
  | GitHubErrorCodes;
export type FetchLanguagesForRepositoriesError =
  FailureError<FetchLanguagesForRepositoriesErrorCodes>;
export type FetchLanguagesForRepositoriesResult = Result<
  FetchLanguagesForRepositoriesError,
  ProgrammingLanguage[][]
>;

/**
 * Gets the languages for a list of repositories.
 * @param {FetchLanguagesForRepositoriesParams} params
 * @returns {Promise<FetchLanguagesForRepositoriesResult>}
 */
export const fetchLanguagesForRepositories = async (
  params: FetchLanguagesForRepositoriesParams,
): Promise<FetchLanguagesForRepositoriesResult> => {
  logger.info({
    message: 'Fetching languages for repositories',
    data: {
      githubUsername: params.githubUsername,
      repositories: params.repositories.length,
    },
  });

  const languages = await Promise.all(
    params.repositories.map(async (repository) => {
      const languages = await getGitHubRepositoryLanguages({
        username: params.githubUsername,
        repository: repository.name,
      });

      if (isFailure(languages)) return languages;

      return success(Object.keys(languages.data) as ProgrammingLanguage[]);
    }),
  );

  if (languages.some(isFailure)) {
    logger.error({
      message: 'Failed to get languages for repositories',
      data: {
        errors: languages.filter(isFailure).map((error) => error.error),
      },
    });
  }

  return success(languages.map((language) => language.data ?? []));
};
