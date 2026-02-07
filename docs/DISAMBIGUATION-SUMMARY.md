# PWV Disambiguation Strategy: Finance + Medical

## The Challenge

The acronym **"PWV"** has three distinct meanings across different domains:

### 1. **Finance: Invesco PWV ETF**
- **Full Name:** Invesco Dynamic Large Cap Value ETF
- **Ticker Symbol:** PWV
- **Authority:** Strong presence on financial sites (Yahoo Finance, Bloomberg, Invesco.com, etc.)
- **Search Volume:** High - retail investors frequently search for ticker symbols

### 2. **Medicine: Pulse Wave Velocity**
- **Full Name:** Pulse wave velocity
- **Context:** Cardiovascular measurement, arterial stiffness biomarker
- **Authority:** Strong presence in medical journals, health research, biometrics
- **Search Volume:** Medium - medical professionals, researchers, health tech

### 3. **Venture Capital: Preston-Werner Ventures (PWV)**
- **Full Name:** Preston-Werner Ventures
- **Legal Entity:** PWV Capital Management LLC
- **Context:** Early-stage technology venture capital firm
- **Authority:** Building through content, schema, entity signals
- **Challenge:** Competing against two well-established meanings

## Why This Matters

Google's disambiguation challenge:
- **"PWV"** query → Should it show the ETF, the medical term, or the VC firm?
- **Authority signals:** Finance and medical domains have decades of authoritative content
- **User intent:** Without context, Google must guess what the searcher wants

**Our goal:** Make it unmistakably clear that pwv.com = venture capital firm, not finance product or medical metric.

---

## Our Multi-Layered Solution

### Layer 1: Schema.org Disambiguation

**Organization Schema with explicit disambiguation:**

```json
{
  "@type": "Organization",
  "name": "PWV",
  "legalName": "PWV Capital Management LLC",
  "alternateName": ["PWV", "Preston-Werner Ventures"],
  "disambiguatingDescription": "PWV is a Silicon Valley venture capital firm investing in early-stage technology companies. Not affiliated with any investment product, ETF, ticker symbol, or medical/cardiovascular measurement."
}
```

**Key fields:**
- `legalName` → Formal entity name (legal anchor)
- `alternateName` → Synonyms Google should recognize
- `disambiguatingDescription` → **Explicitly states what PWV is NOT** (finance OR medical)
- `knowsAbout` → Venture capital terms strengthen topical authority

### Layer 2: Entity Graph Linking

**Proper @id references across all schemas:**

```
Organization (#organization)
  ↑
  ├── WebSite.publisher → Organization
  ├── WebPage.about → Organization
  ├── WebPage.publisher → Organization
  ├── Article.publisher → Organization
  └── Person.worksFor → Organization
```

This creates a tight entity graph that tells Google:
- pwv.com (website) is published by PWV (organization)
- Homepage is *about* PWV (organization)
- Articles are published by PWV (organization)
- Team members work for PWV (organization)

### Layer 3: Dedicated Disambiguation Page

**URL:** `/what-is-pwv`

**Content Strategy:**
1. **Prominent clarification box** at top of page listing all three meanings
2. **FAQ section** with structured Q&A addressing confusion
3. **FAQPage schema** making content rich-snippet eligible

**FAQ Schema includes:**
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "name": "Is PWV the same as the Invesco PWV ETF or pulse wave velocity?",
      "acceptedAnswer": {
        "text": "No. PWV (Preston-Werner Ventures) is a private venture capital firm. We are completely separate from: (1) the Invesco Dynamic Large Cap Value ETF, which trades under the ticker symbol PWV, and (2) pulse wave velocity (PWV), a cardiovascular measurement..."
      }
    }
  ]
}
```

**Key questions answered:**
- What is PWV? (establishes identity)
- Is PWV the same as the ETF or pulse wave velocity? (explicit disambiguation)
- What does PWV stand for? (clarifies acronym in context)
- Where is PWV located? (geographic anchor)
- What types of companies does PWV invest in? (topical focus)

### Layer 4: Content Signals

**Throughout the site:**
- Consistent use of "venture capital firm" descriptor
- Focus on early-stage investing, founders, technology
- Portfolio showcasing tech companies
- News about investments, not financial products or medical research

**Topical authority:**
- Blog posts about venture capital
- Founder testimonials
- Investment thesis content
- Technology focus areas

---

## Expected Google Behavior

### Short-term (2-4 weeks)
- Google re-crawls site with new schema
- Rich Results Test validates disambiguation fields
- FAQ schema recognized for rich snippet eligibility

### Medium-term (1-3 months)
- Knowledge graph begins incorporating disambiguating description
- Rich snippets may appear for "pwv meaning" queries
- Search Console shows improved entity recognition

### Long-term (3-6+ months)
- Established entity identity distinct from finance and medical
- "PWV venture capital" queries rank strongly
- Reduced wrong-intent traffic from ETF seekers and medical researchers
- Brand presence strengthens for "PWV" + tech/startup context

---

## How This Differs from Basic SEO

### Traditional Approach ❌
- Add "venture capital" to title tags
- Write meta descriptions
- Build backlinks

**Problem:** Doesn't help Google understand entity disambiguation at the knowledge graph level.

### Our Entity-First Approach ✅
1. **Legal identity:** `legalName` provides formal entity anchor
2. **Explicit negation:** Directly states what PWV is NOT (rare but powerful)
3. **Entity graph:** Tight linking between all schemas
4. **Multi-context disambiguation:** Addresses finance AND medical confusion
5. **Structured Q&A:** FAQ schema provides Google-friendly disambiguation signals

**Why this works:**
- Google's knowledge graph prioritizes entity relationships
- `disambiguatingDescription` is specifically designed for acronym conflicts
- Entity @id linking creates authority signals
- Structured data > unstructured content for entity recognition

---

## Validation Checklist

### Pre-Deployment ✅
- [x] Build succeeds
- [x] Schema includes `disambiguatingDescription` with both finance and medical
- [x] FAQ page mentions pulse wave velocity
- [x] Content clarification box lists both meanings

### Post-Deployment
- [ ] Google Rich Results Test validates schemas
- [ ] No JSON syntax errors in live page source
- [ ] FAQ schema eligible for rich snippets
- [ ] Search Console shows no structured data errors

### Monitoring (Ongoing)
- [ ] Track searches bringing traffic (should shift toward VC terms)
- [ ] Monitor bounce rate from "pwv etf" and "pwv medical" queries
- [ ] Watch for knowledge graph updates
- [ ] Check if FAQ rich snippets appear

---

## Success Metrics

### Entity Recognition
- **Goal:** Google Knowledge Graph recognizes PWV as venture capital firm
- **Measure:** Knowledge panel shows correct entity type
- **Timeline:** 3-6 months

### Search Disambiguation
- **Goal:** "PWV" searches show venture capital results in relevant contexts
- **Measure:** Search appearance for "pwv venture capital", "pwv investing" queries
- **Timeline:** 2-4 months

### Traffic Quality
- **Goal:** Reduce wrong-intent traffic from finance/medical searchers
- **Measure:** Decrease in bounce rate from "pwv etf" and "pwv cardiovascular" queries
- **Timeline:** 1-3 months

### Rich Snippets
- **Goal:** FAQ rich snippets appear for disambiguation queries
- **Measure:** Impressions/clicks from featured snippets
- **Timeline:** 2-8 weeks

---

## Why Both Finance AND Medical Matter

You might ask: "Why not just focus on the ETF, which is the bigger confusion?"

**Answer:** Google's algorithm looks for **comprehensive disambiguation signals.**

### Finance-Only Approach:
```
"PWV is not the Invesco ETF"
```
**Problem:** Doesn't help with medical queries. Someone searching "pwv measurement" still gets confused.

### Comprehensive Approach:
```
"PWV is not affiliated with any investment product, ETF, ticker symbol, or medical/cardiovascular measurement"
```
**Benefit:** 
- Covers ALL major meanings of the acronym
- Shows Google we understand the full disambiguation challenge
- Helps medical researchers quickly realize they're in the wrong place
- Demonstrates entity awareness (Google values this)

### Real-World Example:
- User searches "pwv meaning"
- Without medical disambiguation: They might think we forgot about that meaning
- With medical disambiguation: They see we're explicitly NOT the medical term
- Result: Clearer understanding, better entity signals, reduced confusion

---

## Technical Implementation

### Files Modified

**Schema Library:**
- `src/lib/schema.ts` - Core schema generation
- `src/lib/homepage-schemas.ts` - Homepage-specific schemas

**Components:**
- `src/components/schemas/OrganizationSchema.astro` - Organization with disambiguation
- `src/components/schemas/WebSiteSchema.astro` - WebSite linking

**Layouts:**
- `src/layouts/HomeLayout.astro` - Renders 3 interconnected schemas

**Pages:**
- `src/pages/what-is-pwv.astro` - **NEW** - Comprehensive disambiguation page

### Schema Structure

**Homepage emits 3 schemas:**
1. Organization (with legalName, alternateName, disambiguatingDescription)
2. WebSite (with publisher link)
3. WebPage (with about + publisher + isPartOf links)

**Disambiguation page emits:**
1. FAQPage (with 7 Q&A pairs addressing both finance and medical)

---

## Maintenance

### Regular Updates
- Keep `legalName` aligned with legal entity name
- Update `sameAs` when social profiles change
- Add new `knowsAbout` terms as focus areas evolve
- Refresh FAQ content annually

### Monitoring
- Monthly: Check Search Console for structured data errors
- Quarterly: Review organic traffic patterns for wrong-intent searches
- Biannually: Validate schemas with Rich Results Test
- Annually: Audit all schema markup for accuracy

---

## Conclusion

By implementing **dual disambiguation** (finance + medical), we've created a comprehensive solution that:

1. ✅ Tells Google exactly what PWV is (venture capital firm)
2. ✅ Tells Google what PWV is NOT (finance product OR medical measurement)
3. ✅ Creates strong entity graph signals
4. ✅ Provides user-friendly disambiguation content
5. ✅ Positions PWV for rich snippet opportunities

This is not just SEO—it's **entity engineering** for Google's knowledge graph.

**The key insight:** When competing against multiple well-established meanings, you must be explicit about ALL of them, not just the most obvious one.

---

**Implementation Date:** January 24, 2026  
**Build Status:** ✅ PASSED  
**Disambiguation Targets:** Finance (Invesco ETF) + Medical (pulse wave velocity)  
**Strategy:** Multi-layered entity disambiguation with structured data
