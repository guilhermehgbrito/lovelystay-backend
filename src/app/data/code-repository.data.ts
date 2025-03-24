import { codeRepositorySql } from '@/lib/db/sql/code-repository';
import { failure, success, Result, FailureError } from '@/logic/result';
import { CodeRepository } from '../models/code-repository.model';
import { logger } from '@/lib/logger';
import { codeRepositoryMapper } from '../mappers/code-repository.mapper';
import { CodeRepositoryEntity } from '../entities/code-repository.entity';
import { db, pgp } from '@/lib/db';
import { IBaseProtocol } from 'pg-promise';

export type SaveCodeRepositoryParams = Omit<
  CodeRepository,
  'id' | 'createdAt' | 'updatedAt'
>;

export type SaveCodeRepositoryErrorCodes = 'UNKNOWN';
export type SaveCodeRepositoryError =
  FailureError<SaveCodeRepositoryErrorCodes>;

export type SaveCodeRepositoryResult = Result<
  SaveCodeRepositoryError,
  CodeRepository
>;

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
 * Save a code repository
 * @param {SaveCodeRepositoryParams} codeRepository
 * @param {IBaseProtocol<unknown>} conn
 * @returns {Promise<SaveCodeRepositoryResult>}
 */
export const saveCodeRepository = async (
  codeRepository: SaveCodeRepositoryParams,
  conn?: IBaseProtocol<unknown>,
): Promise<SaveCodeRepositoryResult> => {
  const connection = conn ?? db;
  try {
    const result = await connection.one<CodeRepository>(
      codeRepositorySql.saveCodeRepository,
      codeRepository,
    );
    return success(result);
  } catch (error) {
    return handleError(error);
  }
};

const saveManyColumns = new pgp.helpers.ColumnSet(
  ['owner_id', 'name', 'description', 'remote_name', 'languages'],
  { table: 'code_repositories' },
);

export type SaveManyCodeRepositoryResult = Result<
  SaveCodeRepositoryError,
  CodeRepository[]
>;

/**
 * Save many code repositories
 * @param {SaveCodeRepositoryParams[]} codeRepositories
 * @param {IBaseProtocol<unknown>} conn
 * @returns {Promise<SaveManyCodeRepositoryResult>}
 */
export const saveManyCodeRepositories = async (
  codeRepositories: SaveCodeRepositoryParams[],
  conn?: IBaseProtocol<unknown>,
): Promise<SaveManyCodeRepositoryResult> => {
  const connection = conn ?? db;
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
};
