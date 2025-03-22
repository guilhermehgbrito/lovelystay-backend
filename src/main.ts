import { getGitHubUser } from './lib/github/api/users';
import { logger } from './lib/logger';
import { isFailure } from './logic/result';

export const main = async () => {
  const args = process.argv.slice(2);
  const username = args[0];

  const user = await getGitHubUser({ username });

  if (isFailure(user)) {
    logger.error(user.error);
    return;
  }

  logger.info({
    login: user.data.login,
    name: user.data.name,
    email: user.data.email,
    location: user.data.location,
    bio: user.data.bio,
  });
};

main();
