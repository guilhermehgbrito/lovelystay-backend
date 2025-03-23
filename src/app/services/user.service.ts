import { FailureError, isFailure, Result, success } from '@/logic/result';
import { getGitHubUser } from '@/lib/github/api/users';
import { db } from '@/lib/db';
import { GitHubErrorCodes } from '@/lib/github/types';
import { User } from '../models/user.model';
import { fetchAndSaveCodeRepositories } from './code-repository.service';
import { userMapper } from '../mappers/user.mapper';

export type FindByGithubUsernameParams = {
  githubUsername: string;
};

export type FindByGithubUsernameErrorCodes = 'UNKNOWN' | GitHubErrorCodes;
export type FindByGithubUsernameError =
  FailureError<FindByGithubUsernameErrorCodes>;

export type FindByGithubUsernameResult = Result<
  FindByGithubUsernameError,
  User
>;

/**
 * Find a user by their github username, if the user does not exist in the database, it will be fetched from the github api and saved to the database
 * @param {FindByGithubUsernameParams} params
 * @returns {Promise<FindByGithubUsernameResult>}
 */
export const findByGithubUsername = async (
  params: FindByGithubUsernameParams,
): Promise<FindByGithubUsernameResult> => {
  const userFromDb = await db.users.findByGithubUsername(params);

  if (isFailure(userFromDb)) return userFromDb;

  if (userFromDb.data) return success(userFromDb.data);

  return await fetchFromGithubAndSave(params);
};

export type FetchFromGithubAndSaveParams = {
  githubUsername: string;
};

export type FetchFromGithubAndSaveErrorCodes = 'UNKNOWN' | GitHubErrorCodes;
export type FetchFromGithubAndSaveError =
  FailureError<FetchFromGithubAndSaveErrorCodes>;
export type FetchFromGithubAndSaveResult = Result<
  FetchFromGithubAndSaveError,
  User
>;

/**
 * Find a user from the github api and save it to the database
 * @param {FetchFromGithubAndSaveParams} params
 * @returns {Promise<FetchFromGithubAndSaveResult>}
 */
export const fetchFromGithubAndSave = async (
  params: FetchFromGithubAndSaveParams,
): Promise<FetchFromGithubAndSaveResult> => {
  const userFromGithub = await getGitHubUser({
    username: params.githubUsername,
  });

  if (isFailure(userFromGithub)) return userFromGithub;

  const userFromDb = await db.users.save(
    userMapper.fromGithubUserToSaveUserParams(userFromGithub.data),
  );

  if (isFailure(userFromDb)) return userFromDb;

  const repositoriesCount = await fetchAndSaveCodeRepositories({
    githubUsername: params.githubUsername,
    ownerId: userFromDb.data.id,
  });

  if (isFailure(repositoriesCount)) return repositoriesCount;

  return success(userFromDb.data);
};

export type ListUsersParams = {
  page: number;
  limit?: number;
};

export type ListUsersErrorCodes = 'UNKNOWN';
export type ListUsersError = FailureError<ListUsersErrorCodes>;
export type ListUsersResult = Result<ListUsersError, User[]>;

export const listUsers = async (
  params: ListUsersParams,
): Promise<ListUsersResult> => {
  const users = await db.users.listUsers(params);

  if (isFailure(users)) return users;

  return success(users.data);
};

export type FilterUsersParams = {
  page: number;
  limit?: number;
  location?: string;
  languages?: string[];
};

export type FilterUsersErrorCodes = 'UNKNOWN';
export type FilterUsersError = FailureError<FilterUsersErrorCodes>;
export type FilterUsersResult = Result<FilterUsersError, User[]>;

export const filterUsers = async (
  params: FilterUsersParams,
): Promise<FilterUsersResult> => {
  const users = await db.users.filterUsers(params);

  if (isFailure(users)) return users;

  return success(users.data);
};
