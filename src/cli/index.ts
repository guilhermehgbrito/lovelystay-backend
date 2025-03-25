import { Command } from 'commander';
import { codeRepository } from './code-repository';
import { migrations } from './migrations';
import { user } from './user';

export const program = new Command()
  .name('gs')
  .description(
    'GitHub Scraper CLI - Scrape GitHub data and save it to a database',
  )
  .addCommand(migrations)
  .addCommand(user)
  .addCommand(codeRepository);
