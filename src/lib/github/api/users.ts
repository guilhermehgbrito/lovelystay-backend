import { failure, isFailure, Result, success } from '@/logic/result';
import { getBaseRequest } from '../config';
import {
  GitHubError,
  GitHubRepository,
  GitHubRepositoryLanguages,
  GitHubUser,
} from '../types';
import parseLinkHeader from 'parse-link-header';
import { handleGitHubError } from '../utils';
import { logger } from '@/lib/logger';

type GetGitHubUserParams = {
  username: string;
  signal?: AbortSignal;
};

export const getGitHubUser = async ({
  username,
  signal,
}: GetGitHubUserParams): Promise<Result<GitHubError, GitHubUser>> => {
  try {
    const response = await fetch(getBaseRequest(`/users/${username}`), {
      signal,
    });

    if (!response.ok) {
      return handleGitHubError(response);
    }

    return success((await response.json()) as GitHubUser);
  } catch (error) {
    return failure<GitHubError>({
      code: 'UNKNOWN',
      cause: error,
    });
  }
};

type GetGitHubUserRepositoriesParams = {
  username: string;
  page?: number;
  signal?: AbortSignal;
};

type GetGitHubUserRepositoriesResult = Result<
  GitHubError,
  {
    repositories: GitHubRepository[];
    totalPages: number;
    nextPage: number | null;
  }
>;
export const getGitHubUserRepositories = async ({
  username,
  page = 1,
  signal,
}: GetGitHubUserRepositoriesParams): Promise<GetGitHubUserRepositoriesResult> => {
  if (page < 1) {
    return failure<GitHubError>({
      code: 'INVALID_PAGE',
      message: 'Page must be greater than 0',
      cause: {
        page,
      },
    });
  }

  try {
    const response = await fetch(
      getBaseRequest(`/users/${username}/repos?page=${page}`),
      {
        signal,
      },
    );

    if (!response.ok) {
      return handleGitHubError(response);
    }

    const data = await response.json();
    const linkHeader = response.headers.get('link');
    const links = parseLinkHeader(linkHeader);
    const totalPages = links?.last?.page ? parseInt(links.last.page) : 1;

    return success({
      repositories: data as GitHubRepository[],
      totalPages,
      nextPage: totalPages > page ? page + 1 : null,
    });
  } catch (error) {
    return failure<GitHubError>({
      code: 'UNKNOWN',
      cause: error,
    });
  }
};

/**
 * Fetches a stream of GitHub repositories for a user.
 *
 * Returns a generator that yields chunks of repositories.
 * @param {GetGitHubUserRepositoriesParams} params
 * @returns {AsyncGenerator<GitHubRepository[], void, unknown>}
 * @example
 * for await (const repositories of getGitHubUserRepositoriesStream({ username: 'octocat' })) {
 *   console.log(repositories);
 * }
 */
export const getGitHubUserRepositoriesStream = async function* ({
  username,
  signal,
  page = 1,
}: GetGitHubUserRepositoriesParams): AsyncGenerator<
  GitHubRepository[],
  void,
  unknown
> {
  let nextPage: number | null = page;

  while (nextPage) {
    const response = await getGitHubUserRepositories({
      username,
      page: nextPage,
      signal,
    });

    if (isFailure(response)) {
      logger.error({
        message: 'Failed to get repositories',
        data: {
          error: response.error,
        },
      });

      break;
    }

    yield response.data.repositories;

    nextPage = response.data.nextPage;
  }
};

type GetGitHubRepositoryLanguagesParams = {
  username: string;
  repository: string;
  signal?: AbortSignal;
};

/**
 * Fetches the languages for a GitHub repository.
 * @param {GetGitHubRepositoryLanguagesParams} params
 * @returns {Promise<Result<GitHubError, GitHubRepositoryLanguages>>}
 */
export const getGitHubRepositoryLanguages = async ({
  username,
  repository,
  signal,
}: GetGitHubRepositoryLanguagesParams): Promise<
  Result<GitHubError, GitHubRepositoryLanguages>
> => {
  try {
    const response = await fetch(
      getBaseRequest(`/repos/${username}/${repository}/languages`),
      {
        signal,
      },
    );

    if (!response.ok) {
      return handleGitHubError(response);
    }

    return success((await response.json()) as GitHubRepositoryLanguages);
  } catch (error) {
    return failure<GitHubError>({
      code: 'UNKNOWN',
      cause: error,
    });
  }
};
