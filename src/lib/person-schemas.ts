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
    if (member.data.github) {
      sameAs.push(`https://github.com/${member.data.github}`);
    }
    if (member.data.linkedin) {
      sameAs.push(`https://www.linkedin.com/in/${member.data.linkedin}`);
    }
    if (member.data.twitter) {
      sameAs.push(`https://x.com/${member.data.twitter}`);
    }
    if (member.data.bluesky) {
      // Handle both Bluesky handles and custom domains
      const blueskyUrl = member.data.bluesky.startsWith('http')
        ? member.data.bluesky
        : `https://bsky.app/profile/${member.data.bluesky}`;
      sameAs.push(blueskyUrl);
    }
    if (member.data.website) {
      sameAs.push(member.data.website);
    }

    // Add PWV website for all founders
    const organizationUrl = baseURL?.toString() || canonicalURL.toString();
    sameAs.push(organizationUrl);

    // Add Wikipedia link for Tom Preston-Werner
    if (member.data.slug === 'tom-preston-werner') {
      sameAs.push('https://en.wikipedia.org/wiki/Tom_Preston-Werner');
    }

    // Use givenName/familyName from data, or parse from name
    const givenName = member.data.givenName || member.data.name.split(' ')[0];
    const familyName =
      member.data.familyName ||
      (() => {
        const nameParts = member.data.name.split(' ');
        if (nameParts.length > 1) {
          let family = nameParts.slice(1).join(' ');
          // Remove parenthetical content (e.g., "(DT)")
          family = family.replace(/\s*\([^)]*\)\s*/g, '').trim();
          return family || undefined;
        }
        return undefined;
      })();

    // Build person URL
    const personUrl = new URL(
      `/team/${member.data.slug}`,
      baseURL || canonicalURL
    ).toString();

    // Generate Person schema with full URL @id
    const personId = new URL(
      `/team/${member.data.slug}#person`,
      baseURL || canonicalURL
    ).toString();

    // Organization @id reference (full URL format)
    const organizationId = new URL(
      '#organization',
      baseURL || canonicalURL
    ).toString();

    // Build schema options from member data
    const schemaOptions: any = {
      id: personId,
      name: member.data.name,
      givenName: givenName,
      familyName: familyName || undefined,
      jobTitle: member.data.schemaJobTitle || member.data.title,
      description: member.data.schemaDescription || member.data.bio,
      url: personUrl,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
      worksFor: {
        name: SITE_NAME,
        url: organizationUrl,
        id: organizationId, // Link to Organization schema via @id (full URL format)
      },
    };

    // Add image if provided
    if (member.data.schemaImage) {
      schemaOptions.image = new URL(
        member.data.schemaImage,
        baseURL || canonicalURL
      ).toString();
    }

    // Add optional fields from member data
    if (member.data.affiliation && member.data.affiliation.length > 0) {
      schemaOptions.affiliation = member.data.affiliation;
    }

    if (member.data.knowsAbout && member.data.knowsAbout.length > 0) {
      schemaOptions.knowsAbout = member.data.knowsAbout;
    }

    if (member.data.nationality) {
      schemaOptions.nationality = member.data.nationality;
    }

    if (member.data.alumniOf && member.data.alumniOf.length > 0) {
      schemaOptions.alumniOf = member.data.alumniOf;
    }

    if (member.data.homeLocation) {
      schemaOptions.homeLocation = member.data.homeLocation;
    }

    // Generate Person schema
    return generatePersonSchema(schemaOptions);
  });

  return personSchemas;
}
