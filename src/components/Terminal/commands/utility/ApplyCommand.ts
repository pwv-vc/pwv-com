import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';
import { buildBox, type BoxSection } from '../helpers/boxBuilder';

export class ApplyCommand extends BaseCommand {
  get name() {
    return 'apply';
  }
  get aliases() {
    return ['apply'];
  }
  get description() {
    return 'Apply for PWV funding';
  }
  get usage() {
    return 'apply';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    const url = '/apply/';

    const sections: BoxSection[] = [
      { type: 'header', content: 'APPLY FOR FUNDING' },
      {
        type: 'text',
        content: 'PWV provides early-stage capital for technology founders',
      },
      { type: 'empty' },
      {
        type: 'text',
        content: '  • Investment: $500K–$3M+ (Pre-Seed through Series A)',
      },
      {
        type: 'text',
        content: '  • Focus: Platforms, tools, and infrastructure',
      },
      {
        type: 'text',
        content: '  • Partner from seed to scale',
      },
      {
        type: 'text',
        content: '  • Built by founders, run by operators',
      },
      { type: 'divider' },
      {
        type: 'text',
        content: 'Visit: ' + url,
      },
      { type: 'empty' },
      {
        type: 'text',
        content: 'Click the link above to apply.',
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
