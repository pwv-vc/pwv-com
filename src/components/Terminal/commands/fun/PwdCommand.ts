import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class PwdCommand extends BaseCommand {
  get name() {
    return 'pwd';
  }
  get aliases() {
    return ['pwd'];
  }
  get description() {
    return 'Print working directory';
  }
  get usage() {
    return 'pwd';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    const paths = [
      '/home/pwv/ventures',
      '/home/pwv/portfolio',
      '/usr/local/pwv/invest',
      '/opt/pwv/founders',
      '/var/pwv/startups',
    ];
    const randomPath = paths[Math.floor(Math.random() * paths.length)];
    
    return { 
      type: 'text', 
      content: `${randomPath}\n\n(Just kidding, you're in a web terminal. Type 'help' for real commands.)`
    };
  }
}
