import { BaseCommand } from '../BaseCommand';
import type { CommandResult, SelectableItem } from '../../types';
import { buildBox } from '../helpers/boxBuilder';

export class TopicsCommand extends BaseCommand {
  get name() {
    return 'topics';
  }
  get aliases() {
    return ['topics', 'list topics'];
  }
  get description() {
    return 'List all topics';
  }
  get usage() {
    return 'topics';
  }
  get category() {
    return 'list' as const;
  }

  execute(): CommandResult {
    const topics = Object.keys(this.data.entities.topics).sort();

    const listItems = topics.map((name, index) => {
      const topic = this.data.entities.topics[name];
      const num = (index + 1).toString().padStart(2, ' ');
      return `${num}. ${name} (${topic.mentions} posts)`;
    });

    const output = buildBox([
      { type: 'header', content: 'ALL TOPICS' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view details (e.g., "1")' },
    ]);

    const selectableItems: SelectableItem[] = topics.map((name) => ({
      id: name,
      label: name,
      type: 'topic',
      data: this.data.entities.topics[name],
    }));

    return {
      type: 'list',
      content: output,
      data: { selectableItems },
    };
  }
}
