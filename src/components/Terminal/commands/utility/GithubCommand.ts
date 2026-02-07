import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';
import { buildBox, type BoxSection } from '../helpers/boxBuilder';

export class GithubCommand extends BaseCommand {
  get name() {
    return 'github';
  }
  get aliases() {
    return ['github', 'gh'];
  }
  get description() {
    return 'View GitHub profiles';
  }
  get usage() {
    return 'github <tom|dp|dt>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        type: 'error',
        content: 'Usage: github <tom|dp|dt>\n\nExamples:\n  github tom   - Tom Preston-Werner\n  github dp    - David Price\n  github dt    - David Thyresson',
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
    if (!teamMember || !teamMember.github) {
      return {
        type: 'error',
        content: `GitHub profile not found for "${target}"`,
      };
    }

    const githubUrl = `https://github.com/${teamMember.github}`;
    
    const highlights = this.generateHighlights(teamMember, target);

    return this.showGithubProfile(
      teamMember.name,
      githubUrl,
      teamMember.title,
      teamMember.github,
      highlights
    );
  }

  private generateHighlights(teamMember: any, target: string): string[] {
    const highlights: string[] = [];
    
    // Add custom highlights for specific people
    if (target === 'tom') {
      highlights.push('Co-founder of GitHub');
      highlights.push('Creator of Jekyll, TOML, and SemVer');
      highlights.push('Open source pioneer');
    } else if (target === 'dt') {
      highlights.push('Core team member of RedwoodJS');
      highlights.push('Full-stack development expertise');
      highlights.push('Open source contributor');
    } else {
      // Generic highlights
      const bio = teamMember.bio || '';
      const sentences = bio.split('. ').slice(0, 2);
      if (sentences.length > 0) {
        highlights.push(sentences.join('. ') + (sentences.length === 1 ? '' : '.'));
      }
    }
    
    if (teamMember.isGeneralPartner) {
      highlights.push('General Partner at PWV');
    }
    
    return highlights.length > 0 ? highlights : ['Open source projects', 'Code contributions'];
  }

  private showGithubProfile(
    name: string,
    url: string,
    title: string,
    username: string,
    highlights: string[]
  ): CommandResult {
    const sections: BoxSection[] = [
      { type: 'header', content: 'GITHUB PROFILE' },
      {
        type: 'keyValue',
        content: {
          NAME: name,
          USERNAME: username,
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
