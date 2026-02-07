import { BaseCommand } from '../BaseCommand';
import type { CommandResult, SelectableItem } from '../../types';
import { buildBox } from '../helpers/boxBuilder';

export class PeopleCommand extends BaseCommand {
  get name() {
    return 'people';
  }
  get aliases() {
    return ['people', 'list people'];
  }
  get description() {
    return 'List all people';
  }
  get usage() {
    return 'people';
  }
  get category() {
    return 'list' as const;
  }

  execute(): CommandResult {
    const people = Object.keys(this.data.entities.people).sort();

    const listItems = people.map((name, index) => {
      const person = this.data.entities.people[name];
      const num = (index + 1).toString().padStart(2, ' ');
      return `${num}. ${name} - ${person.role || 'Unknown'}`;
    });

    const output = buildBox([
      { type: 'header', content: 'ALL PEOPLE' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view details (e.g., "1")' },
    ]);

    const selectableItems: SelectableItem[] = people.map((name) => ({
      id: name,
      label: name,
      type: 'person',
      data: this.data.entities.people[name],
    }));

    return {
      type: 'list',
      content: output,
      data: { selectableItems },
    };
  }
}
