import { success } from '@/logic/result';
import { Result } from '@/logic/result';
import { IBaseProtocol } from 'pg-promise';
import { CodeRepository } from '@/app/models/code-repository.model';
import { generateMockCodeRepository } from '@/mocks/generators/models';

export const saveManyCodeRepositories = jest.fn(
  async (
    repositories: Omit<CodeRepository, 'id' | 'createdAt' | 'updatedAt'>[],
    conn?: IBaseProtocol<unknown>,
  ): Promise<Result<never, CodeRepository[]>> => {
    const mockRepositories = repositories.map((repo) =>
      generateMockCodeRepository(repo),
    );
    return success(mockRepositories);
  },
);

export const saveCodeRepository = jest.fn(
  async (
    repository: Omit<CodeRepository, 'id' | 'createdAt' | 'updatedAt'>,
    conn?: IBaseProtocol<unknown>,
  ): Promise<Result<never, CodeRepository>> => {
    const mockRepository = generateMockCodeRepository(repository);
    return success(mockRepository);
  },
);
