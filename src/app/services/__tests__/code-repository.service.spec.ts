jest.mock('@/lib/github/api/users');
jest.mock('@/app/services/user.service');
jest.mock('@/app/data/code-repository.data');

import { success } from '@/logic/result';
import * as githubApi from '@/lib/github/api/users';
import {
  fetchAndSaveCodeRepositories,
  fetchLanguagesForRepositories,
} from '../code-repository.service';
import * as userService from '../user.service';
import * as codeRepositoryData from '../../data/code-repository.data';
import {
  generateMockGitHubRepositories,
  generateMockGitHubRepositoryLanguages,
} from '@/mocks/generators/github';
import { generateMockUser } from '@/mocks/generators/models';

describe('Code Repository Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAndSaveCodeRepositories', () => {
    it('should fetch and save repositories for a user', async () => {
      const mockUser = generateMockUser();

      const mockRepositories = generateMockGitHubRepositories(2);

      const mockLanguages = generateMockGitHubRepositoryLanguages();

      (userService.findByGithubUsername as jest.Mock).mockResolvedValueOnce(
        success(mockUser),
      );
      (
        githubApi.getGitHubUserRepositoriesStream as jest.Mock
      ).mockImplementation(async function* () {
        yield mockRepositories;
      });
      (githubApi.getGitHubRepositoryLanguages as jest.Mock).mockResolvedValue(
        success(mockLanguages),
      );
      (
        codeRepositoryData.saveManyCodeRepositories as jest.Mock
      ).mockResolvedValue(
        success(mockRepositories.map((repository) => repository)),
      );

      const result = await fetchAndSaveCodeRepositories({
        githubUsername: mockUser.githubUsername,
      });

      expect(result).toEqual(success({ totalSaved: 2, totalFailed: 0 }));
    });
  });

  describe('fetchLanguagesForRepositories', () => {
    it('should fetch languages for multiple repositories', async () => {
      const mockRepositories = generateMockGitHubRepositories(2);

      const mockLanguages = generateMockGitHubRepositoryLanguages();

      (
        githubApi as jest.Mocked<typeof githubApi>
      ).getGitHubRepositoryLanguages.mockResolvedValue(success(mockLanguages));

      const result = await fetchLanguagesForRepositories({
        githubUsername: 'testuser',
        repositories: mockRepositories,
      });

      expect(result).toEqual(
        success([Object.keys(mockLanguages), Object.keys(mockLanguages)]),
      );
    });
  });
});
