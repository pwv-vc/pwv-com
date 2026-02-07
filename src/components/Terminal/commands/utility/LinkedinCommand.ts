import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';
import { buildBox, type BoxSection } from '../helpers/boxBuilder';

export class LinkedinCommand extends BaseCommand {
  get name() {
    return 'linkedin';
  }
  get aliases() {
    return ['linkedin'];
  }
  get description() {
    return 'View LinkedIn profiles';
  }
  get usage() {
    return 'linkedin <pwv|tom|dp|dt>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        type: 'error',
        content: 'Usage: linkedin <pwv|tom|dp|dt>\n\nExamples:\n  linkedin pwv   - PWV company page\n  linkedin tom   - Tom Preston-Werner\n  linkedin dp    - David Price\n  linkedin dt    - David Thyresson',
      };
    }

    const target = args[0].toLowerCase();

    if (target === 'pwv') {
      return this.showLinkedInProfile(
        'PWV (Preston-Werner Ventures)',
        'https://www.linkedin.com/company/pwventures/',
        'Early-stage venture capital firm',
        [
          'Company updates and announcements',
          'Portfolio company news',
          'Team insights and perspectives',
          'Industry thought leadership',
        ]
      );
    }

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
        content: `Unknown target: "${target}"\n\nAvailable options:\n  pwv    - PWV company page\n  tom    - Tom Preston-Werner\n  dp     - David Price\n  dt     - David Thyresson`,
      };
    }

    // Find team member by slug
    const teamMember = this.data.team?.find((member) => member.slug === slug);
    if (!teamMember || !teamMember.linkedin) {
      return {
        type: 'error',
        content: `LinkedIn profile not found for "${target}"`,
      };
    }

    const linkedinUrl = `https://www.linkedin.com/in/${teamMember.linkedin}/`;
    
    // Extract key points from bio for highlights
    const highlights = this.generateHighlights(teamMember);

    return this.showLinkedInProfile(
      teamMember.name,
      linkedinUrl,
      teamMember.title,
      highlights
    );
  }

  private generateHighlights(teamMember: any): string[] {
    // Generate dynamic highlights based on team member
    const highlights: string[] = [];
    
    // Parse the bio to extract key points
    const bio = teamMember.bio || '';
    
    // Add the first sentence or two from bio
    const sentences = bio.split('. ').slice(0, 2);
    if (sentences.length > 0) {
      highlights.push(sentences.join('. ') + (sentences.length === 1 ? '' : '.'));
    }
    
    // Add role indicator
    if (teamMember.isGeneralPartner) {
      highlights.push('General Partner at PWV');
    }
    
    // Add website if available
    if (teamMember.website) {
      highlights.push('Personal website available');
    }
    
    return highlights.length > 0 ? highlights : ['Professional background and experience', 'Investment insights and perspectives'];
  }

  private showLinkedInProfile(
    name: string,
    url: string,
    title: string,
    highlights: string[]
  ): CommandResult {
    const sections: BoxSection[] = [
      { type: 'header', content: 'LINKEDIN PROFILE' },
      {
        type: 'keyValue',
        content: {
          NAME: name,
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
