import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class DateCommand extends BaseCommand {
  get name() {
    return 'date';
  }
  get aliases() {
    return ['date'];
  }
  get description() {
    return 'Display current date and time';
  }
  get usage() {
    return 'date';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    const now = new Date();
    const dateStr = now.toString();
    
    return { 
      type: 'text', 
      content: `${dateStr}\n\nPerfect time to explore PWV portfolio companies. Type 'companies' to see them.`
    };
  }
}
