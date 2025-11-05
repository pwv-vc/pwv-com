/**
 * JSON-LD Schema.org utilities for Person, Organization, Article, Breadcrumb, WebSite, and other structured data
 */

export interface PersonSchemaOptions {
  name: string;
  jobTitle?: string;
  description?: string;
  url?: string;
  image?: string;
  sameAs?: string[]; // Social media profiles
  email?: string;
  worksFor?: {
    name: string;
    url?: string;
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
  founders?: Array<{
    name: string;
    url?: string;
  }>;
  sameAs?: string[]; // Social media profiles
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

  if (options.email || options.telephone) {
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

  if (options.foundingDate) {
    schema.foundingDate = options.foundingDate;
  }

  if (options.founders && options.founders.length > 0) {
    schema.founder = options.founders.map((founder) => ({
      '@type': 'Person',
      name: founder.name,
      ...(founder.url && { url: founder.url }),
    }));
  }

  if (options.sameAs && options.sameAs.length > 0) {
    schema.sameAs = options.sameAs;
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
