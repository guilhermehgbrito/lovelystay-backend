import { Result } from '@/logic/result';
import { FailureError } from '@/logic/result';
import { User } from '../models/user.model';

export type SaveUserParams = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export type SaveUserErrorCodes = 'UNKNOWN';
export type SaveUserError = FailureError<SaveUserErrorCodes>;

export type SaveUserResult = Result<SaveUserError, User>;

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

export type UserRepository = {
  /**
   * Save a user
   * @param {SaveUserParams} user
   * @returns {Promise<SaveUserResult>}
   */
  save: (user: SaveUserParams) => Promise<SaveUserResult>;
  /**
   * Find a user by their github username
   * @param {FindByGithubUsernameParams} params
   * @returns {Promise<FindByGithubUsernameResult>}
   */
  findByGithubUsername: (
    params: FindByGithubUsernameParams,
  ) => Promise<FindByGithubUsernameResult>;
};

declare global {
  interface IExtensions {
    users: UserRepository;
  }
}
