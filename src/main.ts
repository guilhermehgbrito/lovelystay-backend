import { program } from './cli';
import { logger } from './lib/logger';
import { db } from './lib/db';

/**
 * Handle shutdown of the application
 */
const handleShutdown = async () => {
  if (db.$pool.ending || db.$pool.ended) return;

  await db.$pool.end();
};

/**
 * Add shutdown hooks to gracefully shutdown the application
 */
const addShutdownHooks = () => {
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    const handler = async () => {
      logger.info(`Received ${signal}, shutting down...`);
      await handleShutdown();
    };

    process.once(signal, handler);
  });
};

/**
 * Main entry point of the application
 */
export const main = async () => {
  await program
    .showHelpAfterError()
    .showSuggestionAfterError()
    .parseAsync(process.argv);
};

addShutdownHooks();

main()
  .then(async () => {
    await handleShutdown();
  })
  .catch((error) => {
    logger.error({
      message: 'An error occurred',
      error: error.message,
      stack: error.stack,
    });
  });
