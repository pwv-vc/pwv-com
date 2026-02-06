import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class CowsayCommand extends BaseCommand {
  get name() {
    return 'cowsay';
  }
  get aliases() {
    return ['cowsay', 'fortune | cowsay'];
  }
  get description() {
    return 'Any random quote with ASCII cow';
  }
  get usage() {
    return 'cowsay <text>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    let text = args.join(' ').trim();
    let showcaseUrl: string | undefined;

    // If no text provided or it's the pipe command, get a fortune
    if (!text || input.trim().toLowerCase() === 'fortune | cowsay') {
      const fortune = this.getFortune();
      text = fortune.text;
      showcaseUrl = fortune.showcaseUrl;
    }

    return this.renderCowsay(text, showcaseUrl);
  }

  private getFortune(): { text: string; showcaseUrl?: string } {
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

  private renderCowsay(text: string, showcaseUrl?: string): CommandResult {
    if (!text) {
      text = 'Type something after cowsay!';
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
    bubble += `        \\   ^__^\n`;
    bubble += `         \\  (oo)\\_______\n`;
    bubble += `            (__)\\       )\\/\\\n`;
    bubble += `                ||----w |\n`;
    bubble += `                ||     ||\n`;

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
