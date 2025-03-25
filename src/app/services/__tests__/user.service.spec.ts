jest.mock('@/lib/github/api/users');
jest.mock('@/app/data/user.data');
jest.mock('@/app/services/code-repository.service');

import { success } from '@/logic/result';
import * as githubApi from '@/lib/github/api/users';
import {
  findByGithubUsername,
  fetchFromGithubAndSave,
  listUsers,
  filterUsers,
} from '@/app/services/user.service';
import * as userData from '@/app/data/user.data';
import * as codeRepositoryService from '@/app/services/code-repository.service';
import { generateMockUser } from '@/mocks/generators/models';
import { generateMockGitHubUser } from '@/mocks/generators/github';

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByGithubUsername', () => {
    it('should find a user by github username', async () => {
      const mockUser = generateMockUser();

      (userData.findByGithubUsername as jest.Mock).mockResolvedValueOnce(
        success(mockUser),
      );

      const result = await findByGithubUsername({
        githubUsername: mockUser.githubUsername,
      });

      expect(result).toEqual(success(mockUser));
    });
  });

  describe('fetchFromGithubAndSave', () => {
    it('should fetch user from GitHub and save to database', async () => {
      const mockGithubUser = generateMockGitHubUser();

      const mockSavedUser = generateMockUser({
        githubUsername: mockGithubUser.login,
      });

      (githubApi.getGitHubUser as jest.Mock).mockResolvedValueOnce(
        success(mockGithubUser),
      );
      (userData.saveUser as jest.Mock).mockResolvedValueOnce(
        success(mockSavedUser),
      );
      (
        codeRepositoryService.fetchAndSaveCodeRepositories as jest.Mock
      ).mockResolvedValueOnce(success({ totalSaved: 5, totalFailed: 0 }));

      const result = await fetchFromGithubAndSave({
        githubUsername: mockGithubUser.login,
      });

      expect(result).toEqual(success(mockSavedUser));
    });
  });

  describe('listUsers', () => {
    it('should return a list of users', async () => {
      const mockUsers = [generateMockUser(), generateMockUser()];

      (userData.listUsers as jest.Mock).mockResolvedValueOnce(
        success(mockUsers),
      );

      const result = await listUsers({});

      expect(result).toEqual(success(mockUsers));
    });

    it('should handle empty results', async () => {
      (userData.listUsers as jest.Mock).mockResolvedValueOnce(success([]));

      const result = await listUsers({});

      expect(result).toEqual(success([]));
    });
  });

  describe('filterUsers', () => {
    it('should filter users by languages', async () => {
      const mockUsers = [generateMockUser(), generateMockUser()];

      (userData.filterUsers as jest.Mock).mockResolvedValueOnce(
        success(mockUsers),
      );

      const result = await filterUsers({ languages: ['test'] });

      expect(result).toEqual(success(mockUsers));
    });

    it('should handle no matches', async () => {
      (userData.filterUsers as jest.Mock).mockResolvedValueOnce(success([]));

      const result = await filterUsers({ languages: ['nonexistent'] });

      expect(result).toEqual(success([]));
    });

    it('should handle empty languages', async () => {
      const mockUsers = [generateMockUser(), generateMockUser()];

      (userData.filterUsers as jest.Mock).mockResolvedValueOnce(
        success(mockUsers),
      );

      const result = await filterUsers({ languages: [] });

      expect(result).toEqual(success(mockUsers));
    });
  });
});
