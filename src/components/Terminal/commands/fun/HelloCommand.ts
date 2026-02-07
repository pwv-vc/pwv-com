import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class HelloCommand extends BaseCommand {
  get name() {
    return 'hello';
  }
  get aliases() {
    return ['hello'];
  }
  get description() {
    return 'Random greeting';
  }
  get usage() {
    return 'hello';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    const greetings = [
      'Hello, world!',
      'Hello, Dave.',
      'Hello there.',
      'hello?',
      'Hello, friend.',
      'Hi there! 👋',
      'Greetings!',
      'Hello, human.',
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    return {
      type: 'text',
      content: `\n${randomGreeting}\n`,
    };
  }
}
