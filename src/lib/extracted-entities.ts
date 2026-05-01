/**
 * Helper functions for working with extracted entity data aggregated from per-post JSON.
 *
 * Usage:
 * ```ts
 * import { getExtractedCompanies, getExtractedPeople } from '@/lib/extracted-entities';
 *
 * const companies = await getExtractedCompanies();
 * ```
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import { buildExtractedDataFromCollections } from './aggregate_extracted_maps';

export type ExtractedPostEntity = CollectionEntry<'extractedPostEntities'>;

const normalizeEntityId = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export type ExtractedCompany = {
  id: string;
  data: { name: string; mentions: number; posts: string[] };
};

export type ExtractedPerson = {
  id: string;
  data: { name: string; mentions: number; posts: string[]; role?: string };
};

export type ExtractedTopic = {
  id: string;
  data: { name: string; mentions: number; posts: string[] };
};

/**
 * Get all extracted post entities
 */
export const getExtractedPostEntities = async (): Promise<ExtractedPostEntity[]> => {
  return await getCollection('extractedPostEntities');
};

/**
 * Get extracted entities for a specific post by slug
 */
export const getExtractedPostEntity = async (
  slug: string
): Promise<ExtractedPostEntity | undefined> => {
  const entities = await getExtractedPostEntities();
  return entities.find((entity) => entity.id === slug);
};

/**
 * Get all extracted companies (sorted by mentions, descending)
 */
export const getExtractedCompanies = async (): Promise<ExtractedCompany[]> => {
  const data = await buildExtractedDataFromCollections();
  return Object.entries(data.entities.companies)
    .map(([name, entity]) => ({
      id: normalizeEntityId(name),
      data: { name, mentions: entity.mentions, posts: entity.posts },
    }))
    .sort((a, b) => b.data.mentions - a.data.mentions);
};

/**
 * Get a specific company by name or ID
 */
export const getExtractedCompany = async (
  nameOrId: string
): Promise<ExtractedCompany | undefined> => {
  const companies = await getExtractedCompanies();
  const normalized = nameOrId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return companies.find(
    (company) =>
      company.id === normalized ||
      company.data.name.toLowerCase() === nameOrId.toLowerCase()
  );
};

/**
 * Get all extracted people (sorted by mentions, descending)
 */
export const getExtractedPeople = async (): Promise<ExtractedPerson[]> => {
  const data = await buildExtractedDataFromCollections();
  return Object.entries(data.entities.people)
    .map(([name, entity]) => ({
      id: normalizeEntityId(name),
      data: {
        name,
        mentions: entity.mentions,
        posts: entity.posts,
        role: entity.role,
      },
    }))
    .sort((a, b) => b.data.mentions - a.data.mentions);
};

/**
 * Get a specific person by name or ID
 */
export const getExtractedPerson = async (
  nameOrId: string
): Promise<ExtractedPerson | undefined> => {
  const people = await getExtractedPeople();
  const normalized = nameOrId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return people.find(
    (person) =>
      person.id === normalized ||
      person.data.name.toLowerCase() === nameOrId.toLowerCase()
  );
};

/**
 * Get all extracted topics (sorted by mentions, descending)
 */
export const getExtractedTopics = async (): Promise<ExtractedTopic[]> => {
  const data = await buildExtractedDataFromCollections();
  return Object.entries(data.entities.topics)
    .map(([name, entity]) => ({
      id: normalizeEntityId(name),
      data: { name, mentions: entity.mentions, posts: entity.posts },
    }))
    .sort((a, b) => b.data.mentions - a.data.mentions);
};

/**
 * Get a specific topic by name or ID
 */
export const getExtractedTopic = async (
  nameOrId: string
): Promise<ExtractedTopic | undefined> => {
  const topics = await getExtractedTopics();
  const normalized = nameOrId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return topics.find(
    (topic) =>
      topic.id === normalized ||
      topic.data.name.toLowerCase() === nameOrId.toLowerCase()
  );
};

/**
 * Get posts that mention a specific company
 */
export const getPostsForCompany = async (companyNameOrId: string): Promise<string[]> => {
  const company = await getExtractedCompany(companyNameOrId);
  return company?.data.posts ?? [];
};

/**
 * Get posts that mention a specific person
 */
export const getPostsForPerson = async (personNameOrId: string): Promise<string[]> => {
  const person = await getExtractedPerson(personNameOrId);
  return person?.data.posts ?? [];
};

/**
 * Get posts about a specific topic
 */
export const getPostsForTopic = async (topicNameOrId: string): Promise<string[]> => {
  const topic = await getExtractedTopic(topicNameOrId);
  return topic?.data.posts ?? [];
};

/**
 * Get all facts from all posts; optionally filter by category
 */
export const getAllFacts = async (
  category?:
    | 'insight'
    | 'trend'
    | 'philosophy'
    | 'announcement'
    | 'milestone'
    | 'funding'
    | 'launch'
    | 'partnership'
) => {
  const entities = await getExtractedPostEntities();
  const facts = entities.flatMap((entity) =>
    entity.data.facts.map((fact) => ({
      ...fact,
      postSlug: entity.id,
      postTitle: entity.data.title,
    }))
  );

  if (category) {
    return facts.filter((fact) => fact.category === category);
  }

  return facts;
};

/**
 * Get all figures from all posts
 */
export const getAllFigures = async () => {
  const entities = await getExtractedPostEntities();
  return entities.flatMap((entity) =>
    entity.data.figures.map((figure) => ({
      ...figure,
      postSlug: entity.id,
      postTitle: entity.data.title,
    }))
  );
};

/**
 * Search companies, people, and topics by keyword
 */
export const searchEntities = async (keyword: string) => {
  const [companies, people, topics] = await Promise.all([
    getExtractedCompanies(),
    getExtractedPeople(),
    getExtractedTopics(),
  ]);

  const lowerKeyword = keyword.toLowerCase();

  return {
    companies: companies.filter((c) =>
      c.data.name.toLowerCase().includes(lowerKeyword)
    ),
    people: people.filter((p) => p.data.name.toLowerCase().includes(lowerKeyword)),
    topics: topics.filter((t) => t.data.name.toLowerCase().includes(lowerKeyword)),
  };
};
