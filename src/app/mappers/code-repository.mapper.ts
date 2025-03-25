import { CodeRepositoryEntity } from '../entities/code-repository.entity';
import {
  CodeRepository,
  CodeRepositoryRemote,
  ProgrammingLanguage,
} from '../models/code-repository.model';

/**
 * Map a CodeRepositoryEntity to a CodeRepository model
 * @param entity - The CodeRepositoryEntity to map
 * @returns The mapped CodeRepository model
 */
const fromEntityToModel = (entity: CodeRepositoryEntity): CodeRepository => {
  return {
    id: entity.id,
    ownerId: entity.owner_id,
    name: entity.name,
    description: entity.description,
    remoteName: entity.remote_name as CodeRepositoryRemote,
    languages: entity.languages as ProgrammingLanguage[],
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
};

/**
 * Map a CodeRepository model to a CodeRepositoryEntity
 * @param model - The CodeRepository model to map
 * @returns The mapped CodeRepositoryEntity
 */
const fromModelToEntity = (model: CodeRepository): CodeRepositoryEntity => {
  return {
    id: model.id,
    owner_id: model.ownerId,
    remote_name: model.remoteName,
    name: model.name,
    description: model.description,
    languages: model.languages,
    created_at: model.createdAt,
    updated_at: model.updatedAt,
  };
};

export const codeRepositoryMapper = {
  fromEntityToModel,
  fromModelToEntity,
};
