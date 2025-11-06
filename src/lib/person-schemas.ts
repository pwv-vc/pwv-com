/**
 * Helper functions to generate Person JSON-LD schemas
 */

import { generatePersonSchema } from './schema';
import { getCollection } from 'astro:content';
import { SITE_NAME } from '../consts';

export async function getPersonSchemas(
  baseURL: string | URL,
  canonicalURL: URL
) {
  // Get team members
  const teamMembers = await getCollection('team' as any);
  const generalPartners = (teamMembers as any[])
    .filter((member: any) => member.data.isGeneralPartner)
    .sort((a: any, b: any) => a.data.position - b.data.position);

  // Generate Person schemas for General Partners
  const personSchemas = generalPartners.map((member: any) => {
    // Build sameAs array for social profiles
    const sameAs: string[] = [];
    if (member.data.linkedin) {
      sameAs.push(`https://www.linkedin.com/in/${member.data.linkedin}`);
    }
    if (member.data.twitter) {
      sameAs.push(`https://x.com/${member.data.twitter}`);
    }
    if (member.data.github) {
      sameAs.push(`https://github.com/${member.data.github}`);
    }
    if (member.data.bluesky) {
      // Handle both Bluesky handles and custom domains
      const blueskyUrl = member.data.bluesky.startsWith('http')
        ? member.data.bluesky
        : `https://bsky.app/profile/${member.data.bluesky}`;
      sameAs.push(blueskyUrl);
    }

    // Generate Person schema with @id linking to Organization
    return generatePersonSchema({
      id: `#person-${member.data.slug}`,
      name: member.data.name,
      jobTitle: member.data.title,
      description: member.data.bio,
      url: member.data.website
        ? member.data.website
        : new URL(
            `/about#${member.data.slug}`,
            baseURL || canonicalURL
          ).toString(),
      sameAs: sameAs.length > 0 ? sameAs : undefined,
      worksFor: {
        name: SITE_NAME,
        url: baseURL?.toString() || canonicalURL.toString(),
        id: '#organization-pwv', // Link to Organization schema via @id
      },
    });
  });

  return personSchemas;
}

