# Celebrate & Amplify: A Founder-First Content Philosophy

## Overview

The PWV website organizes entity-based content discovery into two distinct sections: **Celebrate** and **Amplify**. This structure reflects PWV's core investment philosophy and values, grounded in Tom Preston-Werner's vision for backing ideas that create a differentiated future.

## The Core Philosophy

> "My goal, with every PWV investment, is to back ideas that truly create a differentiated future. Ideas that change the fundamental rules of what's possible. **Ideas that both embrace technology and celebrate people** as the most important factor in the better future we want to build.
> 
> That's how I created and scaled GitHub to a $7.5B exit."
> 
> — Tom Preston-Werner, General Partner, GitHub Cofounder

PWV is built on three foundational beliefs:

1. **Ideas start with founders**
2. **Founders start with PWV**
3. **PWV is the fund we wanted as early-stage founders**

This founder-first approach prioritizes people over everything else while recognizing that breakthrough ideas deserve to be heard.

## Why "Celebrate"?

### The Human Element

"Celebrate" is the home for **people** and **companies** — the human and organizational entities that drive innovation forward.

This naming choice directly reflects Tom's quote: "celebrate people as the most important factor in the better future we want to build."

### What We Celebrate

- **People** (`/celebrate/people/`): Founders, investors, technologists, and thought leaders who appear in PWV content
  - Recognizes individual contributors and their roles
  - Honors the human expertise behind breakthrough ideas
  - Shows avatars and attribution to maintain personal connection

- **Companies** (`/celebrate/companies/`): Portfolio companies and organizations mentioned across PWV posts
  - Highlights the teams building the future
  - Showcases category-defining companies from zero to breakout
  - Displays company logos and links to their stories

### The Message

By using "celebrate," we signal that PWV:
- Puts founders first
- Values people as the primary driver of innovation
- Recognizes and honors the individuals and teams creating change
- Believes that technology serves humanity, not the other way around

## Why "Amplify"?

### The Ideas That Matter

"Amplify" is the home for **quotes**, **facts**, and **figures** — the insights, data, and wisdom that deserve broader reach.

This naming choice reflects PWV's commitment to backing "ideas that truly create a differentiated future" and sharing knowledge that can help other founders succeed.

### What We Amplify

- **Quotes** (`/amplify/quotes/`): Notable insights and wisdom from founders, investors, and technologists
  - Surfaces key ideas and philosophies
  - Preserves speaker attribution and context
  - Shares knowledge that can inspire other founders

- **Facts** (`/amplify/facts/`): Key insights, trends, philosophies, announcements, and milestones
  - Highlights important developments in technology and venture capital
  - Categorizes knowledge for easy discovery
  - Documents the narrative of innovation

- **Figures** (`/amplify/figures/`): Key metrics and numbers that tell the story
  - Quantifies impact and scale
  - Provides context for understanding technology trends
  - Shares data points that inform founder decisions

### The Message

By using "amplify," we signal that PWV:
- Shares knowledge to help the broader founder community
- Believes in ideas that "change the fundamental rules of what's possible"
- Amplifies voices and insights that deserve wider reach
- Supports the ecosystem, not just individual investments

## The Duality: Technology & People

The Celebrate/Amplify structure embodies the duality in Tom's vision:

> "Ideas that both **embrace technology** and **celebrate people**"

- **Celebrate** = People & Companies (the human element)
- **Amplify** = Quotes, Facts & Figures (the ideas and insights)

This structure creates a natural separation between:
1. **Who is building** (Celebrate)
2. **What they're saying and achieving** (Amplify)

## Alignment with PWV Values

### Founder-First Values

The structure prioritizes people (Celebrate) as its own top-level section, reinforcing that founders and teams come first.

### Early-Stage Focus

PWV invests from pre-seed through Series A. The content structure mirrors this stage:
- **Celebrate** focuses on the founders and companies at these early stages
- **Amplify** shares the insights and data points that help early-stage founders succeed

### Track Record of Category-Defining Companies

PWV has "backed category-defining companies from zero to breakout." The content structure:
- **Celebrates** these companies and their founders
- **Amplifies** the insights and metrics that tell their stories

## User Experience Benefits

### Clear Intent

The verbs "celebrate" and "amplify" are action-oriented and value-driven:
- More meaningful than generic "explore" or "browse"
- Communicates PWV's active role in supporting founders
- Reflects authentic voice and mission

### Intuitive Navigation

Users immediately understand:
- `/celebrate/` → Learn about people and companies
- `/amplify/` → Discover insights, quotes, and data

### SEO & Discoverability

The terminology:
- Creates unique, memorable URLs
- Aligns with search intent (users looking for founder stories, insights, metrics)
- Reinforces brand identity and values in every URL

## Implementation Details

### URL Structure

```
/celebrate/
├── companies/          # Companies we celebrate
│   └── [slug]/        # Individual company pages
└── people/            # People we celebrate
    └── [slug]/        # Individual person pages

/amplify/
├── quotes/            # Insights we amplify
│   └── [slug]/       # Individual quote pages
├── facts/            # Knowledge we amplify
│   └── [slug]/       # Individual fact pages
└── figures/          # Data we amplify
    └── [slug]/       # Individual figure pages
```

### Navigation

- **Header**: "Celebrate" link (defaults to `/celebrate/companies/`)
- **Footer**: "Celebrate" link + "Terminal" link
- **Sub-navigation**: `CelebrateNav` and `AmplifyNav` components for section-specific browsing

### Redirects

All old `/explore/` URLs redirect (301) to their new equivalents:
- `/explore/companies/` → `/celebrate/companies/`
- `/explore/people/` → `/celebrate/people/`
- `/explore/quotes/` → `/amplify/quotes/`

## Content Philosophy

### Celebrate: People-First

Following Tom's principle that "people [are] the most important factor," Celebrate pages:
- Feature avatars and personal attribution
- Show roles and context
- Link to related content that tells their stories
- Use warm, inviting design with company/person-specific colors

### Amplify: Ideas Forward

Following PWV's mission to back "ideas that change the fundamental rules of what's possible," Amplify pages:
- Surface key insights and wisdom
- Categorize knowledge for discoverability
- Provide context and attribution
- Use vibrant, engaging design to draw attention to important ideas

## Long-Term Vision

This structure is designed to scale with PWV's growth:

1. **As the portfolio grows**, Celebrate pages showcase more founders and companies
2. **As insights accumulate**, Amplify pages become a knowledge base for the founder community
3. **As PWV's voice strengthens**, the content reflects its values at every touchpoint

The Celebrate/Amplify framework isn't just navigation — it's a statement about what PWV values and how we engage with the founder community.

---

## Design Principles

### Visual Identity

- **Celebrate pages**: Warmer color palette, avatars, logos, personal touches
- **Amplify pages**: Vibrant, attention-grabbing colors, data-focused layout

### Social Sharing

All entity pages include social sharing buttons that link back to PWV-hosted content, ensuring:
- Traffic returns to pwv.com
- PWV's voice and context are preserved
- Founder stories and insights are attributed properly

### SEO & Structured Data

Every entity detail page includes comprehensive SEO metadata:
- Open Graph tags for rich social previews
- Twitter Card metadata
- JSON-LD structured data
- Dynamic hero images from related posts

This ensures that when PWV content is shared, it carries the full context and branding.

## Conclusion

The Celebrate/Amplify structure is more than a navigation pattern — it's a content philosophy that embodies PWV's values:

- **Celebrate people** because they're the most important factor
- **Amplify ideas** because they change what's possible
- **Support founders** by creating a knowledge base that serves the entire community

This approach turns the PWV website into a living expression of its investment philosophy: technology and humanity working together to build a better future.
