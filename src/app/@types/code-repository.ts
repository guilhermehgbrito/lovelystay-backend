import { Result } from '@/logic/result';
import { FailureError } from '@/logic/result';
import { CodeRepository } from '../models/code-repository.model';

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
export type SaveManyCodeRepositoryResult = Result<
  SaveCodeRepositoryError,
  CodeRepository[]
>;

export type CodeRepositoryRepository = {
  /**
   * Save a code repository
   * @param {SaveCodeRepositoryParams} codeRepository
   * @returns {Promise<SaveCodeRepositoryResult>}
   */
  save: (
    codeRepository: SaveCodeRepositoryParams,
  ) => Promise<SaveCodeRepositoryResult>;
  /**
   * Save many code repositories
   * @param {SaveCodeRepositoryParams[]} codeRepositories
   * @returns {Promise<SaveManyCodeRepositoryResult>}
   */
  saveMany: (
    codeRepositories: SaveCodeRepositoryParams[],
  ) => Promise<SaveManyCodeRepositoryResult>;
};

declare global {
  interface IExtensions {
    codeRepositories: CodeRepositoryRepository;
  }
}
