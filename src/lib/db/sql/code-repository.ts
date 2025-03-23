import { sqlFile } from '@/lib/db/utils';

export const codeRepositorySql = {
  saveCodeRepository: sqlFile('code-repository/save.sql'),
};
