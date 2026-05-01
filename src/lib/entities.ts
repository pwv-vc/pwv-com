import type { ExtractedData } from '../components/Terminal/types';
import { buildExtractedDataFromCollections } from './aggregate_extracted_maps';

/**
 * Load entity data (aggregated from per-post extracted JSON, same source as the terminal).
 */
export const loadEntities = async (): Promise<ExtractedData> => {
  return buildExtractedDataFromCollections();
};

/**
 * Get all companies
 */
export const getAllCompanies = (data: ExtractedData): string[] => {
  return Object.keys(data.entities.companies).sort();
};

/**
 * Get all investors
 */
export const getAllInvestors = (data: ExtractedData): string[] => {
  return Object.keys(data.entities.investors).sort();
};

/**
 * Get all people
 */
export const getAllPeople = (data: ExtractedData): string[] => {
  return Object.keys(data.entities.people).sort();
};

/**
 * Get all topics
 */
export const getAllTopics = (data: ExtractedData): string[] => {
  return Object.keys(data.entities.topics).sort();
};

/**
 * Search entities by query
 */
export const searchEntities = (
  data: ExtractedData,
  query: string
): {
  companies: string[];
  investors: string[];
  people: string[];
  topics: string[];
} => {
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
};
