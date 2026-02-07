import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class EchoCommand extends BaseCommand {
  get name() {
    return 'echo';
  }
  get aliases() {
    return ['echo'];
  }
  get description() {
    return 'Display a line of text';
  }
  get usage() {
    return 'echo <text>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    if (args.length === 0) {
      return { type: 'text', content: '' };
    }

    const text = args.join(' ');
    
    // Easter eggs for specific phrases
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return { 
        type: 'text', 
        content: `${text}\n\nHello! Type 'hello' for a proper greeting.`
      };
    }
    
    if (lowerText.includes('pwv')) {
      return { 
        type: 'text', 
        content: `${text}\n\n💚 We invest to help make the future possible.`
      };
    }
    
    return { type: 'text', content: text };
  }
}
