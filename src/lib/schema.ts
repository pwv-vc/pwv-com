/**
 * JSON-LD Schema.org utilities for Person, Organization, Article, Breadcrumb, WebSite, and other structured data
 */

export interface PersonSchemaOptions {
  name: string;
  givenName?: string;
  familyName?: string;
  jobTitle?: string;
  description?: string;
  url?: string;
  image?: string;
  sameAs?: string[]; // Social media profiles
  email?: string;
  id?: string; // @id for linking entities (e.g., "#person-tom-preston-werner")
  worksFor?: {
    name: string;
    url?: string;
    id?: string; // @id reference to Organization (e.g., "#organization-pwv")
  };
  affiliation?: Array<{
    '@type'?: string;
    name: string;
  }>;
  knowsAbout?: string[];
  nationality?: string;
  alumniOf?: Array<{
    '@type'?: string;
    name: string;
  }>;
  homeLocation?: {
    '@type'?: string;
    name: string;
  };
}

export interface OrganizationSchemaOptions {
  name: string;
  url: string;
  description?: string;
  logo?: string;
  image?: string;
  email?: string;
  telephone?: string;
  contactType?: string;
  foundingDate?: string;
  foundingLocation?: string;
  alternateName?: string;
  areaServed?: string;
  knowsAbout?: string[];
  id?: string; // @id for linking entities (e.g., "#organization-pwv")
  founders?: Array<{
    name: string;
    url?: string;
    id?: string; // @id reference to Person (e.g., "#person-tom-preston-werner")
    sameAs?: string[]; // Social media profiles for founder
  }>;
  founder?: {
    name: string;
    url?: string;
    id?: string;
    sameAs?: string[];
  };
  sameAs?: string[]; // Social media profiles
  contactPoint?: Array<{
    contactType: string;
    email?: string;
    url?: string;
    areaServed?: string;
    availableLanguage?: string[];
  }>;
  type?: string | string[]; // Allow custom organization types (e.g., 'InvestmentCompany', 'FinancialService')
}

/**
 * Generate Person schema JSON-LD
 */
export function generatePersonSchema(options: PersonSchemaOptions): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: options.name,
  };

  // Add @id if provided (for linking entities)
  if (options.id) {
    schema['@id'] = options.id;
  }

  if (options.givenName) {
    schema.givenName = options.givenName;
  }

  if (options.familyName) {
    schema.familyName = options.familyName;
  }

  if (options.jobTitle) {
    schema.jobTitle = options.jobTitle;
  }

  if (options.description) {
    schema.description = options.description;
  }

  if (options.url) {
    schema.url = options.url;
  }

  if (options.image) {
    // Image should be an ImageObject or URL string for better SEO
    if (typeof options.image === 'string' && options.image.startsWith('http')) {
      schema.image = {
        '@type': 'ImageObject',
        url: options.image,
      };
    } else {
      schema.image = options.image;
    }
  }

  if (options.sameAs && options.sameAs.length > 0) {
    schema.sameAs = options.sameAs;
  }

  if (options.email) {
    schema.email = options.email;
  }

  if (options.worksFor) {
    schema.worksFor = {
      '@type': 'Organization',
      name: options.worksFor.name,
    };
    if (options.worksFor.url) {
      schema.worksFor.url = options.worksFor.url;
    }
    // Add @id reference if provided (links Person to Organization)
    if (options.worksFor.id) {
      schema.worksFor['@id'] = options.worksFor.id;
    }
  }

  if (options.affiliation && options.affiliation.length > 0) {
    schema.affiliation = options.affiliation.map((aff) => ({
      '@type': aff['@type'] || 'Organization',
      name: aff.name,
    }));
  }

  if (options.knowsAbout && options.knowsAbout.length > 0) {
    schema.knowsAbout = options.knowsAbout;
  }

  if (options.nationality) {
    schema.nationality = options.nationality;
  }

  if (options.alumniOf && options.alumniOf.length > 0) {
    schema.alumniOf = options.alumniOf.map((school) => ({
      '@type': school['@type'] || 'CollegeOrUniversity',
      name: school.name,
    }));
  }

  if (options.homeLocation) {
    schema.homeLocation = {
      '@type': options.homeLocation['@type'] || 'Place',
      name: options.homeLocation.name,
    };
  }

  return schema;
}

/**
 * Generate Organization schema JSON-LD
 */
export function generateOrganizationSchema(
  options: OrganizationSchemaOptions
): object {
  // Support custom organization types (e.g., InvestmentCompany, FinancialService)
  const organizationType = options.type || 'Organization';
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': organizationType,
    name: options.name,
    url: options.url,
  };

  // Add @id if provided (for linking entities)
  if (options.id) {
    schema['@id'] = options.id;
  }

  if (options.description) {
    schema.description = options.description;
  }

  if (options.logo) {
    // Logo should be an ImageObject with proper dimensions for better SEO
    schema.logo = {
      '@type': 'ImageObject',
      url: options.logo,
    };
  }

  if (options.image) {
    // Image should be an ImageObject for better SEO
    if (typeof options.image === 'string' && options.image.startsWith('http')) {
      schema.image = {
        '@type': 'ImageObject',
        url: options.image,
      };
    } else {
      schema.image = options.image;
    }
  }

  if (options.alternateName) {
    schema.alternateName = options.alternateName;
  }

  if (options.foundingDate) {
    schema.foundingDate = options.foundingDate;
  }

  if (options.foundingLocation) {
    schema.foundingLocation = options.foundingLocation;
  }

  if (options.areaServed) {
    schema.areaServed = options.areaServed;
  }

  if (options.knowsAbout && options.knowsAbout.length > 0) {
    schema.knowsAbout = options.knowsAbout;
  }

  // Handle single founder with full details
  // Note: Schema.org uses 'founder' (singular) which can be a single Person or an array
  // The deprecated 'founders' (plural) property has been superseded by 'founder'
  if (options.founder) {
    const founderSchema: any = {
      '@type': 'Person',
      name: options.founder.name,
    };
    if (options.founder.url) {
      founderSchema.url = options.founder.url;
    }
    if (options.founder.id) {
      founderSchema['@id'] = options.founder.id;
    }
    if (options.founder.sameAs && options.founder.sameAs.length > 0) {
      founderSchema.sameAs = options.founder.sameAs;
    }
    schema.founder = founderSchema;
  } else if (options.founders && options.founders.length > 0) {
    // Handle multiple founders - output as array using 'founder' (singular) property
    schema.founder = options.founders.map((founder) => {
      const founderSchema: any = {
        '@type': 'Person',
        name: founder.name,
      };
      if (founder.url) {
        founderSchema.url = founder.url;
      }
      // Add @id reference if provided (links Organization to Person)
      if (founder.id) {
        founderSchema['@id'] = founder.id;
      }
      if (founder.sameAs && founder.sameAs.length > 0) {
        founderSchema.sameAs = founder.sameAs;
      }
      return founderSchema;
    });
  }

  if (options.sameAs && options.sameAs.length > 0) {
    schema.sameAs = options.sameAs;
  }

  // Handle contactPoint as array
  if (options.contactPoint && options.contactPoint.length > 0) {
    schema.contactPoint = options.contactPoint.map((cp) => {
      const contactPointSchema: any = {
        '@type': 'ContactPoint',
        contactType: cp.contactType,
      };
      if (cp.email) {
        contactPointSchema.email = cp.email;
      }
      if (cp.url) {
        contactPointSchema.url = cp.url;
      }
      if (cp.areaServed) {
        contactPointSchema.areaServed = cp.areaServed;
      }
      if (cp.availableLanguage && cp.availableLanguage.length > 0) {
        contactPointSchema.availableLanguage = cp.availableLanguage;
      }
      return contactPointSchema;
    });
  } else if (options.email || options.telephone) {
    // Backward compatibility: single contactPoint from email/telephone
    schema.contactPoint = {
      '@type': 'ContactPoint',
    };
    if (options.email) {
      schema.contactPoint.email = options.email;
    }
    if (options.telephone) {
      schema.contactPoint.telephone = options.telephone;
    }
    // Only set contactType if explicitly provided (avoid inappropriate defaults)
    if (options.contactType) {
      schema.contactPoint.contactType = options.contactType;
    }
  }

  return schema;
}

/**
 * Article/BlogPosting schema options for news posts
 */
export interface ArticleSchemaOptions {
  headline: string;
  description: string;
  url: string;
  image?: string | string[];
  author?: {
    name: string;
    url?: string;
    sameAs?: string[];
  };
  publisher?: {
    name: string;
    logo?: string;
    url?: string;
  };
  datePublished: string; // ISO 8601 date
  dateModified?: string; // ISO 8601 date
  articleBody?: string; // Full text content
  articleSection?: string; // Category/section
  keywords?: string | string[];
  type?: 'Article' | 'BlogPosting' | 'NewsArticle';
}

/**
 * BreadcrumbList schema options
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbListSchemaOptions {
  items: BreadcrumbItem[];
}

/**
 * WebSite schema options
 */
export interface WebSiteSchemaOptions {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

/**
 * CollectionPage/ItemList schema options
 */
export interface ItemListSchemaOptions {
  name: string;
  description?: string;
  url: string;
  items: Array<{
    '@type': string;
    name: string;
    url: string;
    description?: string;
    image?: string;
    datePublished?: string;
  }>;
  numberOfItems?: number;
}

/**
 * FAQ schema options
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSchemaOptions {
  items: FAQItem[];
}

/**
 * Generate Article/BlogPosting schema JSON-LD
 */
export function generateArticleSchema(options: ArticleSchemaOptions): object {
  const articleType = options.type || 'BlogPosting';
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': articleType,
    headline: options.headline,
    description: options.description,
    url: options.url,
  };

  // Handle images - can be string or array
  if (options.image) {
    if (Array.isArray(options.image)) {
      schema.image = options.image.map((img) => ({
        '@type': 'ImageObject',
        url: img,
      }));
    } else {
      schema.image = {
        '@type': 'ImageObject',
        url: options.image,
      };
    }
  }

  // Author information
  if (options.author) {
    schema.author = {
      '@type': 'Person',
      name: options.author.name,
    };
    if (options.author.url) {
      schema.author.url = options.author.url;
    }
    if (options.author.sameAs && options.author.sameAs.length > 0) {
      schema.author.sameAs = options.author.sameAs;
    }
  }

  // Publisher information
  if (options.publisher) {
    schema.publisher = {
      '@type': 'Organization',
      name: options.publisher.name,
    };
    if (options.publisher.url) {
      schema.publisher.url = options.publisher.url;
    }
    if (options.publisher.logo) {
      schema.publisher.logo = {
        '@type': 'ImageObject',
        url: options.publisher.logo,
      };
    }
  }

  schema.datePublished = options.datePublished;
  if (options.dateModified) {
    schema.dateModified = options.dateModified;
  }

  if (options.articleBody) {
    schema.articleBody = options.articleBody;
  }

  if (options.articleSection) {
    schema.articleSection = options.articleSection;
  }

  if (options.keywords) {
    schema.keywords = Array.isArray(options.keywords)
      ? options.keywords.join(', ')
      : options.keywords;
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema JSON-LD
 */
export function generateBreadcrumbListSchema(
  options: BreadcrumbListSchemaOptions
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: options.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate WebSite schema JSON-LD with optional SearchAction
 */
export function generateWebSiteSchema(options: WebSiteSchemaOptions): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: options.name,
    url: options.url,
  };

  if (options.description) {
    schema.description = options.description;
  }

  if (options.potentialAction) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: options.potentialAction.target,
      },
      'query-input': options.potentialAction.queryInput,
    };
  }

  return schema;
}

/**
 * Generate ItemList/CollectionPage schema JSON-LD
 */
export function generateItemListSchema(options: ItemListSchemaOptions): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: options.name,
    url: options.url,
    itemListElement: options.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': item['@type'],
        name: item.name,
        url: item.url,
        ...(item.description && { description: item.description }),
        ...(item.image && {
          image: {
            '@type': 'ImageObject',
            url: item.image,
          },
        }),
        ...(item.datePublished && { datePublished: item.datePublished }),
      },
    })),
  };

  if (options.description) {
    schema.description = options.description;
  }

  if (options.numberOfItems !== undefined) {
    schema.numberOfItems = options.numberOfItems;
  } else {
    schema.numberOfItems = options.items.length;
  }

  return schema;
}

/**
 * Generate FAQ schema JSON-LD
 */
export function generateFAQSchema(options: FAQSchemaOptions): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: options.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD script tag content as a string
 */
export function generateJsonLdScript(schema: object): string {
  return JSON.stringify(schema, null, 2);
}
