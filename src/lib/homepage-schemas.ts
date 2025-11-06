/**
 * Helper functions to generate homepage-specific JSON-LD schemas
 */

import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from './schema';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_DESCRIPTION } from '../consts';

export async function getHomepageSchemas(
  baseURL: string | URL,
  canonicalURL: URL
) {
  // Get team members for schema generation
  const teamMembers = await getCollection('team' as any);
  const generalPartners = (teamMembers as any[])
    .filter((member: any) => member.data.isGeneralPartner)
    .sort((a: any, b: any) => a.data.position - b.data.position);

  // Generate Organization schema with @id
  const organizationUrl = baseURL?.toString() || canonicalURL.toString();
  
  // Organization social media profiles (not founder profiles)
  const organizationSameAs = [
    organizationUrl,
    'https://www.linkedin.com/company/pwventures',
    'https://x.com/pwventures',
    'https://bsky.app/profile/pwv.com',
    'https://github.com/pwv-vc',
  ];

  const organizationSchema = generateOrganizationSchema({
    id: '#organization-pwv',
    name: SITE_NAME,
    url: organizationUrl,
    description: SITE_DESCRIPTION,
    // Using PWV logo PNG for better SEO and compatibility
    logo: new URL(
      '/logos/pwv-logo-black-1920.png',
      baseURL || canonicalURL
    ).toString(),
    email: 'partners@pwv.com',
    founders: generalPartners.map((member: any) => ({
      name: member.data.name,
      url: member.data.website
        ? member.data.website
        : new URL(
            `/about#${member.data.slug}`,
            baseURL || canonicalURL
          ).toString(),
      // Link to Person schema via @id (don't duplicate Person schema here)
      id: `#person-${member.data.slug}`,
    })),
    sameAs: organizationSameAs,
    type: 'Organization',
  });

  // Generate WebSite schema (without SearchAction since search is not implemented)
  const siteUrl = baseURL?.toString() || canonicalURL.toString();
  const websiteSchema = generateWebSiteSchema({
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    // SearchAction removed - search functionality not implemented
  });

  return [organizationSchema, websiteSchema];
}

