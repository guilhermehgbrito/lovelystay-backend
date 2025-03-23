import { IDatabase, IMain } from 'pg-promise';
import { failure, Result, success } from '@/logic/result';
import { userSql } from '@/lib/db/sql/user';
import {
  SaveUserError,
  SaveUserParams,
  UserRepository,
  FindByGithubUsernameParams,
  ListUsersParams,
  FilterUsersParams,
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
  pgp: IMain,
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
    filterUsers: async (params: FilterUsersParams) => {
      const {
        limit = USER_LISTING_DEFAULT_LIMIT,
        page = 1,
        location,
        languages,
      } = params;

      const uniqueLanguages = [...new Set(languages)];

      const languagesTsQuery =
        uniqueLanguages.length > 0
          ? pgp.as.format(
              'array_to_tsvector(get_user_languages("users"."id")) @@ to_tsquery($1)',
              uniqueLanguages.join(' & '),
            )
          : '1=1';
      const locationWhereClause = location
        ? pgp.as.format('LOWER(location) = LOWER($1)', location)
        : '1=1';

      const select = `
        SELECT "users"."id", "users"."github_id", "users"."github_username", "users"."name", "users"."email", "users"."location", "users"."bio", "users"."created_at", "users"."updated_at", get_user_languages("users"."id") AS "languages"
        FROM "users"
        WHERE ${locationWhereClause} AND ${languagesTsQuery}
      `;

      const limitOffset = pgp.as.format('LIMIT $1 OFFSET $2', [
        limit,
        (page - 1) * limit,
      ]);

      try {
        const result = await db.manyOrNone<
          UserEntity & { languages: string[] }
        >(`${select} ${limitOffset}`);
        return success(
          result.map((user) => ({
            ...userMapper.fromEntityToModel(user),
            languages: user.languages,
          })),
        );
      } catch (error) {
        return handleError(error);
      }
    },
  };
};
