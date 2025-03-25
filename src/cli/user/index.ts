import { Command } from 'commander';
import { listUserCommand } from './list';
import { getUserCommand } from './get';

export const user = new Command().command('user').description('User commands');

user.addCommand(listUserCommand).addCommand(getUserCommand);
