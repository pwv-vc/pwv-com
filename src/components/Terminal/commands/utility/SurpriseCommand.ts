import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class SurpriseCommand extends BaseCommand {
  get name() {
    return 'surprise';
  }
  get aliases() {
    return ['surprise', 'surprise me'];
  }
  get description() {
    return 'Random combination of entities';
  }
  get usage() {
    return 'surprise me';
  }
  get category() {
    return 'exploration' as const;
  }

  execute(): CommandResult {
    const surpriseTypes = [
      'random_company_fact',
      'random_person_insight',
      'random_connection',
      'interesting_stat',
    ];

    const randomType = surpriseTypes[Math.floor(Math.random() * surpriseTypes.length)];

    switch (randomType) {
      case 'random_company_fact': {
        const companies = Object.keys(this.data.entities.companies);
        if (companies.length === 0) return this.showcaseRandom();
        const randomCompany = companies[Math.floor(Math.random() * companies.length)];
        return this.showcaseCompany(randomCompany);
      }
      case 'random_person_insight': {
        const people = Object.keys(this.data.entities.people);
        if (people.length === 0) return this.showcaseRandom();
        const randomPerson = people[Math.floor(Math.random() * people.length)];
        return this.showcasePerson(randomPerson);
      }
      case 'random_connection': {
        const entities = [
          ...Object.keys(this.data.entities.companies),
          ...Object.keys(this.data.entities.people),
        ];
        if (entities.length < 2) {
          return this.showcaseRandom();
        }
        const entity1 = entities[Math.floor(Math.random() * entities.length)];
        let entity2 = entities[Math.floor(Math.random() * entities.length)];
        while (entity2 === entity1 && entities.length > 1) {
          entity2 = entities[Math.floor(Math.random() * entities.length)];
        }
        return this.showConnections(`${entity1} ${entity2}`);
      }
      case 'interesting_stat':
        return this.showStats();
      default:
        return this.showcaseRandom();
    }
  }

  // Helper methods (will be refactored when showcase commands are migrated)
  private showcaseRandom(): CommandResult {
    // This is a simplified version - proper implementation will come when we migrate showcase
    return {
      type: 'text',
      content: 'Try: showcase random, showcase company <name>, or browse with companies/people/topics',
    };
  }

  private showcaseCompany(name: string): CommandResult {
    const company = this.data.entities.companies[name];
    if (!company) {
      return { type: 'error', content: `Company not found: ${name}` };
    }
    // Simplified - full implementation in QueryEngine for now
    return {
      type: 'text',
      content: `Try: showcase company ${name}`,
    };
  }

  private showcasePerson(name: string): CommandResult {
    const person = this.data.entities.people[name];
    if (!person) {
      return { type: 'error', content: `Person not found: ${name}` };
    }
    return {
      type: 'text',
      content: `Try: showcase person ${name}`,
    };
  }

  private showConnections(args: string): CommandResult {
    return {
      type: 'text',
      content: `Try: connections ${args}`,
    };
  }

  private showStats(): CommandResult {
    const totalPosts = Object.keys(this.data.posts).length;
    const totalCompanies = Object.keys(this.data.entities.companies).length;
    const totalInvestors = Object.keys(this.data.entities.investors).length;
    const totalPeople = Object.keys(this.data.entities.people).length;
    const totalTopics = Object.keys(this.data.entities.topics).length;
    const totalQuotes = (this.data.entities.quotes || []).length;

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
