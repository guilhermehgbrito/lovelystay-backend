import { failure, Result, success } from '@/logic/result';
import { getBaseRequest } from '../config';
import {
  GitHubError,
  GitHubRepository,
  GitHubRepositoryLanguages,
  GitHubUser,
} from '../types';
import { handleGitHubError } from '../utils';

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
  signal?: AbortSignal;
};

export const getGitHubUserRepositories = async ({
  username,
  signal,
}: GetGitHubUserRepositoriesParams): Promise<
  Result<GitHubError, GitHubRepository[]>
> => {
  try {
    const response = await fetch(getBaseRequest(`/users/${username}/repos`), {
      signal,
    });

    if (!response.ok) {
      return handleGitHubError(response);
    }

    return success((await response.json()) as GitHubRepository[]);
  } catch (error) {
    return failure<GitHubError>({
      code: 'UNKNOWN',
      cause: error,
    });
  }
};

type GetGitHubRepositoryLanguagesParams = {
  username: string;
  repository: string;
  signal?: AbortSignal;
};

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
