import { BaseCommand } from '../BaseCommand';
import type { CommandResult, SelectableItem } from '../../types';
import { buildBox } from '../helpers/boxBuilder';

export class FactsCommand extends BaseCommand {
  get name() {
    return 'facts';
  }
  get aliases() {
    return ['facts', 'list facts'];
  }
  get description() {
    return 'Browse all facts';
  }
  get usage() {
    return 'facts';
  }
  get category() {
    return 'list' as const;
  }

  execute(): CommandResult {
    const facts: Array<{
      text: string;
      category: string;
      date?: string;
      postSlug: string;
      postTitle: string;
    }> = [];

    // Aggregate facts from all posts
    Object.entries(this.data.posts).forEach(([slug, post]) => {
      if (post.facts && post.facts.length > 0) {
        post.facts.forEach((fact) => {
          facts.push({
            text: fact.text,
            category: fact.category,
            date: fact.date,
            postSlug: slug,
            postTitle: post.title,
          });
        });
      }
    });

    if (facts.length === 0) {
      return {
        type: 'text',
        content: 'No facts found in the corpus.',
      };
    }

    // Sort by date if available (newest first)
    facts.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return b.date.localeCompare(a.date);
    });

    const listItems = facts.map((fact, index) => {
      const num = (index + 1).toString().padStart(3, ' ');
      const categoryBadge = `[${fact.category}]`;
      const dateStr = fact.date ? ` (${fact.date})` : '';
      const truncatedFact =
        fact.text.length > 70 ? fact.text.substring(0, 70) + '...' : fact.text;
      return `${num}. ${truncatedFact}\n       ${categoryBadge}${dateStr} - ${fact.postTitle.substring(0, 40)}...`;
    });

    const output = buildBox([
      { type: 'header', content: 'ALL FACTS' },
      { type: 'text', content: `Found ${facts.length} facts` },
      { type: 'divider' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view source post (e.g., "1")' },
    ]);

    // Store selectable items for numeric selection
    const selectableItems: SelectableItem[] = facts.map((fact, index) => ({
      id: `fact-${index}`,
      label: `${fact.category}: ${fact.text.substring(0, 50)}...`,
      type: 'fact',
      data: fact,
    }));

    return {
      type: 'list',
      content: output,
      data: { selectableItems },
    };
  }
}
