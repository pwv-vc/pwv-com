# SEO Disambiguation - Validation Checklist

## Pre-Deployment Validation

### 1. Build Validation
- [x] Site builds successfully (`pnpm build`)
- [x] No TypeScript errors
- [x] No linting errors
- [x] All pages generate correctly (244 pages built)

### 2. JSON-LD Schema Validation

#### Homepage (https://pwv.com)

**Organization Schema:**
- [ ] Contains `legalName: "PWV Capital Management LLC"`
- [ ] Contains `disambiguatingDescription` with "Not affiliated with any investment product, ETF, or ticker symbol"
- [ ] `alternateName` is an array: `["PWV", "Preston-Werner Ventures"]`
- [ ] Contains `@id: "https://pwv.com/#organization"`
- [ ] Contains `foundingDate: "2023"`
- [ ] Contains `foundingLocation: "San Francisco Bay Area, USA"`
- [ ] Contains `areaServed: "Global"`
- [ ] `knowsAbout` includes venture capital terms
- [ ] `founder` array includes all three partners with `@id` references
- [ ] `sameAs` includes LinkedIn, Twitter, Bluesky, GitHub
- [ ] `contactPoint` includes investment inquiries email

**WebSite Schema:**
- [ ] Contains `@id: "https://pwv.com/#website"`
- [ ] Links to Organization via `publisher.@id`

**WebPage Schema:**
- [ ] Links to Organization via `about.@id`
- [ ] Links to Organization via `publisher.@id`
- [ ] Links to WebSite via `isPartOf.@id`

#### Disambiguation Page (https://pwv.com/what-is-pwv)

**FAQPage Schema:**
- [ ] Contains 7 questions
- [ ] Question 1: "What is PWV?"
- [ ] Question 2: "Is PWV the same as the Invesco PWV ETF?"
- [ ] All questions have properly formatted `acceptedAnswer`

### 3. Content Validation

#### Homepage
- [ ] Hero section clearly identifies PWV as venture capital firm
- [ ] No ambiguous language that could apply to ETFs

#### Disambiguation Page (/what-is-pwv)
- [ ] Page loads successfully
- [ ] "Important Clarification" box prominently displayed
- [ ] All FAQ sections render correctly
- [ ] Links to team pages work
- [ ] Links to apply page work
- [ ] Link to invesco.com for ETF seekers is present

### 4. Google Tools Validation

#### Rich Results Test
1. Go to: https://search.google.com/test/rich-results
2. Test URL: https://pwv.com
   - [ ] No errors
   - [ ] Organization detected
   - [ ] All fields parse correctly
3. Test URL: https://pwv.com/what-is-pwv
   - [ ] No errors
   - [ ] FAQPage detected
   - [ ] All Q&A pairs parse correctly

#### Schema Markup Validator
1. Go to: https://validator.schema.org/
2. Test homepage JSON-LD
   - [ ] No errors
   - [ ] No warnings
3. Test disambiguation page JSON-LD
   - [ ] No errors
   - [ ] No warnings

### 5. HTML Validation

**Check for Common Issues:**
- [ ] No trailing text after `</script>` tags
- [ ] JSON is properly escaped (no unescaped quotes)
- [ ] No syntax errors in schema blocks

**Command to extract and validate:**
```bash
# Extract homepage schemas
curl https://pwv.com | grep -A 100 'application/ld+json' > homepage-schemas.json

# Validate JSON (should return "valid json")
cat homepage-schemas.json | jq '.'
```

### 6. Cross-Page Schema Consistency

**Entity ID Consistency:**
- [ ] Organization `@id` is same across all pages: `https://pwv.com/#organization`
- [ ] Person `@id` format consistent: `https://pwv.com/team/{slug}#person`
- [ ] WebSite `@id` consistent: `https://pwv.com/#website`

**Links Between Entities:**
- [ ] All Article/BlogPosting publishers link to Organization
- [ ] All Person schemas link to Organization via `worksFor`
- [ ] All WebPage schemas link to Organization via `publisher`

### 7. News/Blog Posts (Sample Check)

Pick 3 random news posts and verify:
- [ ] Article schema includes publisher (Organization)
- [ ] Author links to team member if applicable
- [ ] Publisher logo is present
- [ ] datePublished and dateModified are ISO 8601 format

### 8. Team Pages (Sample Check)

Pick all 3 team member pages:
- [ ] Person schema includes `worksFor` → Organization link
- [ ] `sameAs` includes social profiles
- [ ] `@id` matches format used in Organization schema

## Post-Deployment Validation

### Google Search Console

**Submit for Re-crawl:**
1. Log into Google Search Console
2. Go to URL Inspection
3. Test live URL: https://pwv.com
4. Click "Request Indexing"
5. Test live URL: https://pwv.com/what-is-pwv
6. Click "Request Indexing"

**Monitor Structured Data:**
1. Go to Enhancements → Structured Data
2. Wait 3-7 days for re-crawl
3. Check for:
   - [ ] No errors on Organization schema
   - [ ] No errors on FAQPage schema
   - [ ] No errors on Article schemas

### Search Appearance Monitoring

**Week 1-2:**
- [ ] Check if "What is PWV?" appears in search suggestions
- [ ] Monitor organic traffic to /what-is-pwv page
- [ ] Check for any increase in venture capital related queries

**Week 3-4:**
- [ ] Check if FAQ rich snippets appear for "pwv meaning" queries
- [ ] Monitor click-through rate from SERPs
- [ ] Check if knowledge graph updates with new information

**Month 2-3:**
- [ ] Evaluate entity disambiguation in search results
- [ ] Compare PWV vs ETF confusion in organic traffic
- [ ] Monitor brand searches vs. product searches

### Analytics Tracking

**Key Metrics:**
1. Organic traffic to homepage (should maintain or increase)
2. Bounce rate from "pwv etf" searches (should decrease)
3. Traffic to /what-is-pwv page
4. Conversions from disambiguation page to /apply
5. Search queries bringing traffic (should shift toward VC terms)

## Tools & Resources

### Validation Tools
- **Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Validator:** https://validator.schema.org/
- **JSON Validator:** https://jsonlint.com/
- **Google Search Console:** https://search.google.com/search-console

### Testing Commands

**Extract Organization Schema:**
```bash
curl https://pwv.com | \
  grep -A 200 'application/ld+json' | \
  grep -A 150 '@type":"Organization' | \
  sed 's/<\/script>.*//' | \
  jq '.'
```

**Extract FAQ Schema:**
```bash
curl https://pwv.com/what-is-pwv | \
  grep -A 100 'application/ld+json' | \
  sed 's/<\/script>.*//' | \
  jq '.'
```

**Validate all pages have Organization schema:**
```bash
for page in "/" "/about" "/portfolio" "/news" "/team/tom-preston-werner"; do
  echo "Checking $page..."
  curl -s "https://pwv.com$page" | grep -q 'PWV Capital Management LLC' && \
    echo "✓ $page has legalName" || \
    echo "✗ $page missing legalName"
done
```

## Troubleshooting

### If Rich Results Test Shows Errors

**Common Issues:**
1. **Trailing characters after JSON:** Check for text like "David Thyresson go fetch"
2. **Invalid JSON:** Validate with `jq` or jsonlint.com
3. **Missing required fields:** Check Schema.org docs for field requirements
4. **Invalid URLs:** Ensure all URLs are absolute, not relative

**Fix Process:**
1. Identify which page has the error
2. Check the source `.astro` file
3. Validate JSON generation in `src/lib/schema.ts`
4. Rebuild and re-test

### If Google Doesn't Update Knowledge Graph

**Patience Required:**
- Knowledge graph updates can take 4-8 weeks
- May require multiple signals (schema + content + links)
- Consider submitting to Wikidata if eligible

**Accelerate Process:**
1. Get listed on Crunchbase with correct info
2. Get mentioned in press with "venture capital firm" descriptor
3. Build backlinks from VC-related sites
4. Create more content about venture capital topics

### If Wrong Traffic Persists

**Short-term:**
- Add banner to homepage: "Looking for the Invesco PWV ETF? Visit invesco.com"
- Create targeted landing page for "pwv etf" searches

**Long-term:**
- Continue building topical authority in venture capital
- Publish more content about portfolio companies, investment thesis
- Engage with venture capital community online

## Success Metrics

### Immediate (Week 1-2)
- ✅ No schema validation errors
- ✅ FAQPage rich results eligible
- ✅ /what-is-pwv indexed by Google

### Short-term (Month 1-2)
- ⏳ Rich snippets appear for some FAQ queries
- ⏳ Organic traffic maintains current levels
- ⏳ Bounce rate from wrong-intent traffic decreases

### Medium-term (Month 3-6)
- ⏳ Knowledge graph reflects PWV as VC firm
- ⏳ "PWV" search shows venture capital results
- ⏳ Significant reduction in ETF-seeking visitors

### Long-term (6+ months)
- ⏳ Strong entity identity in Google Knowledge Graph
- ⏳ Top rankings for venture capital related queries
- ⏳ Established brand presence for "PWV" acronym

---

**Last Updated:** January 24, 2026  
**Status:** Ready for Deployment Testing
