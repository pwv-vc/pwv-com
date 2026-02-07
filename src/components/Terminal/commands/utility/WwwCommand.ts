import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';
import { buildBox, type BoxSection } from '../helpers/boxBuilder';

export class WwwCommand extends BaseCommand {
  get name() {
    return 'www';
  }
  get aliases() {
    return ['www'];
  }
  get description() {
    return 'Visit PWV partner websites';
  }
  get usage() {
    return 'www <tom|dt>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        type: 'error',
        content: 'Usage: www <tom|dt>\n\nExamples:\n  www tom    - Tom Preston-Werner\'s website\n  www dt     - David Thyresson\'s website',
      };
    }

    const person = args[0].toLowerCase();

    // Map shorthand aliases to team member slugs
    const slugMap: Record<string, string> = {
      tom: 'tom-preston-werner',
      dt: 'david-thyresson',
    };

    const slug = slugMap[person];
    if (!slug) {
      return {
        type: 'error',
        content: `Unknown person: "${person}"\n\nAvailable options:\n  tom    - Tom Preston-Werner\n  dt     - David Thyresson`,
      };
    }

    // Find team member by slug
    const teamMember = this.data.team?.find((member) => member.slug === slug);
    if (!teamMember || !teamMember.website) {
      return {
        type: 'error',
        content: `Website not found for "${person}"`,
      };
    }

    // Generate dynamic highlights
    const highlights = this.generateHighlights(teamMember, person);

    return this.showPersonSite(
      teamMember.name,
      teamMember.website,
      teamMember.title,
      highlights
    );
  }

  private generateHighlights(teamMember: any, person: string): string[] {
    // Provide custom highlights based on the person
    if (person === 'tom') {
      return [
        'Blog posts on software & entrepreneurship',
        'Open source projects (Jekyll, TOML, Semantic Versioning)',
        'Talks and media appearances',
      ];
    }
    
    if (person === 'dt') {
      return [
        'Latest writings on AI, startups, and technology',
        'Personal reflections and perspectives',
        'Background and experience',
      ];
    }

    // Default highlights
    return [
      'Professional insights and perspectives',
      'Technology and innovation',
      'Industry thought leadership',
    ];
  }

  private showPersonSite(
    name: string,
    url: string,
    title: string,
    highlights: string[]
  ): CommandResult {
    const sections: BoxSection[] = [
      { type: 'header', content: 'PERSONAL WEBSITE' },
      {
        type: 'keyValue',
        content: {
          NAME: name,
          TITLE: title,
          WEBSITE: url,
        },
      },
      { type: 'divider' },
      {
        type: 'text',
        content: 'HIGHLIGHTS:',
      },
      { type: 'empty' },
      ...highlights.map((highlight) => ({
        type: 'text' as const,
        content: `  • ${highlight}`,
      })),
      { type: 'divider' },
      {
        type: 'text',
        content: 'Visit: ' + url,
      },
      { type: 'empty' },
      {
        type: 'text',
        content: 'Click the link above to visit.',
      },
    ];

    const output = buildBox(sections);

    return {
      type: 'text',
      content: output,
      data: { url },
    };
  }
}
