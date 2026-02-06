import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';
import { buildBox } from '../helpers/boxBuilder';

export class FiguresCommand extends BaseCommand {
  get name() {
    return 'figures';
  }
  get aliases() {
    return ['figures', 'list figures'];
  }
  get description() {
    return 'Browse all figures/metrics';
  }
  get usage() {
    return 'figures';
  }
  get category() {
    return 'list' as const;
  }

  execute(): CommandResult {
    const figures: Array<{
      value: string;
      unit: string;
      context: string;
      postSlug: string;
      postTitle: string;
    }> = [];

    // Aggregate figures from all posts
    Object.entries(this.data.posts).forEach(([slug, post]) => {
      if (post.figures && post.figures.length > 0) {
        post.figures.forEach((figure) => {
          figures.push({
            value: figure.value,
            unit: figure.unit,
            context: figure.context,
            postSlug: slug,
            postTitle: post.title,
          });
        });
      }
    });

    if (figures.length === 0) {
      return {
        type: 'text',
        content: 'No figures found in the corpus.',
      };
    }

    const listItems = figures.map((figure, index) => {
      const num = (index + 1).toString().padStart(3, ' ');
      const metric = `${figure.value}${figure.unit}`;
      const truncatedContext =
        figure.context.length > 60
          ? figure.context.substring(0, 60) + '...'
          : figure.context;
      return `${num}. ${metric} - ${truncatedContext}\n       From: ${figure.postTitle.substring(0, 50)}...`;
    });

    const output = buildBox([
      { type: 'header', content: 'ALL FIGURES' },
      { type: 'text', content: `Found ${figures.length} figures` },
      { type: 'divider' },
      { type: 'list', content: listItems },
    ]);

    return { type: 'list', content: output };
  }
}
