export interface Entity {
  companies: string[];
  investors: string[];
  people: Array<{ name: string; role?: string } | string>;
  facts: Array<{ 
    text: string; 
    category: 'insight' | 'trend' | 'philosophy' | 'announcement' | 'milestone' | 'funding' | 'launch' | 'partnership';
    date?: string;
  }>;
  figures: Array<{ value: string; context: string; unit: string }>;
  topics: string[];
  quotes: Array<{
    quote: string;
    speaker: string;
    context?: string;
  }>;
}

export interface PostEntity extends Entity {
  title: string;
  pubDate?: string;
  author?: string;
}

export interface CompanyEntity {
  posts: string[];
  mentions: number;
  description?: string;
}

export interface InvestorEntity {
  posts: string[];
  mentions: number;
}

export interface PersonEntity {
  posts: string[];
  mentions: number;
  role?: string;
}

export interface TopicEntity {
  posts: string[];
  mentions: number;
}

export interface QuoteEntity {
  quote: string;
  speaker: string;
  context?: string;
  postSlug: string;
  postTitle: string;
  pubDate?: string | null;
}

export interface PortfolioCompany {
  name: string;
  url: string;
  tags: string[];
  slug: string;
  formerly?: string;
  acquiredBy?: string;
}

export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  slug: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  bluesky?: string;
  website?: string;
  isGeneralPartner?: boolean;
}

export interface ExtractedData {
  posts: Record<string, PostEntity>;
  entities: {
    companies: Record<string, CompanyEntity>;
    investors: Record<string, InvestorEntity>;
    people: Record<string, PersonEntity>;
    topics: Record<string, TopicEntity>;
    quotes: QuoteEntity[];
  };
  portfolio?: {
    representative: PortfolioCompany[];
    rollingFund: PortfolioCompany[];
    fundOne: PortfolioCompany[];
    angel: PortfolioCompany[];
  };
  team?: TeamMember[];
  metadata: {
    extractedAt: string;
    totalPosts: number;
    dateRange?: {
      oldest: string;
      newest: string;
    };
    note?: string;
  };
}

export interface CommandResult {
  type: 'text' | 'company' | 'investor' | 'person' | 'topic' | 'fact' | 'connection' | 'timeline' | 'stats' | 'error' | 'list' | 'post' | 'newsletter';
  content: string | React.ReactNode;
  data?: any;
}

export interface HistoryEntry {
  command: string;
  result: CommandResult;
  timestamp: Date;
}

export interface SelectableItem {
  id: string;
  label: string;
  type: 'company' | 'investor' | 'person' | 'topic' | 'post';
  data?: any;
}
