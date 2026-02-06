import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class ClearCommand extends BaseCommand {
  get name() {
    return 'clear';
  }
  get aliases() {
    return ['clear', 'cls'];
  }
  get description() {
    return 'Clear the terminal';
  }
  get usage() {
    return 'clear';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    return {
      type: 'text',
      content: '// Clear command - handled by component',
    };
  }
}
