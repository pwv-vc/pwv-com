import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class FortuneCommand extends BaseCommand {
  get name() {
    return 'fortune';
  }
  get aliases() {
    return ['fortune'];
  }
  get description() {
    return 'Get any random quote from corpus';
  }
  get usage() {
    return 'fortune';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    const { text, showcaseUrl } = this.getFortune();
    let content = text;
    if (showcaseUrl) {
      content += `\n\n💬 View & share: ${showcaseUrl}`;
    }
    return { type: 'text', content };
  }

  getFortune(): { text: string; showcaseUrl?: string } {
    const quotes = this.data.entities.quotes || [];

    if (quotes.length === 0) {
      return {
        text: '"We invest to help make the future possible."\n— PWV',
      };
    }

    const quoteIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[quoteIndex];
    const quoteId = `${randomQuote.postSlug}-${quoteIndex}`;
    const showcaseUrl = `/showcase/quotes/${quoteId}/`;

    return {
      text: `"${randomQuote.quote}"\n— ${randomQuote.speaker}`,
      showcaseUrl,
    };
  }
}
