import { success } from '@/logic/result';
import { Result } from '@/logic/result';
import { User } from '@/app/models/user.model';
import { generateMockUser } from '@/mocks/generators/models';

export const findByGithubUsername = jest.fn(
  async (params: {
    githubUsername: string;
  }): Promise<Result<never, User | null>> => {
    const mockUser = generateMockUser({
      githubUsername: params.githubUsername,
    });
    return success(mockUser);
  },
);

export const findOrCreateByGithubUsername = jest.fn(
  async (params: { githubUsername: string }): Promise<Result<never, User>> => {
    const mockUser = generateMockUser({
      githubUsername: params.githubUsername,
    });
    return success(mockUser);
  },
);

export const listUsers = jest.fn(
  async (params: {
    page?: number;
    limit?: number;
  }): Promise<Result<never, User[]>> => {
    const limit = params.limit ?? 10;
    const mockUsers = Array.from({ length: limit }, () => generateMockUser());
    return success(mockUsers);
  },
);

export const filterUsers = jest.fn(
  async (params: {
    page?: number;
    limit?: number;
    location?: string;
    languages?: string[];
  }): Promise<Result<never, (User & { languages: string[] })[]>> => {
    const limit = params.limit ?? 10;
    const mockUsers = Array.from({ length: limit }, () => ({
      ...generateMockUser(),
      languages: params.languages ?? ['JavaScript', 'TypeScript'],
    }));
    return success(mockUsers);
  },
);
