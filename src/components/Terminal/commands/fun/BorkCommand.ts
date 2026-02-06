import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class BorkCommand extends BaseCommand {
  get name() {
    return 'bork';
  }
  get aliases() {
    return ['bork', 'bork bork', 'bork bork bork'];
  }
  get description() {
    return 'Bork bork bork!';
  }
  get usage() {
    return 'bork';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    const borkText = this.getBorkText();

    return {
      type: 'text',
      content: borkText + `\n\n— 🧑‍🍳`,
    };
  }

  /**
   * Get random bork text (can be used by other commands via piping)
   */
  getBorkText(): string {
    const borkVariations = [
      `Bork bork börk!`,
      `Bork! Börk! Bork!`,
      `Der bork bork börk!`,
      `Yorn desh born, der ritt de gitt der gue,
Orn desh, dee börn desh, de umn börk! börk! börk!`,
      `Börk börk börk!
Der Swedish Chef is in der hoose!`,
      `Bork börk bork!
*throws random kitchen utensils*`,
      `Bork bork! Der terminal is yöörking!`,
    ];

    return borkVariations[Math.floor(Math.random() * borkVariations.length)];
  }
}
