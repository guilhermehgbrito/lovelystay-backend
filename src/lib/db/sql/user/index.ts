import { sqlFile } from '@/lib/db/utils';

export const userSql = {
  saveUser: sqlFile('user/save.sql'),
  findByGithubUsername: sqlFile('user/find-by-github-username.sql'),
};
