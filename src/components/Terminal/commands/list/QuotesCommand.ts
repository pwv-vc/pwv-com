import { BaseCommand } from '../BaseCommand';
import type { CommandResult, SelectableItem } from '../../types';
import { buildBox } from '../helpers/boxBuilder';

export class QuotesCommand extends BaseCommand {
  get name() {
    return 'quotes';
  }
  get aliases() {
    return ['quotes', 'list quotes'];
  }
  get description() {
    return 'Browse all quotes';
  }
  get usage() {
    return 'quotes';
  }
  get category() {
    return 'list' as const;
  }

  execute(): CommandResult {
    const quotes = this.data.entities.quotes || [];

    if (quotes.length === 0) {
      return {
        type: 'text',
        content: 'No quotes found in the corpus.',
      };
    }

    // Sort quotes by date (newest first) if dates available
    const sortedQuotes = [...quotes].sort((a, b) => {
      if (!a.pubDate || !b.pubDate) return 0;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    const listItems = sortedQuotes.map((q, index) => {
      const num = (index + 1).toString().padStart(3, ' ');
      const dateStr = q.pubDate ? ` (${q.pubDate})` : '';
      const contextStr = q.context ? ` - ${q.context}` : '';
      return `${num}. "${q.quote.substring(0, 60)}${q.quote.length > 60 ? '...' : ''}"\n       — ${q.speaker}${contextStr}${dateStr}`;
    });

    const output = buildBox([
      { type: 'header', content: 'ALL QUOTES' },
      { type: 'text', content: `Found ${quotes.length} quotes` },
      { type: 'divider' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view source post (e.g., "1")' },
    ]);

    // Store selectable items for numeric selection
    const selectableItems: SelectableItem[] = sortedQuotes.map((quote, index) => ({
      id: `quote-${index}`,
      label: `${quote.speaker}: ${quote.quote.substring(0, 50)}...`,
      type: 'quote',
      data: quote,
    }));

    return {
      type: 'list',
      content: output,
      data: { selectableItems },
    };
  }
}
