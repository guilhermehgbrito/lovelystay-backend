import { IDatabase, IMain } from 'pg-promise';
import { failure, Result, success } from '@/logic/result';
import { userSql } from '@/lib/db/sql/user';
import {
  SaveUserError,
  SaveUserParams,
  UserRepository,
  FindByGithubUsernameParams,
  ListUsersParams,
} from '../@types/user';
import { USER_LISTING_DEFAULT_LIMIT } from '../constants/user.constants';
import { UserEntity } from '../entities/user.entity';
import { userMapper } from '../mappers/user.mapper';

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
        const result = await db.one<UserEntity>(userSql.saveUser, user);
        return success(userMapper.fromEntityToModel(result));
      } catch (error) {
        return handleError(error);
      }
    },
    findByGithubUsername: async (params: FindByGithubUsernameParams) => {
      try {
        const result = await db.oneOrNone<UserEntity>(
          userSql.findByGithubUsername,
          params,
        );
        if (!result) return success(null);
        return success(userMapper.fromEntityToModel(result));
      } catch (error) {
        return handleError(error);
      }
    },
    listUsers: async (params: ListUsersParams) => {
      const { limit = USER_LISTING_DEFAULT_LIMIT, page = 1 } = params;

      try {
        const result = await db.manyOrNone<UserEntity>(userSql.listUsers, {
          limit,
          offset: (page - 1) * limit,
        });
        return success(result.map(userMapper.fromEntityToModel));
      } catch (error) {
        return handleError(error);
      }
    },
  };
};
