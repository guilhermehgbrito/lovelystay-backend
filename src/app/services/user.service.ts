import { FailureError, isFailure, Result, success } from '@/logic/result';
import { SaveUserParams } from '../@types/user';
import { getGitHubUser } from '@/lib/github/api/users';
import { db } from '@/lib/db';
import { GitHubErrorCodes } from '@/lib/github/types';
import { User } from '../models/user.model';

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

  const userFromGithub = await getGitHubUser({
    username: params.githubUsername,
  });

  if (isFailure(userFromGithub)) return userFromGithub;

  return findFromGithubAndSave(params);
};

/**
 * Find a user from the github api and save it to the database
 * @param {FindByGithubUsernameParams} params
 * @returns {Promise<FindByGithubUsernameResult>}
 */
export const findFromGithubAndSave = async (
  params: FindByGithubUsernameParams,
): Promise<FindByGithubUsernameResult> => {
  const userFromGithub = await getGitHubUser({
    username: params.githubUsername,
  });

  if (isFailure(userFromGithub)) return userFromGithub;

  const user: SaveUserParams = {
    githubId: userFromGithub.data.id,
    githubUsername: userFromGithub.data.login,
    name: userFromGithub.data.name || userFromGithub.data.login,
    email: userFromGithub.data.email,
    location: userFromGithub.data.location,
    bio: userFromGithub.data.bio,
  };

  const userFromDb = await db.users.save(user);

  if (isFailure(userFromDb)) return userFromDb;

  return success(userFromDb.data!);
};
