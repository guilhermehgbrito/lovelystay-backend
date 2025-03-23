import { codeRepositorySql } from '@/lib/db/sql/code-repository';
import { IDatabase, IMain } from 'pg-promise';
import {
  CodeRepositoryRepository,
  SaveCodeRepositoryParams,
  SaveCodeRepositoryError,
} from '@/app/@types/code-repository';
import { failure, success, Result } from '@/logic/result';
import { CodeRepository } from '../models/code-repository.model';
import { logger } from '@/lib/logger';
import { codeRepositoryMapper } from '../mappers/code-repository.mapper';
import { CodeRepositoryEntity } from '../entities/code-repository.entity';

const handleError = <T>(error: unknown): Result<SaveCodeRepositoryError, T> => {
  logger.error({
    message: 'Failed to save code repository(ies)',
    error: {
      name: (error as Error)?.name,
      stack: (error as Error)?.stack,
      message: (error as Error)?.message,
    },
  });
  return failure<SaveCodeRepositoryError>({
    code: 'UNKNOWN',
    message: (error as Error)?.message,
    cause: {
      name: (error as Error)?.name,
      stack: (error as Error)?.stack,
    },
  });
};

/**
 * Create a new code repository repository
 * @param {IDatabase<IExtensions>} db
 * @returns {CodeRepositoryRepository}
 */
export const createCodeRepositoryRepository = (
  db: IDatabase<IExtensions>,
  pgp: IMain,
): CodeRepositoryRepository => {
  const saveManyColumns = new pgp.helpers.ColumnSet(
    ['owner_id', 'name', 'description', 'remote_name', 'languages'],
    { table: 'code_repositories' },
  );

  return {
    save: async (codeRepository: SaveCodeRepositoryParams) => {
      try {
        const result = await db.one<CodeRepository>(
          codeRepositorySql.saveCodeRepository,
          codeRepository,
        );
        return success(result);
      } catch (error) {
        return handleError(error);
      }
    },
    saveMany: async (codeRepositories: SaveCodeRepositoryParams[]) => {
      try {
        const insertQuery = pgp.helpers.insert(
          codeRepositories.map((r) => ({
            ...r,
            owner_id: r.ownerId,
            remote_name: r.remoteName,
          })),
          saveManyColumns,
        );
        const onConflict =
          'ON CONFLICT ("owner_id", "name") DO UPDATE SET ' +
          saveManyColumns.assignColumns({ from: 'EXCLUDED' });
        const returning =
          'RETURNING "id", "owner_id", "name", "description", "remote_name", "languages", "created_at", "updated_at"';
        const result = await db.many<CodeRepositoryEntity>(
          `${insertQuery} ${onConflict} ${returning}`,
        );
        return success(result.map(codeRepositoryMapper.fromEntityToModel));
      } catch (error) {
        return handleError(error);
      }
    },
  };
};
