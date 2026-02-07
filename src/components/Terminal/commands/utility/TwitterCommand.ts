import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';
import { buildBox, type BoxSection } from '../helpers/boxBuilder';

export class TwitterCommand extends BaseCommand {
  get name() {
    return 'twitter';
  }
  get aliases() {
    return ['twitter', 'x'];
  }
  get description() {
    return 'View Twitter/X profiles';
  }
  get usage() {
    return 'twitter <tom|dp|dt>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        type: 'error',
        content: 'Usage: twitter <tom|dp|dt>\n\nExamples:\n  twitter tom   - Tom Preston-Werner\n  twitter dp    - David Price\n  twitter dt    - David Thyresson',
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
    if (!teamMember || !teamMember.twitter) {
      return {
        type: 'error',
        content: `Twitter profile not found for "${target}"`,
      };
    }

    const twitterUrl = `https://x.com/${teamMember.twitter}`;
    
    const highlights = this.generateHighlights(teamMember);

    return this.showTwitterProfile(
      teamMember.name,
      twitterUrl,
      teamMember.title,
      `@${teamMember.twitter}`,
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

  private showTwitterProfile(
    name: string,
    url: string,
    title: string,
    handle: string,
    highlights: string[]
  ): CommandResult {
    const sections: BoxSection[] = [
      { type: 'header', content: 'TWITTER / X PROFILE' },
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
