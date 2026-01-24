/**
 * Helper functions to generate homepage-specific JSON-LD schemas
 */

import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateWebPageSchema,
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

  // Generate Organization schema with full URL @id
  const organizationId = new URL(
    '#organization',
    baseURL || canonicalURL
  ).toString();

  const organizationSchema = generateOrganizationSchema({
    id: organizationId,
    name: SITE_NAME,
    legalName: 'PWV Capital Management LLC',
    alternateName: ['PWV', 'Preston-Werner Ventures'],
    disambiguatingDescription:
      'PWV is a Silicon Valley venture capital firm investing in early-stage technology companies. Not affiliated with any investment product, ETF, ticker symbol, or medical/cardiovascular measurement.',
    url: organizationUrl,
    description: SITE_DESCRIPTION,
    // Using PWV logo PNG for better SEO and compatibility
    logo: new URL(
      '/logos/pwv-logo-black-1920.png',
      baseURL || canonicalURL
    ).toString(),
    email: 'partners@pwv.com',
    foundingDate: '2023',
    foundingLocation: 'San Francisco Bay Area, USA',
    areaServed: 'Global',
    knowsAbout: [
      'Venture capital',
      'Early-stage investing',
      'Artificial intelligence',
      'Software infrastructure',
      'Developer tools',
      'Open-source startups',
      'SaaS',
      'Seed funding',
      'Pre-seed investing',
    ],
    founders: generalPartners.map((member: any) => {
      // Always use team page URL for founder
      const personUrl = new URL(
        `/team/${member.data.slug}`,
        baseURL || canonicalURL
      ).toString();

      // Use full URL for founder ID to match PersonSchema format
      const founderId = new URL(
        `/team/${member.data.slug}#person`,
        baseURL || canonicalURL
      ).toString();

      return {
        name: member.data.name,
        url: personUrl,
        // Link to Person schema via @id (full URL format)
        id: founderId,
      };
    }),
    sameAs: organizationSameAs,
    contactPoint: [
      {
        contactType: 'Investment Inquiries',
        email: 'investors@pwv.com',
        url: new URL('/apply', baseURL || canonicalURL).toString(),
        areaServed: 'Global',
        availableLanguage: ['English'],
      },
    ],
    type: 'Organization',
  });

  // Generate WebSite schema (without SearchAction since search is not implemented)
  const siteUrl = baseURL?.toString() || canonicalURL.toString();
  const websiteId = new URL('#website', baseURL || canonicalURL).toString();
  const websiteSchema = generateWebSiteSchema({
    id: websiteId,
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    publisher: {
      id: organizationId,
    },
    // SearchAction removed - search functionality not implemented
  });

  // Generate WebPage schema for homepage to strengthen entity association
  const webpageSchema = generateWebPageSchema({
    name: `${SITE_NAME} - Early stage capital for technology founders`,
    url: canonicalURL.toString(),
    description: SITE_DESCRIPTION,
    about: {
      id: organizationId,
    },
    publisher: {
      id: organizationId,
    },
    isPartOf: {
      id: websiteId,
    },
  });

  return [organizationSchema, websiteSchema, webpageSchema];
}
