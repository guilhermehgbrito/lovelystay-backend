import pgPromise, { IDatabase } from 'pg-promise';
import { dbConfig } from './config';
import { createUserRepository } from '@/app/repositories/user.repository';
import { createCodeRepositoryRepository } from '@/app/repositories/code-repository.repository';

type ExtendedDatabase = IExtensions & IDatabase<IExtensions>;

export const pgp = pgPromise<IExtensions>({
  extend: (obj) => {
    obj.users = createUserRepository(obj, pgp);
    obj.codeRepositories = createCodeRepositoryRepository(obj, pgp);
  },
});

export const db: ExtendedDatabase = pgp(dbConfig.databaseUrl);
