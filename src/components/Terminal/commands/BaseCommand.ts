import type { CommandResult, ExtractedData } from '../types';

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
   * Helper: Generate slug from name
   */
  protected generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }

  /**
   * Helper: Format box line
   */
  protected formatBoxLine(text: string, padChar: string = ' '): string {
    const contentWidth = this.boxWidth - 4;
    if (text.length > contentWidth) {
      return text.substring(0, contentWidth - 3) + '...';
    }
    return text.padEnd(contentWidth, padChar);
  }
}
