import { getCollection } from 'astro:content';
import type { ExtractedData, TeamMember } from '../components/Terminal/types';

/**
 * Build the same ExtractedData shape as the terminal page (for loadEntities and tests).
 */
export const buildExtractedDataFromCollections = async (): Promise<ExtractedData> => {
  const [
    postEntities,
    representativePortfolio,
    rollingFundPortfolio,
    fundOnePortfolio,
    angelPortfolio,
    teamMembers,
  ] = await Promise.all([
    getCollection('extractedPostEntities'),
    getCollection('representativePortfolio'),
    getCollection('rollingFundPortfolio'),
    getCollection('fundOnePortfolio'),
    getCollection('angelPortfolio'),
    getCollection('team'),
  ]);

  const companiesMap = new Map<string, { posts: string[]; mentions: number }>();
  const investorsMap = new Map<string, { posts: string[]; mentions: number }>();
  const peopleMap = new Map<
    string,
    { posts: string[]; mentions: number; role?: string }
  >();
  const topicsMap = new Map<string, { posts: string[]; mentions: number }>();
  const quotesArray: Array<{
    quote: string;
    speaker: string;
    context?: string;
    postSlug: string;
    postTitle: string;
    pubDate?: string;
  }> = [];

  for (const post of postEntities) {
    const { slug, title, companies, investors, people, topics, quotes, pubDate } =
      post.data;

    companies.forEach((company) => {
      if (!companiesMap.has(company)) {
        companiesMap.set(company, { posts: [], mentions: 0 });
      }
      const companyData = companiesMap.get(company)!;
      companyData.posts.push(slug);
      companyData.mentions += 1;
    });

    investors.forEach((investor) => {
      if (!investorsMap.has(investor)) {
        investorsMap.set(investor, { posts: [], mentions: 0 });
      }
      const investorData = investorsMap.get(investor)!;
      investorData.posts.push(slug);
      investorData.mentions += 1;
    });

    people.forEach((person) => {
      const personName = typeof person === 'string' ? person : person.name;
      const personRole = typeof person === 'object' ? person.role : undefined;

      if (!peopleMap.has(personName)) {
        peopleMap.set(personName, { posts: [], mentions: 0, role: personRole });
      }
      const personData = peopleMap.get(personName)!;
      personData.posts.push(slug);
      personData.mentions += 1;
      if (personRole && !personData.role) {
        personData.role = personRole;
      }
    });

    topics.forEach((topic) => {
      if (!topicsMap.has(topic)) {
        topicsMap.set(topic, { posts: [], mentions: 0 });
      }
      const topicData = topicsMap.get(topic)!;
      topicData.posts.push(slug);
      topicData.mentions += 1;
    });

    quotes.forEach((quote) => {
      quotesArray.push({
        ...quote,
        postSlug: slug,
        postTitle: title,
        pubDate: pubDate || undefined,
      });
    });
  }

  return {
    posts: Object.fromEntries(postEntities.map((p) => [p.id, p.data])),
    entities: {
      companies: Object.fromEntries(companiesMap),
      investors: Object.fromEntries(investorsMap),
      people: Object.fromEntries(peopleMap),
      topics: Object.fromEntries(topicsMap),
      quotes: quotesArray,
    },
    portfolio: {
      representative: representativePortfolio.map((p) => p.data),
      rollingFund: rollingFundPortfolio.map((p) => p.data),
      fundOne: fundOnePortfolio.map((p) => p.data),
      angel: angelPortfolio.map((p) => p.data),
    },
    team: teamMembers.map((t) => t.data as TeamMember),
    metadata: {
      extractedAt: new Date().toISOString(),
      totalPosts: postEntities.length,
    },
  };
};
