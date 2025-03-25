import { success } from '@/logic/result';
import { asyncGeneratorMock } from '@/tests/utils/async-generator-mock';
import type {
  getGitHubRepositoryLanguages as _getGitHubRepositoryLanguages,
  getGitHubUserRepositories as _getGitHubUserRepositories,
  getGitHubUser as _getGitHubUser,
  getGitHubUserRepositoriesStream as _getGitHubUserRepositoriesStream,
} from '../users';
import {
  generateMockGitHubRepositories,
  generateMockGitHubRepositoryLanguages,
  generateMockGitHubUser,
} from '@/mocks/generators/github';

export const getGitHubUser = jest
  .fn<ReturnType<typeof _getGitHubUser>, Parameters<typeof _getGitHubUser>>()
  .mockResolvedValue(success(generateMockGitHubUser()));

export const getGitHubUserRepositories = jest
  .fn<
    ReturnType<typeof _getGitHubUserRepositories>,
    Parameters<typeof _getGitHubUserRepositories>
  >()
  .mockResolvedValue(
    success({
      repositories: generateMockGitHubRepositories(5),
      totalPages: 1,
      nextPage: null,
    }),
  );

export const getGitHubRepositoryLanguages = jest
  .fn<
    ReturnType<typeof _getGitHubRepositoryLanguages>,
    Parameters<typeof _getGitHubRepositoryLanguages>
  >()
  .mockResolvedValue(success(generateMockGitHubRepositoryLanguages()));

export const getGitHubUserRepositoriesStream = jest
  .fn<
    ReturnType<typeof _getGitHubUserRepositoriesStream>,
    Parameters<typeof _getGitHubUserRepositoriesStream>
  >()
  .mockReturnValue(
    asyncGeneratorMock([
      generateMockGitHubRepositories(5),
      generateMockGitHubRepositories(5),
    ]),
  );
