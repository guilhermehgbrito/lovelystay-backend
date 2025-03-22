import { IDatabase, IMain } from 'pg-promise';
import { User } from '../models/user.model';
import { failure, Result, success } from '@/logic/result';
import { userSql } from '@/lib/db/sql/user';
import {
  SaveUserError,
  SaveUserParams,
  UserRepository,
  FindByGithubUsernameParams,
} from '../@types/user';

const handleError = <T>(error: unknown): Result<SaveUserError, T> => {
  return failure<SaveUserError>({
    code: 'UNKNOWN',
    message: (error as Error)?.message,
    cause: {
      name: (error as Error)?.name,
      stack: (error as Error)?.stack,
    },
  });
};

/**
 * Create a new user repository
 * @param {IDatabase<IExtensions>} db
 * @returns {UserRepository}
 */
export const createUserRepository = (
  db: IDatabase<IExtensions>,
  _: IMain,
): UserRepository => {
  return {
    save: async (user: SaveUserParams) => {
      try {
        const result = await db.one<User>(userSql.saveUser, user);
        return success(result);
      } catch (error) {
        return handleError(error);
      }
    },
    findByGithubUsername: async (params: FindByGithubUsernameParams) => {
      try {
        const result = await db.oneOrNone<User>(
          userSql.findByGithubUsername,
          params,
        );
        if (!result) return success(null);
        return success(result);
      } catch (error) {
        return handleError(error);
      }
    },
  };
};
