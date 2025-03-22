import pgPromise, { IDatabase } from 'pg-promise';
import { dbConfig } from './config';
import { createUserRepository } from '@/app/repositories/user.repository';

type ExtendedDatabase = IExtensions & IDatabase<IExtensions>;

export const pgp = pgPromise<IExtensions>({
  extend: (obj) => {
    obj.users = createUserRepository(obj, pgp);
  },
});

export const db: ExtendedDatabase = pgp(dbConfig.databaseUrl);
