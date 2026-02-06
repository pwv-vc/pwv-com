import type {
  ExtractedData,
  CommandResult,
  PostEntity,
  CompanyEntity,
  PersonEntity,
  SelectableItem,
} from './types';
import { allCommands, BaseCommand } from './commands';
import { buildBox, type BoxSection } from './commands/helpers/boxBuilder';
import { generateSlug } from './commands/helpers/utils';

export class QueryEngine {
  private data: ExtractedData;
  private currentList: SelectableItem[] = [];
  private boxWidth: number = 64; // Total box width including borders
  private commands: BaseCommand[] = [];

  constructor(data: ExtractedData, boxWidth: number = 64) {
    this.data = data;
    this.boxWidth = boxWidth;
    // Initialize all command instances
    this.commands = allCommands.map((CommandClass) => new CommandClass(data, boxWidth));
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

    // Try new command system first
    const matchingCommand = this.commands.find((cmd) => cmd.matches(input));
    if (matchingCommand) {
      const args = input.trim().split(/\s+/).slice(1);
      const result = matchingCommand.execute(input, args);
      
      // Update currentList if command returns selectable items
      if (result.data?.selectableItems) {
        this.currentList = result.data.selectableItems;
      }
      
      return result;
    }

    // Fall back to old methods for unmigrated commands

    // Help command
    if (command === 'help' || command === '?') {
      return this.showHelp();
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
    // Group commands by category
    const categories: Record<string, BaseCommand[]> = {
      list: [],
      showcase: [],
      exploration: [],
      other: [],
    };

    this.commands.forEach((cmd) => {
      categories[cmd.category].push(cmd);
    });

    // Build dynamic help text
    let helpText = `
>> PWV TERMINAL
─────────────────────────────────────────────────────

LIST COMMANDS:
`;

    categories.list.forEach((cmd) => {
      const usage = cmd.usage.padEnd(24);
      helpText += `  • ${usage} ${cmd.description}\n`;
    });

    helpText += `  • <number>               Select item from last list

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
`;

    categories.exploration.forEach((cmd) => {
      const usage = cmd.usage.padEnd(24);
      helpText += `  • ${usage} ${cmd.description}\n`;
    });

    helpText += `
OTHER:
  • help                   Show this help message
  • clear                  Clear the terminal
`;

    categories.other.forEach((cmd) => {
      const usage = cmd.usage.padEnd(24);
      helpText += `  • ${usage} ${cmd.description}\n`;
    });

    helpText += `
─────────────────────────────────────────────────────

TIP: Type 'companies' to see all companies, then type a number.
Example: companies → 1 → (shows company details)
    `;

    return { type: 'text', content: helpText };
  }



  /**
   * Show portfolio company details
   */
  private showPortfolioCompany(company: any): CommandResult {
    const portfolioUrl = `/portfolio/#${company.slug}`;

    // Check if company has entity data (posts)
    const entityData = this.data.entities.companies[company.name];
    const showcaseUrl = entityData
      ? `/showcase/companies/${generateSlug(company.name)}/`
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

    const output = buildBox(sections);

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
    const companySlug = generateSlug(companyName);
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

    const output = buildBox(sections);

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
    const investorSlug = generateSlug(investorName);
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

    const output = buildBox(sections);

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
    const personSlug = generateSlug(personName);
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

    const output = buildBox([
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
    const topicSlug = generateSlug(topicName);
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

    const output = buildBox([
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

    const output = buildBox([
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

}
