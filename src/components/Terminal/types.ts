export interface Entity {
  companies: string[];
  people: Array<{ name: string; role?: string } | string>;
  facts: Array<{ text: string; category: string }>;
  figures: Array<{ value: string; context: string; unit: string }>;
  topics: string[];
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

export interface PersonEntity {
  posts: string[];
  mentions: number;
  role?: string;
}

export interface TopicEntity {
  posts: string[];
  mentions: number;
}

export interface ExtractedData {
  posts: Record<string, PostEntity>;
  entities: {
    companies: Record<string, CompanyEntity>;
    people: Record<string, PersonEntity>;
    topics: Record<string, TopicEntity>;
  };
  metadata: {
    extractedAt: string;
    totalPosts: number;
    note?: string;
  };
}

export interface CommandResult {
  type: 'text' | 'company' | 'person' | 'topic' | 'fact' | 'connection' | 'timeline' | 'stats' | 'error' | 'list' | 'post';
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
  type: 'company' | 'person' | 'topic' | 'post';
  data?: any;
}
