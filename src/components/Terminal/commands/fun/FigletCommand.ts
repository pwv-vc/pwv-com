import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class FigletCommand extends BaseCommand {
  get name() {
    return 'figlet';
  }
  get aliases() {
    return ['figlet'];
  }
  get description() {
    return 'Generate ASCII art text';
  }
  get usage() {
    return 'figlet <text>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    const text = args.join(' ').trim() || 'PWV';

    // Simple ASCII art generator without external dependencies
    // Since figlet doesn't work in browsers, we'll create our own simple version
    const asciiArt = this.generateSimpleAscii(text);

    return {
      type: 'text',
      content: asciiArt,
    };
  }

  private generateSimpleAscii(text: string): string {
    // Simple block letters
    const letters: Record<string, string[]> = {
      'A': ['  ___  ', ' / _ \\ ', '/ ___ \\', '/_/   \\_\\'],
      'B': [' ____  ', '|  _ \\ ', '| |_) |', '|____/ '],
      'C': ['  ____ ', ' / ___|', '| |    ', '| |___ ', ' \\____|'],
      'D': [' ____  ', '|  _ \\ ', '| | | |', '| |_| |', '|____/ '],
      'E': [' _____ ', '| ____|', '|  _|  ', '| |___ ', '|_____|'],
      'F': [' _____ ', '| ____|', '|  _|  ', '| |    ', '|_|    '],
      'G': ['  ____ ', ' / ___|', '| |  _ ', '| |_| |', ' \\____|'],
      'H': [' _   _ ', '| | | |', '| |_| |', '|  _  |', '|_| |_|'],
      'I': [' ___ ', '|_ _|', ' | | ', ' | | ', '|___|'],
      'J': ['     _ ', '    | |', ' _  | |', '| |_| |', ' \\___/ '],
      'K': [' _  __', '| |/ /', '| \' / ', '| . \\ ', '|_|\\_\\'],
      'L': [' _     ', '| |    ', '| |    ', '| |___ ', '|_____|'],
      'M': [' __  __ ', '|  \\/  |', '| |\\/| |', '| |  | |', '|_|  |_|'],
      'N': [' _   _ ', '| \\ | |', '|  \\| |', '| |\\  |', '|_| \\_|'],
      'O': ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\___/ '],
      'P': [' ____  ', '|  _ \\ ', '| |_) |', '|  __/ ', '|_|    '],
      'Q': ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\__\\_\\'],
      'R': [' ____  ', '|  _ \\ ', '| |_) |', '|  _ < ', '|_| \\_\\'],
      'S': ['  ____ ', ' / ___|', ' \\___ \\', '  ___) |', '|____/ '],
      'T': [' _____ ', '|_   _|', '  | |  ', '  | |  ', '  |_|  '],
      'U': [' _   _ ', '| | | |', '| | | |', '| |_| |', ' \\___/ '],
      'V': ['__     __', '\\ \\   / /', ' \\ \\ / / ', '  \\ V /  ', '   \\_/   '],
      'W': ['__        __', '\\ \\      / /', ' \\ \\ /\\ / / ', '  \\ V  V /  ', '   \\_/\\_/   '],
      'X': ['__  __', '\\ \\/ /', ' \\  / ', ' /  \\ ', '/_/\\_\\'],
      'Y': ['__   __', '\\ \\ / /', ' \\ V / ', '  | |  ', '  |_|  '],
      'Z': [' _____', '|__  /', '  / / ', ' / /_ ', '/____|'],
      ' ': ['   ', '   ', '   ', '   ', '   '],
    };

    const upperText = text.toUpperCase();
    const lines = ['', '', '', '', ''];

    for (const char of upperText) {
      const letterLines = letters[char] || letters[' '];
      for (let i = 0; i < 5; i++) {
        lines[i] += letterLines[i] + ' ';
      }
    }

    return '\n' + lines.join('\n') + '\n';
  }
}
