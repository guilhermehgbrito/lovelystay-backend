import { SaveUserParams } from '../@types/user';
import { GitHubUser } from '@/lib/github/types';

/**
 * Map a GitHubUser to a SaveUserParams
 * @param user - The GitHubUser to map
 * @returns The mapped SaveUserParams
 */
const fromGithubUserToSaveUserParams = (user: GitHubUser): SaveUserParams => {
  return {
    githubId: user.id,
    githubUsername: user.login,
    name: user.name || user.login,
    email: user.email,
    location: user.location,
    bio: user.bio,
  };
};

export const userMapper = {
  fromGithubUserToSaveUserParams,
};
