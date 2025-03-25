import { db } from '@/lib/db';
import { failure, success } from '@/logic/result';
import {
  saveCodeRepository,
  saveManyCodeRepositories,
} from '../code-repository.data';
import { generateMockCodeRepository } from '@/mocks/generators/models';
import { codeRepositoryMapper } from '@/app/mappers/code-repository.mapper';

jest.mock('@/lib/db');

describe('Code Repository Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveCodeRepository', () => {
    it('should save a single repository successfully', async () => {
      const mockRepo = generateMockCodeRepository();

      (db.one as jest.Mock).mockResolvedValueOnce(
        codeRepositoryMapper.fromModelToEntity(mockRepo),
      );

      const result = await saveCodeRepository(mockRepo);

      expect(result).toEqual(success(mockRepo));
      expect(db.one).toHaveBeenCalledTimes(1);
    });

    it('should return an error if the repository is not saved', async () => {
      (db.one as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to save repository'),
      );

      const result = await saveCodeRepository(generateMockCodeRepository());

      expect(result).toEqual(
        failure({
          code: 'UNKNOWN',
          message: 'Failed to save repository',
          cause: expect.any(Object),
        }),
      );
    });
  });

  describe('saveManyCodeRepositories', () => {
    it('should save multiple repositories successfully', async () => {
      const mockRepos = [
        generateMockCodeRepository(),
        generateMockCodeRepository(),
      ];

      (db.many as jest.Mock).mockResolvedValueOnce(
        mockRepos.map(codeRepositoryMapper.fromModelToEntity),
      );

      const result = await saveManyCodeRepositories(mockRepos);

      expect(result).toEqual(success(mockRepos));
      expect(db.many).toHaveBeenCalledTimes(1);
    });

    it('should return an error if the repositories are not saved', async () => {
      (db.many as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to save repositories'),
      );

      const result = await saveManyCodeRepositories([
        generateMockCodeRepository(),
        generateMockCodeRepository(),
      ]);

      expect(result).toEqual(
        failure({
          code: 'UNKNOWN',
          message: 'Failed to save repositories',
          cause: expect.any(Object),
        }),
      );
    });
  });
});
