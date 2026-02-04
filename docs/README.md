# PWV.com Documentation

Comprehensive documentation for the PWV.com website project.

## 📚 Table of Contents

### Entity Extraction System

#### Getting Started
- **[QUICK-START-EXTRACTION.md](./QUICK-START-EXTRACTION.md)** - Quick start guide for entity extraction
- **[EXTRACTION-QUICK-REF.md](./EXTRACTION-QUICK-REF.md)** - Quick reference for extraction commands

#### Core Documentation
- **[ENTITIES-SINGLE-SOURCE-OF-TRUTH.md](./ENTITIES-SINGLE-SOURCE-OF-TRUTH.md)** - ⭐ Current architecture (single source of truth)
- **[ENTITIES-INDIVIDUAL-FILES.md](./ENTITIES-INDIVIDUAL-FILES.md)** - Individual file architecture details
- **[ENTITY-EXTRACTION-FINAL-IMPROVEMENTS.md](./ENTITY-EXTRACTION-FINAL-IMPROVEMENTS.md)** - Latest feature additions (quotes, facts, dates)

#### Evolution & Improvements
- **[ENTITY-EXTRACTION-IMPROVEMENTS.md](./ENTITY-EXTRACTION-IMPROVEMENTS.md)** - Initial improvements (investors, portfolio)
- **[EXTRACTION-CHANGES-SUMMARY.md](./EXTRACTION-CHANGES-SUMMARY.md)** - Summary of all extraction changes
- **[EXTRACTION-TIMING-COST-SUMMARY.md](./EXTRACTION-TIMING-COST-SUMMARY.md)** - Timing and cost tracking
- **[EXTRACTION-DETAILED-LOGGING.md](./EXTRACTION-DETAILED-LOGGING.md)** - Detailed entity logging
- **[EXTRACTION-PROGRESS-LOGGING.md](./EXTRACTION-PROGRESS-LOGGING.md)** - Progress counter logging

#### File Structure & Architecture
- **[ENTITIES-FILE-LOCATION-UPDATE.md](./ENTITIES-FILE-LOCATION-UPDATE.md)** - Moving to content collection structure
- **[ENTITIES-FILE-NECESSITY.md](./ENTITIES-FILE-NECESSITY.md)** - Analysis of file requirements

#### AI Provider Guides
- **[OPENAI-EXTRACTION-GUIDE.md](./OPENAI-EXTRACTION-GUIDE.md)** - Using OpenAI for extraction
- **[FAL-EXTRACTION-GUIDE.md](./FAL-EXTRACTION-GUIDE.md)** - Using FAL AI for extraction
- **[FAL-ADDITION-SUMMARY.md](./FAL-ADDITION-SUMMARY.md)** - FAL AI integration summary
- **[FAL-API-FIX.md](./FAL-API-FIX.md)** - FAL API fixes
- **[EXTRACTION-MODEL-RECOMMENDATION.md](./EXTRACTION-MODEL-RECOMMENDATION.md)** - Model selection guidance

#### Prompt Engineering
- **[PROMPT-IMPROVEMENT.md](./PROMPT-IMPROVEMENT.md)** - Prompt improvements
- **[PROMPT-FIX.md](./PROMPT-FIX.md)** - Prompt fixes

### Content Collections & Schema

- **[CONTENT-CONFIG-SCHEMA-UPDATE.md](./CONTENT-CONFIG-SCHEMA-UPDATE.md)** - Content collection schema updates
- **[EXTRACTED-ENTITIES-USAGE.md](./EXTRACTED-ENTITIES-USAGE.md)** - How to use extracted entities

### Terminal Interface

- **[EXPLORE-TERMINAL.md](./EXPLORE-TERMINAL.md)** - Terminal interface documentation

### Content & SEO

- **[FRONTMATTER-ENHANCEMENT.md](./FRONTMATTER-ENHANCEMENT.md)** - Frontmatter improvements
- **[SEO-DISAMBIGUATION-IMPROVEMENTS.md](./SEO-DISAMBIGUATION-IMPROVEMENTS.md)** - SEO improvements
- **[DISAMBIGUATION-SUMMARY.md](./DISAMBIGUATION-SUMMARY.md)** - Disambiguation summary

### UI & Design

- **[MOBILE-RESPONSIVE.md](./MOBILE-RESPONSIVE.md)** - Mobile responsiveness

### Deployment & Validation

- **[DEPLOYMENT-READY.md](./DEPLOYMENT-READY.md)** - Deployment readiness checklist
- **[VALIDATION-CHECKLIST.md](./VALIDATION-CHECKLIST.md)** - Validation checklist

## 🎯 Quick Links by Topic

### I want to extract entities from posts
1. Start with [QUICK-START-EXTRACTION.md](./QUICK-START-EXTRACTION.md)
2. Choose AI provider: [OPENAI-EXTRACTION-GUIDE.md](./OPENAI-EXTRACTION-GUIDE.md) or [FAL-EXTRACTION-GUIDE.md](./FAL-EXTRACTION-GUIDE.md)
3. Reference: [EXTRACTION-QUICK-REF.md](./EXTRACTION-QUICK-REF.md)

### I want to understand the architecture
1. Current system: [ENTITIES-SINGLE-SOURCE-OF-TRUTH.md](./ENTITIES-SINGLE-SOURCE-OF-TRUTH.md)
2. File structure: [ENTITIES-INDIVIDUAL-FILES.md](./ENTITIES-INDIVIDUAL-FILES.md)
3. Schema: [CONTENT-CONFIG-SCHEMA-UPDATE.md](./CONTENT-CONFIG-SCHEMA-UPDATE.md)

### I want to see what features exist
1. Latest features: [ENTITY-EXTRACTION-FINAL-IMPROVEMENTS.md](./ENTITY-EXTRACTION-FINAL-IMPROVEMENTS.md)
2. All improvements: [EXTRACTION-CHANGES-SUMMARY.md](./EXTRACTION-CHANGES-SUMMARY.md)
3. Terminal interface: [EXPLORE-TERMINAL.md](./EXPLORE-TERMINAL.md)

### I want to improve extraction quality
1. Prompt engineering: [PROMPT-IMPROVEMENT.md](./PROMPT-IMPROVEMENT.md)
2. Model selection: [EXTRACTION-MODEL-RECOMMENDATION.md](./EXTRACTION-MODEL-RECOMMENDATION.md)

## 📊 Document Status

### Current Architecture (✅ Active)
- ENTITIES-SINGLE-SOURCE-OF-TRUTH.md - ⭐ Primary architecture doc
- ENTITIES-INDIVIDUAL-FILES.md
- ENTITY-EXTRACTION-FINAL-IMPROVEMENTS.md
- CONTENT-CONFIG-SCHEMA-UPDATE.md

### Historical / Deprecated (📚 Reference Only)
- ENTITIES-FILE-NECESSITY.md - Analysis that led to single source
- ENTITIES-FILE-LOCATION-UPDATE.md - Migration to content collections

## 🔍 Search by Keyword

- **Quotes**: ENTITY-EXTRACTION-FINAL-IMPROVEMENTS.md
- **Investors**: ENTITY-EXTRACTION-IMPROVEMENTS.md
- **Facts**: ENTITY-EXTRACTION-FINAL-IMPROVEMENTS.md
- **Timing/Cost**: EXTRACTION-TIMING-COST-SUMMARY.md
- **Progress**: EXTRACTION-PROGRESS-LOGGING.md
- **Individual Files**: ENTITIES-INDIVIDUAL-FILES.md
- **Collections**: CONTENT-CONFIG-SCHEMA-UPDATE.md
- **Terminal**: EXPLORE-TERMINAL.md
- **OpenAI**: OPENAI-EXTRACTION-GUIDE.md
- **FAL**: FAL-EXTRACTION-GUIDE.md
- **Prompt**: PROMPT-IMPROVEMENT.md
- **Schema**: CONTENT-CONFIG-SCHEMA-UPDATE.md
- **SEO**: SEO-DISAMBIGUATION-IMPROVEMENTS.md
- **Mobile**: MOBILE-RESPONSIVE.md
- **Deploy**: DEPLOYMENT-READY.md

## 📝 Contributing Documentation

When adding new documentation:

1. **Place in `/docs` directory** at project root
2. **Use descriptive filenames** (KEBAB-CASE-TITLE.md)
3. **Update this README** with the new doc in appropriate section
4. **Include date if time-sensitive** in the document
5. **Cross-reference related docs** where applicable

## 🎨 Documentation Standards

### Document Structure:
- **Overview** - What this document covers
- **Changes Made** - Specific changes/features
- **Benefits** - Why these changes matter
- **Usage Examples** - How to use the feature
- **Validation** - Proof it works
- **Summary** - Key takeaways

### Code Examples:
- Use triple backticks with language identifier
- Show before/after when applicable
- Include file paths in comments
- Keep examples focused and relevant

### Status Indicators:
- ✅ Implemented and working
- ⭐ Important/Primary documentation
- 📚 Reference/Historical
- ❌ Deprecated/Removed
- 🚧 Work in progress

---

**Last Updated**: February 4, 2026

For the main project README, see [../README.md](../README.md)
