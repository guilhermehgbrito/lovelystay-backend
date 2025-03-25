import {
  success,
  isFailure,
  Result,
  FailureError,
  failure,
  Success,
} from '@/logic/result';
import { findByGithubUsername } from './user.service';
import { GitHubErrorCodes, GitHubRepository } from '@/lib/github/types';
import {
  getGitHubRepositoryLanguages,
  getGitHubUserRepositoriesStream,
} from '@/lib/github/api/users';
import { ProgrammingLanguage } from '../models/code-repository.model';
import { logger } from '@/lib/logger';
import { saveManyCodeRepositories } from '../data/code-repository.data';

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

  let repositoryCount = 0;
  let totalFailed = 0;

  for await (const repositories of getGitHubUserRepositoriesStream({
    username: params.githubUsername,
  })) {
    const languages = await fetchLanguagesForRepositories({
      githubUsername: params.githubUsername,
      repositories,
    });

    const savedRepositories = await saveManyCodeRepositories(
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

    repositoryCount += repositories.length;
  }

  return success({ totalSaved: repositoryCount - totalFailed, totalFailed });
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
export type FetchLanguagesForRepositoriesResult = Success<
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
