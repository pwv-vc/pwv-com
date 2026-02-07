# SEO Disambiguation Improvements for PWV.com

## Overview

This document outlines the comprehensive SEO disambiguation improvements implemented to help Google distinguish PWV (Preston-Werner Ventures) from the Invesco PWV ETF (ticker: PWV).

## Problem

PWV is an acronym with multiple meanings across different fields:

1. **Finance:** Invesco Dynamic Large Cap Value ETF (ticker symbol: PWV)
2. **Medicine:** Pulse wave velocity, a cardiovascular measurement used in medical and biometrics contexts

This creates confusion in search results. Google may associate pwv.com with financial products or medical measurements rather than the venture capital firm. Both the finance and medical meanings have strong authority signals across their respective domains.

## Solution

We've implemented a multi-layered approach to strengthen PWV's entity identity and explicitly disambiguate from the ETF:

---

## 1. Enhanced Organization Schema (JSON-LD)

### Added Fields

**`legalName`** (NEW)
- Value: `"PWV Capital Management LLC"`
- Purpose: Provides the formal legal entity name from your footer, creating a strong entity signal
- This aligns with official business registrations and legal documents

**`disambiguatingDescription`** (NEW)
- Value: `"PWV is a Silicon Valley venture capital firm investing in early-stage technology companies. Not affiliated with any investment product, ETF, ticker symbol, or medical/cardiovascular measurement."`
- Purpose: Explicitly states what PWV is AND what it is NOT
- Disambiguates against BOTH the finance ETF and medical pulse wave velocity
- This is a Schema.org-supported field specifically designed for acronym/name conflicts

**`alternateName`** (ENHANCED)
- Changed from: String `"Preston-Werner Ventures"`
- Changed to: Array `["PWV", "Preston-Werner Ventures"]`
- Purpose: Tells Google that "PWV" and "Preston-Werner Ventures" are synonyms for the same entity

**Enhanced `knowsAbout`** (EXPANDED)
- Added: `"Seed funding"`, `"Pre-seed investing"`
- Purpose: Strengthens topical authority in venture capital space
- Helps Google understand PWV's domain expertise

**Strengthened `foundingDate`, `foundingLocation`, `areaServed`**
- These were already present but are crucial for entity differentiation
- Provide geographic and temporal anchors that distinguish PWV from financial products

### Schema Files Updated

- `src/lib/schema.ts` - Core schema generation functions
- `src/lib/homepage-schemas.ts` - Homepage-specific schema generation
- `src/components/schemas/OrganizationSchema.astro` - Standalone Organization schema component

---

## 2. WebPage Schema (NEW)

Added dedicated WebPage schema for the homepage to strengthen entity association:

**Purpose:**
- Explicitly declares that the homepage is "about" the PWV Organization
- Creates a tight link between website → webpage → organization
- Provides another layer of entity relationship signals

**Implementation:**
```typescript
generateWebPageSchema({
  name: `${SITE_NAME} - Early stage capital for technology founders`,
  url: canonicalURL.toString(),
  description: SITE_DESCRIPTION,
  about: {
    id: organizationId,  // Links to Organization via @id
  },
  publisher: {
    id: organizationId,  // Publisher is the Organization
  },
  isPartOf: {
    id: websiteId,  // Part of the WebSite
  },
})
```

**Files Updated:**
- `src/lib/schema.ts` - Added `generateWebPageSchema()` function and `WebPageSchemaOptions` interface
- `src/lib/homepage-schemas.ts` - Generates WebPage schema for homepage
- `src/layouts/HomeLayout.astro` - Renders WebPage schema

---

## 3. Enhanced WebSite Schema

**Added `publisher` relationship:**
- Links WebSite to Organization via `@id` reference
- Creates bidirectional entity relationship

**Added `@id` support:**
- WebSite now has its own `@id` so WebPage can reference it
- Enables proper entity graph connections

**Files Updated:**
- `src/lib/schema.ts` - Enhanced `generateWebSiteSchema()`
- `src/components/schemas/WebSiteSchema.astro` - Updated to include publisher link

---

## 4. Dedicated Disambiguation Page (NEW)

Created `/what-is-pwv` page with comprehensive disambiguation content and FAQ schema.

**URL:** https://pwv.com/what-is-pwv

**Key Features:**

### Content Strategy
- Clear "About PWV" section establishing identity
- Prominent callout box: "PWV is not related to the Invesco PWV ETF"
- Direct statement: "Not affiliated with any investment product, ETF, or ticker symbol"
- Comprehensive FAQ section answering common questions
- Links to Invesco.com for users looking for the ETF

### FAQ Schema (JSON-LD)
Implements FAQPage schema with 7 key questions:

1. "What is PWV?" - Establishes core identity
2. "Is PWV the same as the Invesco PWV ETF or pulse wave velocity?" - Direct disambiguation against BOTH finance and medical meanings
3. "What does PWV stand for?" - Clarifies acronym meaning in context
4. "Where is PWV located?" - Geographic identity
5. "What types of companies does PWV invest in?" - Topical focus
6. "How can I apply for funding from PWV?" - Functional purpose
7. "Who are the partners at PWV?" - Leadership/authority signals

**SEO Benefits:**
- Targets "pwv", "pwv meaning", "what is pwv" queries
- Provides Google with structured Q&A data for rich snippets
- Reduces wrong-intent traffic from ETF searchers and medical researchers
- Explicitly addresses multiple meanings of the PWV acronym
- Strengthens topical authority through comprehensive content

**File Created:**
- `src/pages/what-is-pwv.astro`

---

## 5. Enhanced Entity Linking

**All schemas now use @id references for proper entity linking:**

```
Organization (@id: https://pwv.com/#organization)
  ↑
  ├── WebSite.publisher → Organization
  ├── WebPage.about → Organization
  ├── WebPage.publisher → Organization
  ├── Article.publisher → Organization
  └── Person.worksFor → Organization
```

This creates a strong entity graph that Google can understand and trust.

---

## Schema Structure Summary

### Homepage Schemas (src/layouts/HomeLayout.astro)

The homepage now emits **3 interconnected schemas**:

1. **Organization Schema**
   - Core entity with legalName, disambiguatingDescription, alternateName
   - Links to founders (Person entities)
   - Social profiles, contact information, knowledge areas

2. **WebSite Schema**
   - Represents pwv.com as a website
   - Links to Organization as publisher

3. **WebPage Schema** (NEW)
   - Represents the homepage
   - About: Organization
   - Publisher: Organization
   - Part of: WebSite

### Article/News Post Schemas (src/pages/news/[...slug].astro)

Already implemented and working well:
- Article/BlogPosting schema with author, publisher, dates
- BreadcrumbList schema for navigation
- Links to PWV Organization as publisher

### Team Member Pages (src/pages/team/[slug].astro)

Already implemented:
- Person schema with worksFor → Organization link
- Social profiles (sameAs)

### Disambiguation Page (src/pages/what-is-pwv.astro)

- FAQPage schema with structured Q&A
- Rich snippet eligible content

---

## Testing & Validation

### Recommended Next Steps

1. **Validate JSON-LD on Live Page**
   - Use [Google Rich Results Test](https://search.google.com/test/rich-results)
   - Use [Schema Markup Validator](https://validator.schema.org/)
   - Ensure no parsing errors or warnings

2. **Check Live Homepage**
   - View page source for https://pwv.com
   - Confirm all three schemas are present (Organization, WebSite, WebPage)
   - Verify JSON is valid (no trailing characters, proper escaping)

3. **Test Disambiguation Page**
   - Visit https://pwv.com/what-is-pwv
   - Validate FAQ schema
   - Check that content is clear and helpful

4. **Submit to Google**
   - Request re-crawl via Google Search Console
   - Submit sitemap to ensure new page is discovered
   - Monitor search appearance over 2-4 weeks

5. **Monitor Search Results**
   - Track searches for "PWV", "pwv.com", "Preston-Werner Ventures"
   - Watch for knowledge graph updates
   - Monitor organic traffic quality (reduce ETF-seeking visitors)

---

## Expected Impact

### Short Term (2-4 weeks)
- Google re-crawls and indexes new schema
- Rich results may appear for FAQ queries
- Knowledge graph updates begin

### Medium Term (1-3 months)
- Improved entity disambiguation in search results
- Better targeting of venture capital related queries
- Reduced confusion with ETF ticker

### Long Term (3-6 months)
- Established entity identity in Google's knowledge graph
- Stronger brand presence for "PWV" acronym searches
- Compounding effect from content + schema signals

---

## Technical Implementation Notes

### Schema Generation Architecture

All schema generation is centralized in `src/lib/schema.ts`:

- **Interfaces:** TypeScript interfaces define schema options
- **Generators:** Pure functions generate JSON-LD objects
- **Components:** Astro components render schemas in pages
- **Layouts:** Layouts coordinate multiple schemas

### Benefits of This Architecture

1. **Type Safety:** TypeScript catches errors at build time
2. **Reusability:** Schema functions used across multiple pages
3. **Maintainability:** Single source of truth for schema logic
4. **Extensibility:** Easy to add new schema types

### Adding New Schemas

To add a new schema type:

1. Add interface to `src/lib/schema.ts`:
   ```typescript
   export interface NewSchemaOptions {
     // ... fields
   }
   ```

2. Add generator function:
   ```typescript
   export function generateNewSchema(options: NewSchemaOptions): object {
     // ... implementation
   }
   ```

3. Use in pages via `additionalSchemas` prop:
   ```astro
   <Layout additionalSchemas={[{ schema: newSchema }]}>
   ```

---

## Files Changed

### Core Library Files
- `src/lib/schema.ts` - Enhanced Organization schema, added WebPage schema
- `src/lib/homepage-schemas.ts` - Updated to generate WebPage schema

### Components
- `src/components/schemas/OrganizationSchema.astro` - Added disambiguation fields
- `src/components/schemas/WebSiteSchema.astro` - Added publisher link

### Layouts
- `src/layouts/HomeLayout.astro` - Now renders 3 schemas (Organization, WebSite, WebPage)

### Pages
- `src/pages/what-is-pwv.astro` - NEW: Comprehensive disambiguation page with FAQ schema

---

## Maintenance

### Keeping Schemas Updated

**When to Update:**
- Company information changes (address, legal name, etc.)
- New team members join as general partners
- Social media profiles change
- New focus areas or investment themes

**Where to Update:**
- Organization details: `src/components/schemas/OrganizationSchema.astro`
- Site-wide constants: `src/consts.ts`
- Team information: Content collections in `src/content/team/`

### Schema Monitoring

**Tools to Use:**
- Google Search Console → Enhancements → Structured Data
- Regular validation with Rich Results Test
- Monitor for parsing errors or warnings

---

## Additional Recommendations

### Content Strategy

1. **Internal Linking**
   - Link to `/what-is-pwv` from footer or about page
   - Reference disambiguation in blog posts when appropriate

2. **Meta Descriptions**
   - Include "venture capital firm" in meta descriptions
   - Avoid ambiguous language that could apply to ETFs

3. **Content Topics**
   - Continue publishing venture capital related content
   - Focus on founder stories, startup advice, portfolio updates
   - Build topical authority in early-stage investing

### Link Building

1. **Get Listed On:**
   - Crunchbase (as venture capital firm)
   - AngelList/Wellfound
   - VC directories and databases

2. **Press & Media:**
   - Ensure press releases specify "venture capital firm"
   - Update any outdated listings or profiles

3. **Wikipedia/Wikidata:**
   - If eligibility criteria are met, consider Wikipedia entry
   - Ensure Wikidata entry clearly categorizes as VC firm

---

## Conclusion

These changes provide a comprehensive, standards-compliant solution to the PWV acronym disambiguation challenge. By combining:

- Enhanced Organization schema with explicit disambiguation fields
- Structured entity relationships (Organization → WebSite → WebPage)
- Dedicated disambiguation content with FAQ schema
- Strong topical signals (knowsAbout, content focus)

We've created multiple reinforcing signals that help Google understand PWV as a venture capital firm, not a financial product.

The implementation follows Schema.org best practices, maintains backward compatibility, and provides a foundation for future SEO enhancements.

---

**Last Updated:** January 24, 2026  
**Build Status:** ✅ Passed (pnpm build successful)  
**Ready for Deployment:** Yes
