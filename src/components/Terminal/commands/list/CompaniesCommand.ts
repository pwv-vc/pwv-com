import { BaseCommand } from '../BaseCommand';
import type { CommandResult, SelectableItem } from '../../types';
import { buildBox, type BoxSection } from '../helpers/boxBuilder';

export class CompaniesCommand extends BaseCommand {
  get name() {
    return 'companies';
  }
  get aliases() {
    return ['companies', 'list companies'];
  }
  get description() {
    return 'List all companies';
  }
  get usage() {
    return 'companies';
  }
  get category() {
    return 'list' as const;
  }

  execute(): CommandResult {
    const companies = Object.keys(this.data.entities.companies).sort();

    const listItems = companies.map((name, index) => {
      const company = this.data.entities.companies[name];
      const num = (index + 1).toString().padStart(2, ' ');
      return `${num}. ${name} (${company.mentions} mentions)`;
    });

    const output = buildBox([
      { type: 'header', content: 'ALL COMPANIES' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view details (e.g., "1")' },
    ]);

    // Store selectable items for numeric selection
    const selectableItems: SelectableItem[] = companies.map((name) => ({
      id: name,
      label: name,
      type: 'company',
      data: this.data.entities.companies[name],
    }));

    return {
      type: 'list',
      content: output,
      data: { selectableItems },
    };
  }
}
