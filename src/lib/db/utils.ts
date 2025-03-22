import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pgp from 'pg-promise';

// @ts-expect-error This is a workaround to work on dev environment
const PATH = path.dirname(fileURLToPath(import.meta.url));

/**
 * Read a sql file
 * @param {string} name
 * @returns {pgp.QueryFile}
 */
export const sqlFile = (name: string): pgp.QueryFile => {
  return new pgp.QueryFile(path.join(PATH, 'sql', name), {
    minify: true,
  });
};
