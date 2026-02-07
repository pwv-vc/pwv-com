import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';
import { buildBox, type BoxSection } from '../helpers/boxBuilder';

export class BlueskyCommand extends BaseCommand {
  get name() {
    return 'bluesky';
  }
  get aliases() {
    return ['bluesky', 'bsky'];
  }
  get description() {
    return 'View Bluesky profiles';
  }
  get usage() {
    return 'bluesky <tom|dp|dt>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        type: 'error',
        content: 'Usage: bluesky <tom|dp|dt>\n\nExamples:\n  bluesky tom   - Tom Preston-Werner\n  bluesky dp    - David Price\n  bluesky dt    - David Thyresson',
      };
    }

    const target = args[0].toLowerCase();

    // Map shorthand aliases to team member slugs
    const slugMap: Record<string, string> = {
      tom: 'tom-preston-werner',
      dp: 'david-price',
      dt: 'david-thyresson',
    };

    const slug = slugMap[target];
    if (!slug) {
      return {
        type: 'error',
        content: `Unknown target: "${target}"\n\nAvailable options:\n  tom    - Tom Preston-Werner\n  dp     - David Price\n  dt     - David Thyresson`,
      };
    }

    // Find team member by slug
    const teamMember = this.data.team?.find((member) => member.slug === slug);
    if (!teamMember || !teamMember.bluesky) {
      return {
        type: 'error',
        content: `Bluesky profile not found for "${target}"`,
      };
    }

    const blueskyUrl = `https://bsky.app/profile/${teamMember.bluesky}`;
    
    const highlights = this.generateHighlights(teamMember);

    return this.showBlueskyProfile(
      teamMember.name,
      blueskyUrl,
      teamMember.title,
      teamMember.bluesky,
      highlights
    );
  }

  private generateHighlights(teamMember: any): string[] {
    const highlights: string[] = [];
    
    const bio = teamMember.bio || '';
    const sentences = bio.split('. ').slice(0, 2);
    if (sentences.length > 0) {
      highlights.push(sentences.join('. ') + (sentences.length === 1 ? '' : '.'));
    }
    
    if (teamMember.isGeneralPartner) {
      highlights.push('General Partner at PWV');
    }
    
    return highlights.length > 0 ? highlights : ['Technology insights and updates', 'Industry perspectives'];
  }

  private showBlueskyProfile(
    name: string,
    url: string,
    title: string,
    handle: string,
    highlights: string[]
  ): CommandResult {
    const sections: BoxSection[] = [
      { type: 'header', content: 'BLUESKY PROFILE' },
      {
        type: 'keyValue',
        content: {
          NAME: name,
          HANDLE: handle,
          TITLE: title,
          PROFILE: url,
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
