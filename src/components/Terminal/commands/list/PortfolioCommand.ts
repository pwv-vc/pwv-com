import { BaseCommand } from '../BaseCommand';
import type { CommandResult, SelectableItem } from '../../types';
import { buildBox } from '../helpers/boxBuilder';

export class PortfolioCommand extends BaseCommand {
  get name() {
    return 'portfolio';
  }
  get aliases() {
    return ['portfolio', 'list portfolio'];
  }
  get description() {
    return 'Browse PWV portfolio companies';
  }
  get usage() {
    return 'portfolio';
  }
  get category() {
    return 'list' as const;
  }

  execute(): CommandResult {
    if (!this.data.portfolio) {
      return {
        type: 'text',
        content: 'No portfolio data available.',
      };
    }

    // Combine all portfolio companies
    const allPortfolio = [
      ...this.data.portfolio.representative.map((p) => ({
        ...p,
        fund: 'Representative',
      })),
      ...this.data.portfolio.fundOne.map((p) => ({ ...p, fund: 'Fund I' })),
      ...this.data.portfolio.rollingFund.map((p) => ({
        ...p,
        fund: 'Rolling Fund',
      })),
      ...this.data.portfolio.angel.map((p) => ({ ...p, fund: 'Angel' })),
    ];

    // Sort alphabetically
    allPortfolio.sort((a, b) => a.name.localeCompare(b.name));

    // Create selectable list
    const selectableItems: SelectableItem[] = allPortfolio.map((company) => ({
      id: company.slug,
      label: company.name,
      type: 'company',
      data: company,
    }));

    const listItems = allPortfolio.map((company, index) => {
      const num = (index + 1).toString().padStart(3, ' ');
      const tags = company.tags.join(', ');
      const fundBadge = `[${company.fund}]`;

      // Check if company is in our entities (has posts)
      const hasEntityData = this.data.entities.companies[company.name];
      const entityIndicator = hasEntityData ? ' 📰' : '';

      return `${num}. ${company.name}${entityIndicator} ${fundBadge}\n       ${tags}`;
    });

    const output = buildBox([
      { type: 'header', content: 'PWV PORTFOLIO' },
      {
        type: 'text',
        content: `Found ${allPortfolio.length} portfolio companies`,
      },
      { type: 'text', content: '📰 = Has news/posts' },
      { type: 'divider' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view details (e.g., "1")' },
    ]);

    return {
      type: 'list',
      content: output,
      data: { selectableItems },
    };
  }
}
