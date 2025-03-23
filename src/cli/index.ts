import { Command } from 'commander';
import { migrations } from './migrations';
import { user } from './user';
import { codeRepository } from './code-repository';

export const program = new Command()
  .name('gs')
  .description(
    'GitHub Scraper CLI - Scrape GitHub data and save it to a database',
  )
  .addCommand(migrations)
  .addCommand(user)
  .addCommand(codeRepository);
