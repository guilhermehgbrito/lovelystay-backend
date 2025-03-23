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

export type ListUsersParams = {
  page: number;
  limit?: number;
};

export type ListUsersErrorCodes = 'UNKNOWN';
export type ListUsersError = FailureError<ListUsersErrorCodes>;

export type ListUsersResult = Result<ListUsersError, User[]>;

export type FilterUsersParams = {
  page: number;
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
  /**
   * List users
   * @param {ListUsersParams} params
   * @returns {Promise<ListUsersResult>}
   */
  listUsers: (params: ListUsersParams) => Promise<ListUsersResult>;
  /**
   * Filter users
   * @param {FilterUsersParams} params
   * @returns {Promise<FilterUsersResult>}
   */
  filterUsers: (params: FilterUsersParams) => Promise<FilterUsersResult>;
};

declare global {
  interface IExtensions {
    users: UserRepository;
  }
}
