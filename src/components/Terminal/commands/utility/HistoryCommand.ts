import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class HistoryCommand extends BaseCommand {
  get name() {
    return 'history';
  }
  get aliases() {
    return ['history'];
  }
  get description() {
    return 'View command history';
  }
  get usage() {
    return 'history';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    return {
      type: 'text',
      content: 'Command history is shown in your terminal session above.',
    };
  }
}
