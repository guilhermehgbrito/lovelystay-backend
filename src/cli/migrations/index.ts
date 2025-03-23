import { Command } from 'commander';
import { newMigration } from './new';
import { list } from './list';
import { up } from './up';

export const migrations = new Command()
  .command('migrations')
  .description('Migrations commands')
  .addHelpText('after', 'Example: $ migration new create_users_table')
  .addHelpText('after', 'Example: $ migration list')
  .addHelpText('after', 'Example: $ migration up');

migrations.addCommand(newMigration).addCommand(list).addCommand(up);
