import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class PwvsayCommand extends BaseCommand {
  private speakerFilter: string[] = [];

  get name() {
    return 'pwvsay';
  }
  get aliases() {
    return ['pwvsay', 'tomsay', 'dtsay', 'dpsay', 'fortune | pwvsay'];
  }
  get description() {
    return 'PWV team quote with PWV logo';
  }
  get usage() {
    return 'pwvsay <text>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    const command = input.toLowerCase().trim();
    let text = args.join(' ').trim();
    let showcaseUrl: string | undefined;

    // Determine speaker filter based on command
    if (command.startsWith('tomsay') || command === 'fortune | tomsay') {
      this.speakerFilter = ['Tom Preston-Werner', 'Tom'];
    } else if (command.startsWith('dtsay') || command === 'fortune | dtsay') {
      this.speakerFilter = ['David Thyresson', 'David T.'];
    } else if (command.startsWith('dpsay') || command === 'fortune | dpsay') {
      this.speakerFilter = ['David Price', 'David P.'];
    } else {
      // Default: all PWV team
      this.speakerFilter = ['Tom Preston-Werner', 'David Price', 'David Thyresson', 'PWV'];
    }

    // If no text provided or it's the pipe command, get a fortune
    if (!text || command.includes(' | ')) {
      const fortune = this.getQuoteFromSpeakers(this.speakerFilter);
      text = fortune.text;
      showcaseUrl = fortune.showcaseUrl;
    }

    return this.renderPwvsay(text, showcaseUrl);
  }

  private getQuoteFromSpeakers(speakers: string[]): { text: string; showcaseUrl?: string } {
    const quotes = this.data.entities.quotes || [];

    // Filter quotes by speaker
    const filteredQuotes = quotes.filter((q) =>
      speakers.some((speaker) => q.speaker.toLowerCase().includes(speaker.toLowerCase()))
    );

    // Use filtered quotes if available, otherwise fall back to all quotes
    const quotePool = filteredQuotes.length > 0 ? filteredQuotes : quotes;

    if (quotePool.length === 0) {
      // Fallback if no quotes available
      return {
        text: '"We invest to help make the future possible."\n— PWV',
      };
    }

    // Find the index in the original quotes array for the showcase URL
    const randomQuote = quotePool[Math.floor(Math.random() * quotePool.length)];
    const quoteIndex = quotes.indexOf(randomQuote);
    const quoteId = `${randomQuote.postSlug}-${quoteIndex}`;
    const showcaseUrl = `/showcase/quotes/${quoteId}/`;

    return {
      text: `"${randomQuote.quote}"\n— ${randomQuote.speaker}`,
      showcaseUrl,
    };
  }

  private renderPwvsay(text: string, showcaseUrl?: string): CommandResult {
    if (!text) {
      text = 'Type something after pwvsay!';
    }

    // Handle multi-line text by wrapping long lines
    const maxWidth = 50;
    const lines = this.wrapText(text, maxWidth);

    // Calculate max line length
    const maxLen = Math.max(...lines.map((l) => l.length), 10);

    // Build the speech bubble
    const topBorder = ' ' + '_'.repeat(maxLen + 2);
    const bottomBorder = ' ' + '-'.repeat(maxLen + 2);

    let bubble = topBorder + '\n';

    if (lines.length === 1) {
      bubble += `< ${lines[0].padEnd(maxLen)} >\n`;
    } else {
      lines.forEach((line, i) => {
        const paddedLine = line.padEnd(maxLen);
        if (i === 0) {
          bubble += `/ ${paddedLine} \\\n`;
        } else if (i === lines.length - 1) {
          bubble += `\\ ${paddedLine} /\n`;
        } else {
          bubble += `| ${paddedLine} |\n`;
        }
      });
    }

    bubble += bottomBorder + '\n';
    // PWV logo: green square with filled half circle at top
    bubble += `        \\    ┌────┐\n`;
    bubble += `         \\   │▄██▄│\n`;
    bubble += `             │    │  PWV\n`;
    bubble += `             └────┘\n`;

    // Add showcase link if available
    if (showcaseUrl) {
      bubble += `\n💬 View & share: ${showcaseUrl}\n`;
    }

    return { type: 'text', content: bubble };
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    paragraphs.forEach((paragraph) => {
      if (paragraph.length <= maxWidth) {
        lines.push(paragraph);
      } else {
        // Wrap long lines
        const words = paragraph.split(' ');
        let currentLine = '';

        words.forEach((word) => {
          if ((currentLine + ' ' + word).trim().length <= maxWidth) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });

        if (currentLine) lines.push(currentLine);
      }
    });

    return lines;
  }
}
