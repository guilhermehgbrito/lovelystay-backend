import { failure, FailureError, Result, success } from '@/logic/result';
import { userSql } from '@/lib/db/sql/user';
import { USER_LISTING_DEFAULT_LIMIT } from '../constants/user.constants';
import { UserEntity } from '../entities/user.entity';
import { userMapper } from '../mappers/user.mapper';
import { User } from '../models/user.model';
import { db, pgp } from '@/lib/db';
import { IBaseProtocol } from 'pg-promise';

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

export type SaveUserParams = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export type SaveUserErrorCodes = 'UNKNOWN';
export type SaveUserError = FailureError<SaveUserErrorCodes>;

export type SaveUserResult = Result<SaveUserError, User>;

/**
 * Save a user
 * @param {SaveUserParams} user
 * @param {IBaseProtocol<unknown>} conn
 * @returns {Promise<SaveUserResult>}
 */
export const saveUser = async (
  user: SaveUserParams,
  conn?: IBaseProtocol<unknown>,
): Promise<SaveUserResult> => {
  const connection = conn ?? db;

  try {
    const result = await connection.one<UserEntity>(userSql.saveUser, user);
    return success(userMapper.fromEntityToModel(result));
  } catch (error) {
    return handleError(error);
  }
};

export type FindByGithubUsernameParams = {
  githubUsername: string;
};

export type FindByGithubUsernameErrorCodes = 'UNKNOWN';
export type FindByGithubUsernameError =
  FailureError<FindByGithubUsernameErrorCodes>;

export type FindByGithubUsernameResult = Result<
  FindByGithubUsernameError,
  User | null
>;

/**
 * Find a user by their github username
 * @param {FindByGithubUsernameParams} params
 * @returns {Promise<FindByGithubUsernameResult>}
 */
export const findByGithubUsername = async (
  params: FindByGithubUsernameParams,
): Promise<FindByGithubUsernameResult> => {
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
};

export type ListUsersParams = {
  page?: number;
  limit?: number;
};

export type ListUsersErrorCodes = 'UNKNOWN';
export type ListUsersError = FailureError<ListUsersErrorCodes>;

export type ListUsersResult = Result<ListUsersError, User[]>;

/**
 * List users
 * @param {ListUsersParams} params
 * @param {IBaseProtocol<unknown>} conn
 * @returns {Promise<ListUsersResult>}
 */
export const listUsers = async (
  params: ListUsersParams,
  conn?: IBaseProtocol<unknown>,
): Promise<ListUsersResult> => {
  const connection = conn ?? db;

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
};

export type FilterUsersParams = {
  page?: number;
  limit?: number;
  location?: string;
  languages?: string[];
};

export type FilterUsersErrorCodes = 'UNKNOWN';
export type FilterUsersError = FailureError<FilterUsersErrorCodes>;

export type UserWithLanguages = User & {
  languages: string[];
};

export type FilterUsersResult = Result<FilterUsersError, UserWithLanguages[]>;

/**
 * Filter users
 * @param {FilterUsersParams} params
 * @param {IBaseProtocol<unknown>} conn
 * @returns {Promise<FilterUsersResult>}
 */
export const filterUsers = async (
  params: FilterUsersParams,
  conn?: IBaseProtocol<unknown>,
): Promise<FilterUsersResult> => {
  const connection = conn ?? db;

  const {
    limit = USER_LISTING_DEFAULT_LIMIT,
    page = 1,
    location,
    languages,
  } = params;

  const uniqueLanguages = [...new Set(languages)];
  const conditions = [];
  const values: Record<string, unknown> = {
    limit,
    offset: (page - 1) * limit,
  };

  if (uniqueLanguages.length > 0) {
    conditions.push(
      '"get_user_languages"("users"."id") @> ${languages}::text[]',
    );
    values.languages = uniqueLanguages;
  }

  if (location) {
    conditions.push('LOWER(location) = LOWER(${location})');
    values.location = location;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const select = pgp.as.format(
    `
    SELECT 
      "users"."id",
      "users"."github_id", 
      "users"."github_username",
      "users"."name",
      "users"."email",
      "users"."location",
      "users"."bio",
      "users"."created_at",
      "users"."updated_at",
      "get_user_languages"("users"."id") AS "languages"
    FROM "users"
    ${whereClause}
    LIMIT $(limit) OFFSET $(offset)
  `,
    values,
  );

  try {
    const result = await connection.manyOrNone<
      UserEntity & { languages: string[] }
    >(select);
    return success(
      result.map((user) => ({
        ...userMapper.fromEntityToModel(user),
        languages: user.languages,
      })),
    );
  } catch (error) {
    return handleError(error);
  }
};
