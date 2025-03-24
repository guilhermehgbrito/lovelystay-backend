import pgPromise from 'pg-promise';
import { dbConfig } from './config';

export const pgp = pgPromise();

export const db = pgp(dbConfig.databaseUrl);
