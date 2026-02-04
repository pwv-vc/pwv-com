import type {
  ExtractedData,
  CommandResult,
  PostEntity,
  CompanyEntity,
  PersonEntity,
  SelectableItem,
} from './types';

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
          if (typeof section.content === 'object' && !Array.isArray(section.content)) {
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

    // Stats command
    if (command === 'stats') {
      return this.showStats();
    }

    // Surprise me / Random commands
    if (command === 'surprise me' || command === 'surprise') {
      return this.surpriseMe();
    }

    // Discovery commands
    if (command.startsWith('discover ')) {
      const args = input.substring(9).trim();
      return this.discover(args);
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
>> PWV DISCOVERY TERMINAL
─────────────────────────────────────────────────────

LIST COMMANDS:
  • companies              List all companies
  • investors              List all investors/VCs
  • people                 List all people
  • topics                 List all topics
  • quotes                 Browse all quotes
  • <number>               Select item from last list

DISCOVERY COMMANDS:
  • discover random        Random fact/figure/entity
  • discover company <name>   Info about a company
  • discover investor <name>  Info about an investor/VC
  • discover person <name>    Info about a person
  • discover topic <topic>    Posts about a topic

EXPLORATION:
  • surprise me            Random combination of entities
  • timeline <company>     Chronological view of mentions
  • connections <A> <B>    How two entities relate
  • stats                  Fun statistics about the corpus

OTHER:
  • help                   Show this help message
  • clear                  Clear the terminal
  • whoami                 Random PWV philosophy quote
  • cowsay <text>          ASCII art fun

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
   * Select an item from the current list by number
   */
  private selectFromList(num: number): CommandResult {
    if (this.currentList.length === 0) {
      return {
        type: 'error',
        content: 'No active list. Try "companies", "people", or "topics" first.',
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

    // Route to appropriate discovery command
    switch (item.type) {
      case 'company':
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

    const stats = `
>> CORPUS STATISTICS
─────────────────────────────────────────────────────

📊 OVERVIEW:
  Total Posts: ${totalPosts}
  Companies Mentioned: ${totalCompanies}
  Investors Mentioned: ${totalInvestors}
  People Mentioned: ${totalPeople}
  Topics Identified: ${totalTopics}
  Quotes Captured: ${totalQuotes}

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
   * Discover command handler
   */
  private discover(args: string): CommandResult {
    const lowerArgs = args.toLowerCase().trim();

    // Random discovery
    if (lowerArgs === 'random') {
      return this.discoverRandom();
    }

    // Company discovery
    if (lowerArgs.startsWith('company ')) {
      const companyName = args.substring(8).trim();
      return this.discoverCompany(companyName);
    }

    // Investor discovery
    if (lowerArgs.startsWith('investor ')) {
      const investorName = args.substring(9).trim();
      return this.discoverInvestor(investorName);
    }

    // Person discovery
    if (lowerArgs.startsWith('person ')) {
      const personName = args.substring(7).trim();
      return this.discoverPerson(personName);
    }

    // Topic discovery
    if (lowerArgs.startsWith('topic ')) {
      const topicName = args.substring(6).trim();
      return this.discoverTopic(topicName);
    }

    return {
      type: 'error',
      content: `Invalid discover command. Try:\n- discover random\n- discover company <name>\n- discover investor <name>\n- discover person <name>\n- discover topic <topic>`,
    };
  }

  /**
   * Discover random entity
   */
  private discoverRandom(): CommandResult {
    const types = ['company', 'person', 'fact', 'figure', 'quote'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    switch (randomType) {
      case 'company': {
        const companies = Object.keys(this.data.entities.companies);
        const randomCompany =
          companies[Math.floor(Math.random() * companies.length)];
        return this.discoverCompany(randomCompany);
      }
      case 'person': {
        const people = Object.keys(this.data.entities.people);
        const randomPerson = people[Math.floor(Math.random() * people.length)];
        return this.discoverPerson(randomPerson);
      }
      case 'fact': {
        const posts = Object.values(this.data.posts);
        const postsWithFacts = posts.filter((p) => p.facts && p.facts.length > 0);
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
╔══════════════════════════════════════════════════════════════╗
║                       RANDOM FACT                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  "${randomFact.text}"
║                                                              ║
║  Category: ${randomFact.category}                                         ║
║  Source: ${randomPost.title.substring(0, 40)}...             ║
║                                                              ║
║  READ MORE: /news/${postSlug}/                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
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
╔══════════════════════════════════════════════════════════════╗
║                      RANDOM FIGURE                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Value: ${randomFigure.value} ${randomFigure.unit}                                      ║
║  Context: ${randomFigure.context}                                 ║
║  Source: ${randomPost.title.substring(0, 40)}...             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        `;
        return { type: 'text', content: figureDisplay };
      }
      case 'quote': {
        const quotes = this.data.entities.quotes || [];
        if (quotes.length === 0) {
          return { type: 'text', content: 'No quotes found in the corpus.' };
        }
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        const contextLine = randomQuote.context ? `\n║  Context: ${randomQuote.context.substring(0, 50).padEnd(50)}  ║` : '';
        const dateLine = randomQuote.pubDate ? `\n║  Date: ${randomQuote.pubDate.padEnd(53)}  ║` : '';
        
        const quoteDisplay = `
╔══════════════════════════════════════════════════════════════╗
║                      QUOTE OF THE DAY                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  "${randomQuote.quote}"
║                                                              ║
║  — ${randomQuote.speaker.padEnd(57)}  ║${contextLine}${dateLine}
║                                                              ║
║  From: ${randomQuote.postTitle.substring(0, 50).padEnd(50)}  ║
╚══════════════════════════════════════════════════════════════╝
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
          'NAME': companyName,
          'MENTIONS': `${company.mentions} posts`,
          ...(company.description ? { 'ABOUT': company.description } : {})
        }
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
   * Discover company (legacy - redirects to new version)
   */
  private discoverCompany(name: string): CommandResult {
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
          'NAME': investorName,
          'MENTIONS': `${investor.mentions} posts`,
        }
      },
      { type: 'divider' },
      { type: 'text', content: 'POSTS:' },
      { type: 'list', content: postItems },
      { type: 'divider' },
      { type: 'text', content: 'Type a number to open that post (e.g., "1")' },
    ];

    const output = this.buildBox(sections);

    return { type: 'investor', content: output, data: { investor: investorName } };
  }

  /**
   * Discover investor (legacy - redirects to new version)
   */
  private discoverInvestor(name: string): CommandResult {
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
          'NAME': personName,
          'ROLE': person.role || 'Unknown',
          'MENTIONS': `${person.mentions} posts`,
        }
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
   * Discover person (legacy - redirects to new version)
   */
  private discoverPerson(name: string): CommandResult {
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
          'TOPIC': topicName,
          'MENTIONS': `${topic.mentions} posts`,
        }
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
   * Discover topic (legacy - redirects to new version)
   */
  private discoverTopic(name: string): CommandResult {
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
          'TITLE': post.title,
          'AUTHOR': post.author || 'Unknown',
          'DATE': post.pubDate || 'Unknown',
        }
      },
      { type: 'divider' },
      { type: 'text', content: 'Opening: ' + url },
      { type: 'empty' },
      { type: 'text', content: 'Click the link above or it will open automatically.' },
    ]);

    // Return with post data so component can open it
    return { 
      type: 'post', 
      content: output,
      data: { slug, url, autoOpen: true }
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
        .map((entry) => `║  ${entry.date} → ${entry.title.substring(0, 35)}...\n║               /news/${entry.slug}/`)
        .join('\n');

      const output = `
╔══════════════════════════════════════════════════════════════╗
║                 TIMELINE: ${companyName}                                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
${timelineText}
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
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
        return `║  • ${post.title.substring(0, 50)}...\n║    /news/${slug}/`;
      })
      .join('\n');

    const output = `
╔══════════════════════════════════════════════════════════════╗
║                      CONNECTIONS                             ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  "${entity1}" ←→ "${entity2}"                                       ║
║                                                              ║
║  ${commonPosts.length} common post(s) found:                                   ║
║                                                              ║
${connectionText}
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
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
        return this.discoverCompany(randomCompany);
      }
      case 'random_person_insight': {
        const people = Object.keys(this.data.entities.people);
        const randomPerson =
          people[Math.floor(Math.random() * people.length)];
        return this.discoverPerson(randomPerson);
      }
      case 'random_connection': {
        const entities = [
          ...Object.keys(this.data.entities.companies),
          ...Object.keys(this.data.entities.people),
        ];
        if (entities.length < 2) {
          return this.discoverRandom();
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
        return this.discoverRandom();
    }
  }

  /**
   * Whoami easter egg
   */
  private whoami(): CommandResult {
    const quotes = [
      '"Ideas start with founders. Founders start with PWV."',
      '"We succeed in our mission by helping founders succeed in theirs."',
      '"A community can go farther than an individual."',
      '"I invest because I want to be invested."',
      '"Early-stage is where real-world experience can best accelerate timelines."',
      '"The most important factor in the better future we want to build is people."',
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    return {
      type: 'text',
      content: `\n  ${randomQuote}\n\n  — PWV Philosophy\n`,
    };
  }

  /**
   * Cowsay easter egg
   */
  private cowsay(text: string): CommandResult {
    if (!text) {
      text = 'Type something after cowsay!';
    }

    const bubble = `
 ${'_'.repeat(text.length + 2)}
< ${text} >
 ${'-'.repeat(text.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
    `;

    return { type: 'text', content: bubble };
  }
}
