import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';
import { buildBox, type BoxSection } from '../helpers/boxBuilder';

export class NewsletterCommand extends BaseCommand {
  get name() {
    return 'newsletter';
  }
  get aliases() {
    return ['newsletter', 'signup', 'subscribe'];
  }
  get description() {
    return 'Subscribe to PWV newsletter';
  }
  get usage() {
    return 'newsletter';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    const url = '/newsletter/';

    const sections: BoxSection[] = [
      { type: 'header', content: 'PWV NEWSLETTER' },
      {
        type: 'text',
        content: 'Subscribe to receive:',
      },
      { type: 'empty' },
      {
        type: 'text',
        content: '  • Latest news & announcements',
      },
      {
        type: 'text',
        content: '  • Founder insights & perspectives',
      },
      {
        type: 'text',
        content: '  • Portfolio company updates',
      },
      {
        type: 'text',
        content: '  • Community highlights',
      },
      { type: 'divider' },
      {
        type: 'text',
        content: 'Visit: ' + url,
      },
      { type: 'empty' },
      {
        type: 'text',
        content: 'Click the link above to subscribe.',
      },
    ];

    const output = buildBox(sections);

    return {
      type: 'newsletter',
      content: output,
      data: { url },
    };
  }
}
