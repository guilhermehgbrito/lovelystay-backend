import { Command } from 'commander';
import { pull } from './pull';

export const codeRepository = new Command()
  .command('repo')
  .description('Code repository commands');

codeRepository.addCommand(pull);
