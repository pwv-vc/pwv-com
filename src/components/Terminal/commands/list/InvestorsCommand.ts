import { BaseCommand } from '../BaseCommand';
import type { CommandResult, SelectableItem } from '../../types';
import { buildBox } from '../helpers/boxBuilder';

export class InvestorsCommand extends BaseCommand {
  get name() {
    return 'investors';
  }
  get aliases() {
    return ['investors', 'list investors'];
  }
  get description() {
    return 'List all investors/VCs';
  }
  get usage() {
    return 'investors';
  }
  get category() {
    return 'list' as const;
  }

  execute(): CommandResult {
    const investors = Object.keys(this.data.entities.investors).sort();

    const listItems = investors.map((name, index) => {
      const investor = this.data.entities.investors[name];
      const num = (index + 1).toString().padStart(2, ' ');
      return `${num}. ${name} (${investor.mentions} mentions)`;
    });

    const output = buildBox([
      { type: 'header', content: 'ALL INVESTORS' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view details (e.g., "1")' },
    ]);

    const selectableItems: SelectableItem[] = investors.map((name) => ({
      id: name,
      label: name,
      type: 'investor',
      data: this.data.entities.investors[name],
    }));

    return {
      type: 'list',
      content: output,
      data: { selectableItems },
    };
  }
}
