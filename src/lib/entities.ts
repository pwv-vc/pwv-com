import type { ExtractedData } from '../components/Terminal/types';

/**
 * Load entity data
 */
export async function loadEntities(): Promise<ExtractedData> {
  const data = await import('../content/entities/aggregated.json');
  return data.default as ExtractedData;
}

/**
 * Get all companies
 */
export function getAllCompanies(data: ExtractedData): string[] {
  return Object.keys(data.entities.companies).sort();
}

/**
 * Get all investors
 */
export function getAllInvestors(data: ExtractedData): string[] {
  return Object.keys(data.entities.investors).sort();
}

/**
 * Get all people
 */
export function getAllPeople(data: ExtractedData): string[] {
  return Object.keys(data.entities.people).sort();
}

/**
 * Get all topics
 */
export function getAllTopics(data: ExtractedData): string[] {
  return Object.keys(data.entities.topics).sort();
}

/**
 * Search entities by query
 */
export function searchEntities(
  data: ExtractedData,
  query: string
): {
  companies: string[];
  investors: string[];
  people: string[];
  topics: string[];
} {
  const lowerQuery = query.toLowerCase();

  return {
    companies: getAllCompanies(data).filter((c) =>
      c.toLowerCase().includes(lowerQuery)
    ),
    investors: getAllInvestors(data).filter((i) =>
      i.toLowerCase().includes(lowerQuery)
    ),
    people: getAllPeople(data).filter((p) =>
      p.toLowerCase().includes(lowerQuery)
    ),
    topics: getAllTopics(data).filter((t) =>
      t.toLowerCase().includes(lowerQuery)
    ),
  };
}
