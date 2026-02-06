import type {
  ExtractedData,
  CommandResult,
  PostEntity,
  CompanyEntity,
  PersonEntity,
  SelectableItem,
} from './types';
import * as figlet from 'figlet';

interface BoxSection {
  type: 'header' | 'keyValue' | 'list' | 'text' | 'empty' | 'divider';
  content?: string | string[] | Record<string, string>;
}

export class QueryEngine {
  private data: ExtractedData;
  private currentList: SelectableItem[] = [];
  private boxWidth: number = 64; // Total box width including borders

  constructor(data: ExtractedData, boxWidth: number = 64) {
    this.data = data;
    this.boxWidth = boxWidth;
  }

  /**
   * Generate slug from entity name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  /**
   * Update box width dynamically (for responsive design)
   */
  setBoxWidth(width: number) {
    this.boxWidth = width;
  }

  get BOX_WIDTH(): number {
    return this.boxWidth;
  }

  /**
   * Format text to fit within box (pad or truncate)
   */
  private formatBoxLine(text: string, padChar: string = ' '): string {
    const contentWidth = this.BOX_WIDTH - 4; // Remove 2 chars for borders + 2 for padding
    if (text.length > contentWidth) {
      return text.substring(0, contentWidth - 3) + '...';
    }
    return text.padEnd(contentWidth, padChar);
  }

  /**
   * Create box borders
   */
  private boxTop(): string {
    return '╔' + '═'.repeat(this.BOX_WIDTH - 2) + '╗';
  }

  private boxBottom(): string {
    return '╚' + '═'.repeat(this.BOX_WIDTH - 2) + '╝';
  }

  private boxDivider(): string {
    return '╠' + '═'.repeat(this.BOX_WIDTH - 2) + '╣';
  }

  private boxLine(text: string): string {
    return '║ ' + this.formatBoxLine(text) + ' ║';
  }

  private boxEmpty(): string {
    return this.boxLine('');
  }

  /**
   * Build simple text output from sections (no boxes)
   */
  private buildBox(sections: BoxSection[]): string {
    const lines: string[] = [''];

    sections.forEach((section, index) => {
      switch (section.type) {
        case 'header':
          if (typeof section.content === 'string') {
            lines.push(`>> ${section.content.toUpperCase()}`);
            lines.push('─'.repeat(Math.min(50, section.content.length + 5)));
          }
          break;

        case 'keyValue':
          if (
            typeof section.content === 'object' &&
            !Array.isArray(section.content)
          ) {
            lines.push('');
            Object.entries(section.content).forEach(([key, value]) => {
              lines.push(`  ${key}: ${value}`);
            });
          }
          break;

        case 'list':
          if (Array.isArray(section.content)) {
            lines.push('');
            section.content.forEach((item) => {
              lines.push(`  ${item}`);
            });
          }
          break;

        case 'text':
          if (typeof section.content === 'string') {
            lines.push(section.content);
          }
          break;

        case 'empty':
          lines.push('');
          break;

        case 'divider':
          lines.push('');
          lines.push('─'.repeat(40));
          break;
      }
    });

    lines.push('');
    return lines.join('\n');
  }

  /**
   * Parse and execute a command
   */
  executeCommand(input: string): CommandResult {
    const command = input.trim().toLowerCase();

    // Empty command
    if (!command) {
      return { type: 'text', content: '' };
    }

    // Numeric selection from current list
    if (/^\d+$/.test(command)) {
      return this.selectFromList(parseInt(command));
    }

    // Help command
    if (command === 'help' || command === '?') {
      return this.showHelp();
    }

    // List commands
    if (command === 'list companies' || command === 'companies') {
      return this.listCompanies();
    }

    if (command === 'list investors' || command === 'investors') {
      return this.listInvestors();
    }

    if (command === 'list people' || command === 'people') {
      return this.listPeople();
    }

    if (command === 'list topics' || command === 'topics') {
      return this.listTopics();
    }

    if (command === 'list quotes' || command === 'quotes') {
      return this.listQuotes();
    }

    if (command === 'list facts' || command === 'facts') {
      return this.listFacts();
    }

    if (command === 'list figures' || command === 'figures') {
      return this.listFigures();
    }

    if (command === 'list portfolio' || command === 'portfolio') {
      return this.listPortfolio();
    }

    // Stats command
    if (command === 'stats') {
      return this.showStats();
    }

    // Surprise me / Random commands
    if (command === 'surprise me' || command === 'surprise') {
      return this.surpriseMe();
    }

    // Showcase commands (also accept "discover" for backwards compatibility)
    if (command.startsWith('showcase ') || command.startsWith('discover ')) {
      const args = command.startsWith('showcase ')
        ? input.substring(9).trim()
        : input.substring(9).trim();
      return this.showcase(args);
    }

    // Timeline commands
    if (command.startsWith('timeline ')) {
      const entity = input.substring(9).trim();
      return this.showTimeline(entity);
    }

    // Connection commands
    if (command.startsWith('connections ') || command.startsWith('connect ')) {
      const args = command.startsWith('connections ')
        ? input.substring(12).trim()
        : input.substring(8).trim();
      return this.showConnections(args);
    }

    // Easter eggs
    if (command === 'whoami') {
      return this.whoami();
    }

    if (command === 'history') {
      return {
        type: 'text',
        content: 'Command history is shown in your terminal session above.',
      };
    }

    if (command === 'clear' || command === 'cls') {
      return {
        type: 'text',
        content: '// Clear command - handled by component',
      };
    }

    if (command.startsWith('cowsay ')) {
      const text = input.substring(7).trim();
      return this.cowsay(text);
    }

    if (command === 'cowsay') {
      // No argument - get a random fortune
      const { text, showcaseUrl } = this.fortune();
      return this.cowsay(text, showcaseUrl);
    }

    if (command === 'bork' || command === 'bork bork' || command === 'bork bork bork') {
      return this.bork();
    }

    if (command.startsWith('figlet ')) {
      const text = input.substring(7).trim();
      return this.figlet(text);
    }

    if (command === 'figlet') {
      return this.figlet('PWV');
    }

    if (command === 'hello') {
      return this.hello();
    }

    // pwvsay and aliases (tomsay, dtsay, dpsay) with custom text
    if (
      command.startsWith('pwvsay ') ||
      command.startsWith('tomsay ') ||
      command.startsWith('dtsay ') ||
      command.startsWith('dpsay ')
    ) {
      const cmdLength = command.indexOf(' ') + 1;
      const text = input.substring(cmdLength).trim();
      return this.pwvsay(text);
    }

    // pwvsay - quotes from PWV team
    if (command === 'pwvsay') {
      const { text, showcaseUrl } = this.getQuoteFromSpeakers(['Tom Preston-Werner', 'David Price', 'David Thyresson', 'PWV']);
      return this.pwvsay(text, showcaseUrl);
    }

    // tomsay - quotes from Tom Preston-Werner
    if (command === 'tomsay') {
      const { text, showcaseUrl } = this.getQuoteFromSpeakers(['Tom Preston-Werner', 'Tom']);
      return this.pwvsay(text, showcaseUrl);
    }

    // dtsay - quotes from David Thyresson
    if (command === 'dtsay') {
      const { text, showcaseUrl } = this.getQuoteFromSpeakers(['David Thyresson', 'David T.']);
      return this.pwvsay(text, showcaseUrl);
    }

    // dpsay - quotes from David Price
    if (command === 'dpsay') {
      const { text, showcaseUrl } = this.getQuoteFromSpeakers(['David Price', 'David P.']);
      return this.pwvsay(text, showcaseUrl);
    }

    if (command === 'fortune | pwvsay') {
      const { text, showcaseUrl } = this.getQuoteFromSpeakers(['Tom Preston-Werner', 'David Price', 'David Thyresson', 'PWV']);
      return this.pwvsay(text, showcaseUrl);
    }

    if (command === 'fortune') {
      const { text, showcaseUrl } = this.fortune();
      let content = text;
      if (showcaseUrl) {
        content += `\n\n💬 View & share: ${showcaseUrl}`;
      }
      return { type: 'text', content };
    }

    if (command === 'fortune | cowsay') {
      const { text, showcaseUrl } = this.fortune();
      return this.cowsay(text, showcaseUrl);
    }

    // Unknown command
    return {
      type: 'error',
      content: `Unknown command: ${input}\nType 'help' for available commands.`,
    };
  }

  /**
   * Show help message
   */
  private showHelp(): CommandResult {
    const helpText = `
>> PWV TERMINAL
─────────────────────────────────────────────────────

LIST COMMANDS:
  • companies              List all companies
  • investors              List all investors/VCs
  • people                 List all people
  • topics                 List all topics
  • quotes                 Browse all quotes
  • facts                  Browse all facts
  • figures                Browse all figures/metrics
  • portfolio              Browse PWV portfolio companies
  • <number>               Select item from last list

SHOWCASE COMMANDS:
  • showcase random        Random fact/figure/entity
  • showcase company <name>   Info about a company
  • showcase investor <name>  Info about an investor/VC
  • showcase person <name>    Info about a person
  • showcase topic <topic>    Posts about a topic

EXPLORATION:
  • surprise me            Random combination of entities
  • timeline <company>     Chronological view of mentions
  • connections <A> <B>    How two entities relate
  • stats                  Fun statistics about the corpus

OTHER:
  • help                   Show this help message
  • clear                  Clear the terminal
  • whoami                 Random PWV philosophy quote
  • fortune                Get any random quote from corpus
  • hello                  Random greeting
  • pwvsay                 PWV team quote with PWV logo
  • pwvsay <text>          PWV logo says your text
  • fortune | pwvsay       PWV team quote with PWV logo
  • tomsay                 Tom Preston-Werner quote with PWV logo
  • dtsay                  David Thyresson quote with PWV logo
  • dpsay                  David Price quote with PWV logo
  • cowsay                 Any random quote with ASCII cow
  • cowsay <text>          ASCII cow says your text
  • fortune | cowsay       Any random quote with ASCII cow
  • figlet <text>          Generate ASCII art text
  • bork                   Bork bork bork!

─────────────────────────────────────────────────────

TIP: Type 'companies' to see all companies, then type a number.
Example: companies → 1 → (shows company details)
    `;

    return { type: 'text', content: helpText };
  }

  /**
   * List all companies with numbers
   */
  private listCompanies(): CommandResult {
    const companies = Object.keys(this.data.entities.companies).sort();

    this.currentList = companies.map((name, index) => ({
      id: name,
      label: name,
      type: 'company',
      data: this.data.entities.companies[name],
    }));

    const listItems = companies.map((name, index) => {
      const company = this.data.entities.companies[name];
      const num = (index + 1).toString().padStart(2, ' ');
      return `${num}. ${name} (${company.mentions} mentions)`;
    });

    const output = this.buildBox([
      { type: 'header', content: 'ALL COMPANIES' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view details (e.g., "1")' },
    ]);

    return { type: 'list', content: output };
  }

  /**
   * List all investors with numbers
   */
  private listInvestors(): CommandResult {
    const investors = Object.keys(this.data.entities.investors).sort();

    this.currentList = investors.map((name, index) => ({
      id: name,
      label: name,
      type: 'investor',
      data: this.data.entities.investors[name],
    }));

    const listItems = investors.map((name, index) => {
      const investor = this.data.entities.investors[name];
      const num = (index + 1).toString().padStart(2, ' ');
      return `${num}. ${name} (${investor.mentions} mentions)`;
    });

    const output = this.buildBox([
      { type: 'header', content: 'ALL INVESTORS' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view details (e.g., "1")' },
    ]);

    return { type: 'list', content: output };
  }

  /**
   * List all people with numbers
   */
  private listPeople(): CommandResult {
    const people = Object.keys(this.data.entities.people).sort();

    this.currentList = people.map((name, index) => ({
      id: name,
      label: name,
      type: 'person',
      data: this.data.entities.people[name],
    }));

    const listItems = people.map((name, index) => {
      const person = this.data.entities.people[name];
      const num = (index + 1).toString().padStart(2, ' ');
      return `${num}. ${name} - ${person.role || 'Unknown'}`;
    });

    const output = this.buildBox([
      { type: 'header', content: 'ALL PEOPLE' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view details (e.g., "1")' },
    ]);

    return { type: 'list', content: output };
  }

  /**
   * List all topics with numbers
   */
  private listTopics(): CommandResult {
    const topics = Object.keys(this.data.entities.topics).sort();

    this.currentList = topics.map((name, index) => ({
      id: name,
      label: name,
      type: 'topic',
      data: this.data.entities.topics[name],
    }));

    const listItems = topics.map((name, index) => {
      const topic = this.data.entities.topics[name];
      const num = (index + 1).toString().padStart(2, ' ');
      return `${num}. ${name} (${topic.mentions} posts)`;
    });

    const output = this.buildBox([
      { type: 'header', content: 'ALL TOPICS' },
      { type: 'list', content: listItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to view details (e.g., "1")' },
    ]);

    return { type: 'list', content: output };
  }

  /**
   * List all quotes
   */
  private listQuotes(): CommandResult {
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

    const output = this.buildBox([
      { type: 'header', content: 'ALL QUOTES' },
      { type: 'text', content: `Found ${quotes.length} quotes` },
      { type: 'divider' },
      { type: 'list', content: listItems },
    ]);

    return { type: 'list', content: output };
  }

  /**
   * List all facts from all posts
   */
  private listFacts(): CommandResult {
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

    const output = this.buildBox([
      { type: 'header', content: 'ALL FACTS' },
      { type: 'text', content: `Found ${facts.length} facts` },
      { type: 'divider' },
      { type: 'list', content: listItems },
    ]);

    return { type: 'list', content: output };
  }

  /**
   * List all figures/metrics from all posts
   */
  private listFigures(): CommandResult {
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

    const output = this.buildBox([
      { type: 'header', content: 'ALL FIGURES' },
      { type: 'text', content: `Found ${figures.length} figures` },
      { type: 'divider' },
      { type: 'list', content: listItems },
    ]);

    return { type: 'list', content: output };
  }

  /**
   * List all portfolio companies
   */
  private listPortfolio(): CommandResult {
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
    this.currentList = allPortfolio.map((company, index) => ({
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

    const output = this.buildBox([
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

    return { type: 'list', content: output };
  }

  /**
   * Show portfolio company details
   */
  private showPortfolioCompany(company: any): CommandResult {
    const portfolioUrl = `/portfolio/#${company.slug}`;

    // Check if company has entity data (posts)
    const entityData = this.data.entities.companies[company.name];
    const showcaseUrl = entityData
      ? `/showcase/companies/${this.generateSlug(company.name)}/`
      : null;

    const sections: BoxSection[] = [
      { type: 'header', content: 'PORTFOLIO COMPANY' },
      {
        type: 'keyValue',
        content: {
          NAME: company.name,
          FUND: company.fund,
          TAGS: company.tags.join(', '),
          WEBSITE: company.url,
          'PORTFOLIO PAGE': portfolioUrl,
          ...(showcaseUrl ? { SHOWCASE: showcaseUrl } : {}),
          ...(company.formerly ? { FORMERLY: company.formerly } : {}),
          ...(company.acquiredBy ? { 'ACQUIRED BY': company.acquiredBy } : {}),
        },
      },
    ];

    // If company has entity data, show posts info
    if (entityData) {
      sections.push({ type: 'divider' });
      sections.push({
        type: 'text',
        content: `📰 This company has ${entityData.mentions} mentions in ${entityData.posts.length} posts`,
      });
      sections.push({
        type: 'text',
        content: `Type: showcase company ${company.name}`,
      });
    }

    const output = this.buildBox(sections);

    return {
      type: 'company',
      content: output,
      data: { company: company.name },
    };
  }

  /**
   * Select an item from the current list by number
   */
  private selectFromList(num: number): CommandResult {
    if (this.currentList.length === 0) {
      return {
        type: 'error',
        content:
          'No active list. Try "companies", "people", or "topics" first.',
      };
    }

    const index = num - 1;
    if (index < 0 || index >= this.currentList.length) {
      return {
        type: 'error',
        content: `Invalid selection. Please choose 1-${this.currentList.length}.`,
      };
    }

    const item = this.currentList[index];

    // Route to appropriate showcase command
    switch (item.type) {
      case 'company':
        // Check if this is a portfolio company selection
        if (item.data && 'fund' in item.data) {
          return this.showPortfolioCompany(item.data);
        }
        // Otherwise it's an entity company
        return this.discoverCompanyWithPosts(item.id);
      case 'investor':
        return this.discoverInvestorWithPosts(item.id);
      case 'person':
        return this.discoverPersonWithPosts(item.id);
      case 'topic':
        return this.discoverTopicWithPosts(item.id);
      case 'post':
        return this.showPost(item.id);
      default:
        return { type: 'error', content: 'Unknown item type.' };
    }
  }

  /**
   * Show statistics
   */
  private showStats(): CommandResult {
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

    // Calculate most mentioned company
    const topCompany = Object.entries(this.data.entities.companies).sort(
      ([, a], [, b]) => b.mentions - a.mentions
    )[0];

    // Calculate most mentioned investor
    const topInvestor = Object.entries(this.data.entities.investors).sort(
      ([, a], [, b]) => b.mentions - a.mentions
    )[0];

    // Calculate most mentioned person
    const topPerson = Object.entries(this.data.entities.people).sort(
      ([, a], [, b]) => b.mentions - a.mentions
    )[0];

    // Calculate most mentioned topic
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

  /**
   * Showcase command handler
   */
  private showcase(args: string): CommandResult {
    const lowerArgs = args.toLowerCase().trim();

    // Random showcase
    if (lowerArgs === 'random') {
      return this.showcaseRandom();
    }

    // Company showcase
    if (lowerArgs.startsWith('company ')) {
      const companyName = args.substring(8).trim();
      return this.showcaseCompany(companyName);
    }

    // Investor showcase
    if (lowerArgs.startsWith('investor ')) {
      const investorName = args.substring(9).trim();
      return this.showcaseInvestor(investorName);
    }

    // Person showcase
    if (lowerArgs.startsWith('person ')) {
      const personName = args.substring(7).trim();
      return this.showcasePerson(personName);
    }

    // Topic showcase
    if (lowerArgs.startsWith('topic ')) {
      const topicName = args.substring(6).trim();
      return this.showcaseTopic(topicName);
    }

    return {
      type: 'error',
      content: `Invalid showcase command. Try:\n- showcase random\n- showcase company <name>\n- showcase investor <name>\n- showcase person <name>\n- showcase topic <topic>`,
    };
  }

  /**
   * Showcase random entity
   */
  private showcaseRandom(): CommandResult {
    const types = ['company', 'person', 'fact', 'figure', 'quote'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    switch (randomType) {
      case 'company': {
        const companies = Object.keys(this.data.entities.companies);
        const randomCompany =
          companies[Math.floor(Math.random() * companies.length)];
        return this.showcaseCompany(randomCompany);
      }
      case 'person': {
        const people = Object.keys(this.data.entities.people);
        const randomPerson = people[Math.floor(Math.random() * people.length)];
        return this.showcasePerson(randomPerson);
      }
      case 'fact': {
        const posts = Object.values(this.data.posts);
        const postsWithFacts = posts.filter(
          (p) => p.facts && p.facts.length > 0
        );
        if (postsWithFacts.length === 0) {
          return { type: 'text', content: 'No facts found in the corpus.' };
        }
        const randomPost =
          postsWithFacts[Math.floor(Math.random() * postsWithFacts.length)];
        const randomFact =
          randomPost.facts[Math.floor(Math.random() * randomPost.facts.length)];

        const postSlug = Object.keys(this.data.posts).find(
          (key) => this.data.posts[key].title === randomPost.title
        );

        const factDisplay = `
>> RANDOM FACT
─────────────────────────────────────────────────────

"${randomFact.text}"

Category: ${randomFact.category}
Source: ${randomPost.title}

READ MORE: /news/${postSlug}/
        `;
        return { type: 'fact', content: factDisplay };
      }
      case 'figure': {
        const posts = Object.values(this.data.posts);
        const postsWithFigures = posts.filter(
          (p) => p.figures && p.figures.length > 0
        );
        if (postsWithFigures.length === 0) {
          return { type: 'text', content: 'No figures found in the corpus.' };
        }
        const randomPost =
          postsWithFigures[Math.floor(Math.random() * postsWithFigures.length)];
        const randomFigure =
          randomPost.figures[
            Math.floor(Math.random() * randomPost.figures.length)
          ];

        const figureDisplay = `
>> RANDOM FIGURE
─────────────────────────────────────────────────────

Value: ${randomFigure.value}${randomFigure.unit}
Context: ${randomFigure.context}
Source: ${randomPost.title}
        `;
        return { type: 'text', content: figureDisplay };
      }
      case 'quote': {
        const quotes = this.data.entities.quotes || [];
        if (quotes.length === 0) {
          return { type: 'text', content: 'No quotes found in the corpus.' };
        }
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const contextLine = randomQuote.context
          ? `Context: ${randomQuote.context}\n`
          : '';
        const dateLine = randomQuote.pubDate
          ? `Date: ${randomQuote.pubDate}\n`
          : '';

        const quoteDisplay = `
>> QUOTE OF THE DAY
─────────────────────────────────────────────────────

"${randomQuote.quote}"

— ${randomQuote.speaker}
${contextLine}${dateLine}
From: ${randomQuote.postTitle}
        `;
        return { type: 'text', content: quoteDisplay };
      }
      default:
        return { type: 'text', content: 'Something went wrong.' };
    }
  }

  /**
   * Discover company with numbered post list
   */
  private discoverCompanyWithPosts(name: string): CommandResult {
    const companyName = Object.keys(this.data.entities.companies).find(
      (c) => c.toLowerCase() === name.toLowerCase()
    );

    if (!companyName) {
      return {
        type: 'error',
        content: `Company "${name}" not found.\nTry 'companies' to see all companies.`,
      };
    }

    const company = this.data.entities.companies[companyName];
    const companySlug = this.generateSlug(companyName);
    const showcaseUrl = `/showcase/companies/${companySlug}/`;

    // Create selectable list of posts
    this.currentList = company.posts.map((slug) => ({
      id: slug,
      label: this.data.posts[slug]?.title || slug,
      type: 'post',
      data: { slug },
    }));

    const postItems = company.posts.map((slug, index) => {
      const post = this.data.posts[slug];
      const num = (index + 1).toString().padStart(2, ' ');
      const title = post ? post.title : slug;
      return `${num}. ${title}`;
    });

    const sections: BoxSection[] = [
      { type: 'header', content: 'COMPANY PROFILE' },
      {
        type: 'keyValue',
        content: {
          NAME: companyName,
          MENTIONS: `${company.mentions} posts`,
          SHOWCASE: showcaseUrl,
          ...(company.description ? { ABOUT: company.description } : {}),
        },
      },
      { type: 'divider' },
      { type: 'text', content: 'POSTS:' },
      { type: 'list', content: postItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to open that post (e.g., "1")' },
    ];

    const output = this.buildBox(sections);

    return { type: 'company', content: output, data: { company: companyName } };
  }

  /**
   * Showcase company (redirects to version with posts)
   */
  private showcaseCompany(name: string): CommandResult {
    return this.discoverCompanyWithPosts(name);
  }

  /**
   * Discover investor with posts
   */
  private discoverInvestorWithPosts(name: string): CommandResult {
    const investorName = Object.keys(this.data.entities.investors).find(
      (i) => i.toLowerCase() === name.toLowerCase()
    );

    if (!investorName) {
      return {
        type: 'error',
        content: `Investor "${name}" not found.\nTry 'investors' to see all investors.`,
      };
    }

    const investor = this.data.entities.investors[investorName];
    const investorSlug = this.generateSlug(investorName);
    const showcaseUrl = `/showcase/investors/${investorSlug}/`;

    // Create selectable list of posts
    this.currentList = investor.posts.map((slug) => ({
      id: slug,
      label: this.data.posts[slug]?.title || slug,
      type: 'post',
      data: { slug },
    }));

    const postItems = investor.posts.map((slug, index) => {
      const post = this.data.posts[slug];
      const num = (index + 1).toString().padStart(2, ' ');
      const title = post ? post.title : slug;
      return `${num}. ${title}`;
    });

    const sections: BoxSection[] = [
      { type: 'header', content: 'INVESTOR PROFILE' },
      {
        type: 'keyValue',
        content: {
          NAME: investorName,
          MENTIONS: `${investor.mentions} posts`,
          SHOWCASE: showcaseUrl,
        },
      },
      { type: 'divider' },
      { type: 'text', content: 'POSTS:' },
      { type: 'list', content: postItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to open that post (e.g., "1")' },
    ];

    const output = this.buildBox(sections);

    return {
      type: 'investor',
      content: output,
      data: { investor: investorName },
    };
  }

  /**
   * Showcase investor (redirects to version with posts)
   */
  private showcaseInvestor(name: string): CommandResult {
    return this.discoverInvestorWithPosts(name);
  }

  /**
   * Discover person with numbered post list
   */
  private discoverPersonWithPosts(name: string): CommandResult {
    const personName = Object.keys(this.data.entities.people).find(
      (p) => p.toLowerCase() === name.toLowerCase()
    );

    if (!personName) {
      return {
        type: 'error',
        content: `Person "${name}" not found.\nTry 'people' to see all people.`,
      };
    }

    const person = this.data.entities.people[personName];
    const personSlug = this.generateSlug(personName);
    const showcaseUrl = `/showcase/people/${personSlug}/`;

    // Create selectable list of posts
    this.currentList = person.posts.map((slug) => ({
      id: slug,
      label: this.data.posts[slug]?.title || slug,
      type: 'post',
      data: { slug },
    }));

    const postItems = person.posts.map((slug, index) => {
      const post = this.data.posts[slug];
      const num = (index + 1).toString().padStart(2, ' ');
      const title = post ? post.title : slug;
      return `${num}. ${title}`;
    });

    const output = this.buildBox([
      { type: 'header', content: 'PERSON PROFILE' },
      {
        type: 'keyValue',
        content: {
          NAME: personName,
          ROLE: person.role || 'Unknown',
          MENTIONS: `${person.mentions} posts`,
          SHOWCASE: showcaseUrl,
        },
      },
      { type: 'divider' },
      { type: 'text', content: 'POSTS:' },
      { type: 'list', content: postItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to open that post (e.g., "1")' },
    ]);

    return { type: 'person', content: output, data: { person: personName } };
  }

  /**
   * Showcase person (redirects to version with posts)
   */
  private showcasePerson(name: string): CommandResult {
    return this.discoverPersonWithPosts(name);
  }

  /**
   * Discover topic with numbered post list
   */
  private discoverTopicWithPosts(name: string): CommandResult {
    const topicName = Object.keys(this.data.entities.topics).find(
      (t) => t.toLowerCase() === name.toLowerCase()
    );

    if (!topicName) {
      return {
        type: 'error',
        content: `Topic "${name}" not found.\nTry 'topics' to see all topics.`,
      };
    }

    const topic = this.data.entities.topics[topicName];
    const topicSlug = this.generateSlug(topicName);
    const showcaseUrl = `/showcase/topics/${topicSlug}/`;

    // Create selectable list of posts
    this.currentList = topic.posts.map((slug) => ({
      id: slug,
      label: this.data.posts[slug]?.title || slug,
      type: 'post',
      data: { slug },
    }));

    const postItems = topic.posts.map((slug, index) => {
      const post = this.data.posts[slug];
      const num = (index + 1).toString().padStart(2, ' ');
      const title = post ? post.title : slug;
      return `${num}. ${title}`;
    });

    const output = this.buildBox([
      { type: 'header', content: 'TOPIC EXPLORER' },
      {
        type: 'keyValue',
        content: {
          TOPIC: topicName,
          MENTIONS: `${topic.mentions} posts`,
          SHOWCASE: showcaseUrl,
        },
      },
      { type: 'divider' },
      { type: 'text', content: 'RELATED POSTS:' },
      { type: 'list', content: postItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to open that post (e.g., "1")' },
    ]);

    return { type: 'topic', content: output, data: { topic: topicName } };
  }

  /**
   * Showcase topic (redirects to version with posts)
   */
  private showcaseTopic(name: string): CommandResult {
    return this.discoverTopicWithPosts(name);
  }

  /**
   * Show a specific post (opens in new tab)
   */
  private showPost(slug: string): CommandResult {
    const post = this.data.posts[slug];
    if (!post) {
      return {
        type: 'error',
        content: `Post "${slug}" not found.`,
      };
    }

    // Open the post in a new tab
    const url = `/news/${slug}/`;

    const output = this.buildBox([
      { type: 'header', content: 'OPENING POST' },
      {
        type: 'keyValue',
        content: {
          TITLE: post.title,
          AUTHOR: post.author || 'Unknown',
          DATE: post.pubDate || 'Unknown',
        },
      },
      { type: 'divider' },
      { type: 'text', content: 'Opening: ' + url },
      { type: 'empty' },
      {
        type: 'text',
        content: 'Click the link above or it will open automatically.',
      },
    ]);

    // Return with post data so component can open it
    return {
      type: 'post',
      content: output,
      data: { slug, url, autoOpen: true },
    };
  }

  /**
   * Show timeline for an entity
   */
  private showTimeline(entity: string): CommandResult {
    // Search in companies first
    const companyName = Object.keys(this.data.entities.companies).find(
      (c) => c.toLowerCase() === entity.toLowerCase()
    );

    if (companyName) {
      const company = this.data.entities.companies[companyName];
      const timeline = company.posts
        .map((slug) => {
          const post = this.data.posts[slug];
          return {
            date: post.pubDate || 'Unknown',
            title: post.title,
            slug,
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));

      const timelineText = timeline
        .map(
          (entry) =>
            `  ${entry.date} → ${entry.title}\n               /news/${entry.slug}/`
        )
        .join('\n\n');

      const output = `
>> TIMELINE: ${companyName}
─────────────────────────────────────────────────────

${timelineText}
      `;

      return { type: 'timeline', content: output };
    }

    return {
      type: 'error',
      content: `Entity "${entity}" not found for timeline.`,
    };
  }

  /**
   * Show connections between entities
   */
  private showConnections(args: string): CommandResult {
    const parts = args.split(/\s+and\s+|\s+/);
    if (parts.length < 2) {
      return {
        type: 'error',
        content: 'Usage: connections <entity1> <entity2>',
      };
    }

    const entity1 = parts[0].trim();
    const entity2 = parts.slice(1).join(' ').trim();

    // Find common posts
    const posts1 = this.findEntityPosts(entity1);
    const posts2 = this.findEntityPosts(entity2);

    if (!posts1 || !posts2) {
      return {
        type: 'error',
        content: `One or both entities not found: "${entity1}", "${entity2}"`,
      };
    }

    const commonPosts = posts1.filter((p) => posts2.includes(p));

    if (commonPosts.length === 0) {
      return {
        type: 'connection',
        content: `No direct connections found between "${entity1}" and "${entity2}".`,
      };
    }

    const connectionText = commonPosts
      .map((slug) => {
        const post = this.data.posts[slug];
        return `  • ${post.title}\n    /news/${slug}/`;
      })
      .join('\n\n');

    const output = `
>> CONNECTIONS
─────────────────────────────────────────────────────

"${entity1}" ←→ "${entity2}"

${commonPosts.length} common post(s) found:

${connectionText}
    `;

    return { type: 'connection', content: output };
  }

  /**
   * Find posts for any entity type
   */
  private findEntityPosts(entity: string): string[] | null {
    // Try companies
    const company = Object.keys(this.data.entities.companies).find(
      (c) => c.toLowerCase() === entity.toLowerCase()
    );
    if (company) {
      return this.data.entities.companies[company].posts;
    }

    // Try people
    const person = Object.keys(this.data.entities.people).find(
      (p) => p.toLowerCase() === entity.toLowerCase()
    );
    if (person) {
      return this.data.entities.people[person].posts;
    }

    // Try topics
    const topic = Object.keys(this.data.entities.topics).find(
      (t) => t.toLowerCase() === entity.toLowerCase()
    );
    if (topic) {
      return this.data.entities.topics[topic].posts;
    }

    return null;
  }

  /**
   * Surprise me - random combination
   */
  private surpriseMe(): CommandResult {
    const surpriseTypes = [
      'random_company_fact',
      'random_person_insight',
      'random_connection',
      'interesting_stat',
    ];

    const randomType =
      surpriseTypes[Math.floor(Math.random() * surpriseTypes.length)];

    switch (randomType) {
      case 'random_company_fact': {
        const companies = Object.keys(this.data.entities.companies);
        const randomCompany =
          companies[Math.floor(Math.random() * companies.length)];
        return this.showcaseCompany(randomCompany);
      }
      case 'random_person_insight': {
        const people = Object.keys(this.data.entities.people);
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

  /**
   * Whoami easter egg - shows PWV philosophy quotes
   */
  private whoami(): CommandResult {
    const quotes = this.data.entities.quotes || [];

    // Filter for PWV-related speakers (Tom, David P., David T., or general PWV)
    const pwvSpeakers = [
      'Tom Preston-Werner',
      'David Price',
      'David Thyresson',
      'PWV',
    ];
    const pwvQuotes = quotes.filter((q) =>
      pwvSpeakers.some((speaker) =>
        q.speaker.toLowerCase().includes(speaker.toLowerCase())
      )
    );

    // Use PWV quotes if available, otherwise fall back to any quote
    const quotePool = pwvQuotes.length > 0 ? pwvQuotes : quotes;

    if (quotePool.length > 0) {
      const randomQuote =
        quotePool[Math.floor(Math.random() * quotePool.length)];
      return {
        type: 'text',
        content: `\n  "${randomQuote.quote}"\n\n  — ${randomQuote.speaker}\n`,
      };
    }

    // Fallback if no quotes available
    return {
      type: 'text',
      content: '\n  "We invest to help make the future possible."\n\n  — PWV\n',
    };
  }

  /**
   * Get a random quote from specific speakers
   * Returns both text and optional showcase link
   */
  private getQuoteFromSpeakers(speakers: string[]): { text: string; showcaseUrl?: string } {
    const quotes = this.data.entities.quotes || [];
    
    // Filter quotes by speaker
    const filteredQuotes = quotes.filter(q =>
      speakers.some(speaker => q.speaker.toLowerCase().includes(speaker.toLowerCase()))
    );

    // Use filtered quotes if available, otherwise fall back to all quotes
    const quotePool = filteredQuotes.length > 0 ? filteredQuotes : quotes;
    
    if (quotePool.length === 0) {
      // Fallback if no quotes available
      return {
        text: '"We invest to help make the future possible."\n— PWV',
      };
    }

    // Find the index in the original quotes array for the showcase URL
    const randomQuote = quotePool[Math.floor(Math.random() * quotePool.length)];
    const quoteIndex = quotes.indexOf(randomQuote);
    const quoteId = `${randomQuote.postSlug}-${quoteIndex}`;
    const showcaseUrl = `/showcase/quotes/${quoteId}/`;

    return {
      text: `"${randomQuote.quote}"\n— ${randomQuote.speaker}`,
      showcaseUrl,
    };
  }

  /**
   * Fortune - get a random quote from any speaker
   * Returns both text and optional showcase link
   */
  private fortune(): { text: string; showcaseUrl?: string } {
    const quotes = this.data.entities.quotes || [];
    
    if (quotes.length === 0) {
      // Fallback if no quotes available
      return {
        text: '"We invest to help make the future possible."\n— PWV',
      };
    }

    const quoteIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[quoteIndex];
    const quoteId = `${randomQuote.postSlug}-${quoteIndex}`;
    const showcaseUrl = `/showcase/quotes/${quoteId}/`;

    return {
      text: `"${randomQuote.quote}"\n— ${randomQuote.speaker}`,
      showcaseUrl,
    };
  }

  /**
   * PWVsay - like cowsay but with PWV logo
   */
  private pwvsay(text: string, showcaseUrl?: string): CommandResult {
    if (!text) {
      text = 'Type something after pwvsay!';
    }

    // Handle multi-line text by wrapping long lines
    const maxWidth = 50;
    const lines: string[] = [];

    // Split by newlines first
    const paragraphs = text.split('\n');

    paragraphs.forEach((paragraph) => {
      if (paragraph.length <= maxWidth) {
        lines.push(paragraph);
      } else {
        // Wrap long lines
        const words = paragraph.split(' ');
        let currentLine = '';

        words.forEach((word) => {
          if ((currentLine + ' ' + word).trim().length <= maxWidth) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });

        if (currentLine) lines.push(currentLine);
      }
    });

    // Calculate max line length
    const maxLen = Math.max(...lines.map((l) => l.length), 10);

    // Build the speech bubble
    const topBorder = ' ' + '_'.repeat(maxLen + 2);
    const bottomBorder = ' ' + '-'.repeat(maxLen + 2);

    let bubble = topBorder + '\n';

    if (lines.length === 1) {
      bubble += `< ${lines[0].padEnd(maxLen)} >\n`;
    } else {
      lines.forEach((line, i) => {
        const paddedLine = line.padEnd(maxLen);
        if (i === 0) {
          bubble += `/ ${paddedLine} \\\n`;
        } else if (i === lines.length - 1) {
          bubble += `\\ ${paddedLine} /\n`;
        } else {
          bubble += `| ${paddedLine} |\n`;
        }
      });
    }

    bubble += bottomBorder + '\n';
    // PWV logo: green square with filled half circle at top
    bubble += `        \\    ┌────┐\n`;
    bubble += `         \\   │▄██▄│\n`;
    bubble += `             └────┘\n`;

    // Add showcase link if available
    if (showcaseUrl) {
      bubble += `\n💬 View & share: ${showcaseUrl}\n`;
    }

    return { type: 'text', content: bubble };
  }

  /**
   * Hello - Random greetings
   */
  private hello(): CommandResult {
    const greetings = [
      'Hello, world!',
      'Hello, Dave.',
      'Hello there.',
      'hello?',
      'Hello, friend.',
      'Hi there! 👋',
      'Greetings!',
      'Hello, human.',
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    return {
      type: 'text',
      content: `\n${randomGreeting}\n`,
    };
  }

  /**
   * Bork bork bork! - Swedish Chef easter egg
   */
  private bork(): CommandResult {
    const borkVariations = [
      `Bork bork bork!`,
      `Bork! Bork! Bork!`,
      `Der bork bork bork!`,
      `Yorn desh born, der ritt de gitt der gue,
Orn desh, dee born desh, de umn børk! børk! børk!`,
      `Børk børk børk!
Der Swedish Chef is in der hoose!`,
      `Bork bork bork!
*throws random kitchen utensils*`,
      `Bork bork! Der terminal is yöörking!`,
    ];

    const randomBork = borkVariations[Math.floor(Math.random() * borkVariations.length)];

    return {
      type: 'text',
      content: `
   🧑‍🍳
  \\|/
   |
  / \\

${randomBork}

— Der Swedish Chef
`,
    };
  }

  /**
   * Figlet - ASCII art text generator
   */
  private figlet(text: string): CommandResult {
    if (!text) {
      return {
        type: 'error',
        content: 'Usage: figlet <text>\nExample: figlet PWV',
      };
    }

    try {
      const asciiArt = figlet.textSync(text, {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      });

      return {
        type: 'text',
        content: asciiArt,
      };
    } catch (error) {
      return {
        type: 'error',
        content: `Error generating ASCII art: ${error}`,
      };
    }
  }

  /**
   * Cowsay easter egg
   */
  private cowsay(text: string, showcaseUrl?: string): CommandResult {
    if (!text) {
      text = 'Type something after cowsay!';
    }

    // Handle multi-line text by wrapping long lines
    const maxWidth = 50;
    const lines: string[] = [];

    // Split by newlines first
    const paragraphs = text.split('\n');

    paragraphs.forEach((paragraph) => {
      if (paragraph.length <= maxWidth) {
        lines.push(paragraph);
      } else {
        // Wrap long lines
        const words = paragraph.split(' ');
        let currentLine = '';

        words.forEach((word) => {
          if ((currentLine + ' ' + word).trim().length <= maxWidth) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });

        if (currentLine) lines.push(currentLine);
      }
    });

    // Calculate max line length
    const maxLen = Math.max(...lines.map((l) => l.length), 10);

    // Build the speech bubble
    const topBorder = ' ' + '_'.repeat(maxLen + 2);
    const bottomBorder = ' ' + '-'.repeat(maxLen + 2);

    let bubble = topBorder + '\n';

    if (lines.length === 1) {
      bubble += `< ${lines[0].padEnd(maxLen)} >\n`;
    } else {
      lines.forEach((line, i) => {
        const paddedLine = line.padEnd(maxLen);
        if (i === 0) {
          bubble += `/ ${paddedLine} \\\n`;
        } else if (i === lines.length - 1) {
          bubble += `\\ ${paddedLine} /\n`;
        } else {
          bubble += `| ${paddedLine} |\n`;
        }
      });
    }

    bubble += bottomBorder + '\n';
    bubble += `        \\   ^__^\n`;
    bubble += `         \\  (oo)\\_______\n`;
    bubble += `            (__)\\       )\\/\\\n`;
    bubble += `                ||----w |\n`;
    bubble += `                ||     ||\n`;

    // Add showcase link if available
    if (showcaseUrl) {
      bubble += `\n💬 View & share: ${showcaseUrl}\n`;
    }

    return { type: 'text', content: bubble };
  }
}
