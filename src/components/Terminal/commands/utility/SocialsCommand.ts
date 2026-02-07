import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';
import { buildBox, type BoxSection } from '../helpers/boxBuilder';

export class SocialsCommand extends BaseCommand {
  get name() {
    return 'socials';
  }
  get aliases() {
    return ['socials', 'social'];
  }
  get description() {
    return 'View all social links';
  }
  get usage() {
    return 'socials <tom|dp|dt>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        type: 'error',
        content: 'Usage: socials <tom|dp|dt>\n\nExamples:\n  socials tom   - All social links for Tom Preston-Werner\n  socials dp    - All social links for David Price\n  socials dt    - All social links for David Thyresson',
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
    if (!teamMember) {
      return {
        type: 'error',
        content: `Team member not found for "${target}"`,
      };
    }

    return this.showSocialLinks(teamMember);
  }

  private showSocialLinks(teamMember: any): CommandResult {
    const sections: BoxSection[] = [
      { type: 'header', content: 'SOCIAL LINKS' },
      {
        type: 'keyValue',
        content: {
          NAME: teamMember.name,
          TITLE: teamMember.title,
        },
      },
      { type: 'divider' },
      {
        type: 'text',
        content: 'AVAILABLE LINKS:',
      },
      { type: 'empty' },
    ];

    // Build list of available social links
    const links: { label: string; url: string }[] = [];

    if (teamMember.website) {
      links.push({
        label: 'Website',
        url: teamMember.website,
      });
    }

    if (teamMember.linkedin) {
      links.push({
        label: 'LinkedIn',
        url: `https://www.linkedin.com/in/${teamMember.linkedin}/`,
      });
    }

    if (teamMember.twitter) {
      links.push({
        label: 'Twitter/X',
        url: `https://x.com/${teamMember.twitter}`,
      });
    }

    if (teamMember.github) {
      links.push({
        label: 'GitHub',
        url: `https://github.com/${teamMember.github}`,
      });
    }

    if (teamMember.bluesky) {
      links.push({
        label: 'Bluesky',
        url: `https://bsky.app/profile/${teamMember.bluesky}`,
      });
    }

    // Add each link to sections
    links.forEach((link) => {
      sections.push({
        type: 'text',
        content: `  • ${link.label}: ${link.url}`,
      });
    });

    if (links.length === 0) {
      sections.push({
        type: 'text',
        content: '  No social links available.',
      });
    }

    sections.push({ type: 'divider' });
    sections.push({
      type: 'text',
      content: 'Click any link above to visit.',
    });

    const output = buildBox(sections);

    return {
      type: 'text',
      content: output,
    };
  }
}
