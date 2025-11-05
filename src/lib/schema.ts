/**
 * JSON-LD Schema.org utilities for Person and Organization structured data
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
    schema.image = options.image;
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
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: options.name,
    url: options.url,
  };

  if (options.description) {
    schema.description = options.description;
  }

  if (options.logo) {
    schema.logo = options.logo;
  }

  if (options.image) {
    schema.image = options.image;
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
    if (options.contactType) {
      schema.contactPoint.contactType = options.contactType;
    } else {
      schema.contactPoint.contactType = 'customer service';
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
 * Generate JSON-LD script tag content as a string
 */
export function generateJsonLdScript(schema: object): string {
  return JSON.stringify(schema, null, 2);
}

