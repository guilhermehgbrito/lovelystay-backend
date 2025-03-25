import { success } from '@/logic/result';
import { generateMockUser } from '@/mocks/generators/models';
import { User } from '@/app/models/user.model';
import { IBaseProtocol } from 'pg-promise';
import { Result } from '@/logic/result';

export const saveUser = jest.fn(
  async (
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
    conn?: IBaseProtocol<unknown>,
  ): Promise<Result<never, User>> => {
    const mockUser = generateMockUser(user);
    return success(mockUser);
  },
);

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

export const listUsers = jest.fn(
  async (
    params: { page?: number; limit?: number },
    conn?: IBaseProtocol<unknown>,
  ): Promise<Result<never, User[]>> => {
    const limit = params.limit ?? 10;
    const mockUsers = Array.from({ length: limit }, () => generateMockUser());
    return success(mockUsers);
  },
);

export const filterUsers = jest.fn(
  async (
    params: {
      page?: number;
      limit?: number;
      location?: string;
      languages?: string[];
    },
    conn?: IBaseProtocol<unknown>,
  ): Promise<Result<never, (User & { languages: string[] })[]>> => {
    const limit = params.limit ?? 10;
    const mockUsers = Array.from({ length: limit }, () => ({
      ...generateMockUser(),
      languages: params.languages ?? ['JavaScript', 'TypeScript'],
    }));
    return success(mockUsers);
  },
);
