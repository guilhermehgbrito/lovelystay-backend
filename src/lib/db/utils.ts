import path from 'node:path';
import pgp from 'pg-promise';

const SQL_FILES_PATH = path.join(process.cwd(), 'sql');

/**
 * Read a sql file
 * @param {string} name
 * @returns {pgp.QueryFile}
 */
export const sqlFile = (name: string): pgp.QueryFile => {
  return new pgp.QueryFile(path.join(SQL_FILES_PATH, name), {
    minify: true,
  });
};
