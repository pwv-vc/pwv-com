import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class StatsCommand extends BaseCommand {
  get name() {
    return 'stats';
  }
  get aliases() {
    return ['stats'];
  }
  get description() {
    return 'Fun statistics about the corpus';
  }
  get usage() {
    return 'stats';
  }
  get category() {
    return 'exploration' as const;
  }

  execute(): CommandResult {
    const totalPosts = Object.keys(this.data.posts).length;
    const totalCompanies = Object.keys(this.data.entities.companies).length;
    const totalInvestors = Object.keys(this.data.entities.investors).length;
    const totalPeople = Object.keys(this.data.entities.people).length;
    const totalTopics = Object.keys(this.data.entities.topics).length;
    const totalQuotes = (this.data.entities.quotes || []).length;

    // Portfolio stats
    const portfolioStats = this.data.portfolio
      ? {
          representative: this.data.portfolio.representative.length,
          fundOne: this.data.portfolio.fundOne.length,
          rollingFund: this.data.portfolio.rollingFund.length,
          angel: this.data.portfolio.angel.length,
          total:
            this.data.portfolio.representative.length +
            this.data.portfolio.fundOne.length +
            this.data.portfolio.rollingFund.length +
            this.data.portfolio.angel.length,
        }
      : null;

    // Calculate most mentioned entities
    const topCompany = Object.entries(this.data.entities.companies).sort(
      ([, a], [, b]) => b.mentions - a.mentions
    )[0];

    const topInvestor = Object.entries(this.data.entities.investors).sort(
      ([, a], [, b]) => b.mentions - a.mentions
    )[0];

    const topPerson = Object.entries(this.data.entities.people).sort(
      ([, a], [, b]) => b.mentions - a.mentions
    )[0];

    const topTopic = Object.entries(this.data.entities.topics).sort(
      ([, a], [, b]) => b.mentions - a.mentions
    )[0];

    const portfolioSection = portfolioStats
      ? `

💼 PORTFOLIO:
  Total Companies: ${portfolioStats.total}
  Representative: ${portfolioStats.representative}
  Fund I: ${portfolioStats.fundOne}
  Rolling Fund: ${portfolioStats.rollingFund}
  Angel: ${portfolioStats.angel}`
      : '';

    const stats = `
>> CORPUS STATISTICS
─────────────────────────────────────────────────────

📊 OVERVIEW:
  Total Posts: ${totalPosts}
  Companies Mentioned: ${totalCompanies}
  Investors Mentioned: ${totalInvestors}
  People Mentioned: ${totalPeople}
  Topics Identified: ${totalTopics}
  Quotes Captured: ${totalQuotes}${portfolioSection}

🏆 TOP MENTIONS:
  Most Mentioned Company: ${topCompany ? topCompany[0] : 'N/A'}
    (${topCompany ? topCompany[1].mentions : 0} mentions)
  Most Mentioned Investor: ${topInvestor ? topInvestor[0] : 'N/A'}
    (${topInvestor ? topInvestor[1].mentions : 0} mentions)
  Most Mentioned Person: ${topPerson ? topPerson[0] : 'N/A'}
    (${topPerson ? topPerson[1].mentions : 0} mentions)
  Most Mentioned Topic: ${topTopic ? topTopic[0] : 'N/A'}
    (${topTopic ? topTopic[1].mentions : 0} mentions)
    `;

    return { type: 'stats', content: stats };
  }
}
