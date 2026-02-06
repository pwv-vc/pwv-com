import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class WhoamiCommand extends BaseCommand {
  get name() {
    return 'whoami';
  }
  get aliases() {
    return ['whoami'];
  }
  get description() {
    return 'Random PWV philosophy quote';
  }
  get usage() {
    return 'whoami';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    const quotes = this.data.entities.quotes || [];

    // Filter for PWV-related speakers
    const pwvSpeakers = ['Tom Preston-Werner', 'David Price', 'David Thyresson', 'PWV'];
    const pwvQuotes = quotes.filter((q) =>
      pwvSpeakers.some((speaker) => q.speaker.toLowerCase().includes(speaker.toLowerCase()))
    );

    // Use PWV quotes if available, otherwise fall back to any quote
    const quotePool = pwvQuotes.length > 0 ? pwvQuotes : quotes;

    if (quotePool.length > 0) {
      const randomQuote = quotePool[Math.floor(Math.random() * quotePool.length)];
      return {
        type: 'text',
        content: `\n  "${randomQuote.quote}"\n\n  — ${randomQuote.speaker}\n`,
      };
    }

    // Fallback if no quotes available
    return {
      type: 'text',
      content: '\n  "We invest to help make the future possible."\n\n  — PWV\n',
    };
  }
}
