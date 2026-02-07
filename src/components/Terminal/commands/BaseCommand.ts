import type { CommandResult, ExtractedData } from '../types';
import { generateSlug, formatBoxLine } from './helpers/utils';

/**
 * Base class for all terminal commands
 * Provides common structure and helper methods
 */
export abstract class BaseCommand {
  constructor(protected data: ExtractedData, protected boxWidth: number = 64) {}

  /**
   * Primary command name
   */
  abstract get name(): string;

  /**
   * Alternative command names/patterns that trigger this command
   */
  abstract get aliases(): string[];

  /**
   * Short description for help text
   */
  abstract get description(): string;

  /**
   * Usage example
   */
  abstract get usage(): string;

  /**
   * Category for organizing help text
   */
  abstract get category(): 'list' | 'showcase' | 'exploration' | 'other';

  /**
   * Execute the command
   * @param input - The full input string
   * @param args - Parsed arguments (split by space)
   */
  abstract execute(input: string, args: string[]): CommandResult;

  /**
   * Check if this command matches the input
   */
  matches(input: string): boolean {
    const command = input.toLowerCase().trim();
    return (
      command === this.name ||
      this.aliases.some((alias) => {
        if (alias.endsWith(' ')) {
          return command.startsWith(alias.trim());
        }
        return command === alias || command.startsWith(alias + ' ');
      })
    );
  }

  /**
   * Helper: Generate slug from name (uses shared utility)
   */
  protected generateSlug(name: string): string {
    return generateSlug(name);
  }

  /**
   * Helper: Format box line (uses shared utility)
   */
  protected formatBoxLine(text: string, padChar: string = ' '): string {
    return formatBoxLine(text, this.boxWidth, padChar);
  }
}
