import { SaveUserParams } from '../@types/user';
import { GitHubUser } from '@/lib/github/types';
import { UserEntity } from '../entities/user.entity';
import { User } from '../models/user.model';

/**
 * Map a GitHubUser to a SaveUserParams
 * @param user - The GitHubUser to map
 * @returns The mapped SaveUserParams
 */
const fromGithubUserToSaveUserParams = (user: GitHubUser): SaveUserParams => {
  return {
    githubId: user.id,
    githubUsername: user.login.toLowerCase(),
    name: user.name || user.login,
    email: user.email,
    location: user.location,
    bio: user.bio,
  };
};

/**
 * Map a UserEntity to a User model
 * @param entity - The UserEntity to map
 * @returns The mapped User model
 */
const fromEntityToModel = (entity: UserEntity): User => {
  return {
    id: entity.id,
    githubId: entity.github_id,
    githubUsername: entity.github_username,
    name: entity.name,
    email: entity.email,
    location: entity.location,
    bio: entity.bio,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
};

/**
 * Map a User model to a UserEntity
 * @param model - The User model to map
 * @returns The mapped UserEntity
 */
const fromModelToEntity = (model: User): UserEntity => {
  return {
    id: model.id,
    github_id: model.githubId,
    github_username: model.githubUsername,
    name: model.name,
    email: model.email,
    location: model.location,
    bio: model.bio,
    created_at: model.createdAt,
    updated_at: model.updatedAt,
  };
};

export const userMapper = {
  fromGithubUserToSaveUserParams,
  fromEntityToModel,
  fromModelToEntity,
};
