#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI Provider configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'lmstudio'; // 'lmstudio', 'openai', or 'fal'

// LM Studio configuration
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || 'liquid/lfm2.5-1.2b';
const LM_API_TOKEN = process.env.LM_API_TOKEN || ''; // Optional auth token

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // Cost-effective option

// FAL AnyLLM configuration
const FAL_KEY = process.env.FAL_KEY || '';
const FAL_MODEL = process.env.FAL_MODEL || 'meta-llama/llama-3.1-70b-instruct'; // Cost-effective, high quality

const POSTS_DIR = path.join(__dirname, '../src/content/posts');
const PORTFOLIO_DIR = path.join(__dirname, '../src/content/portfolio');
const ENTITIES_DIR = path.join(__dirname, '../src/content/entities');
const POSTS_OUTPUT_DIR = path.join(ENTITIES_DIR, 'posts');

/**
 * Parse frontmatter and content from markdown file
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: content };
  }

  const frontmatter = {};
  const frontmatterText = match[1];
  const bodyContent = match[2];

  // Simple frontmatter parsing
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let currentValue = '';

  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      if (currentKey) {
        frontmatter[currentKey] = currentValue.trim();
      }
      currentKey = keyMatch[1];
      currentValue = keyMatch[2];
    } else if (currentKey) {
      currentValue += ' ' + line;
    }
  }

  if (currentKey) {
    frontmatter[currentKey] = currentValue.trim();
  }

  // Clean up quotes from all frontmatter values
  for (const key in frontmatter) {
    if (typeof frontmatter[key] === 'string') {
      // Remove surrounding quotes (both single and double)
      frontmatter[key] = frontmatter[key].replace(/^['"]|['"]$/g, '');
    }
  }

  return { frontmatter, content: bodyContent };
}

/**
 * Call LM Studio local server using OpenAI-compatible API
 */
async function callLMStudio(prompt) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (LM_API_TOKEN) {
    headers['Authorization'] = `Bearer ${LM_API_TOKEN}`;
  }

  const requestBody = {
    model: LM_STUDIO_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an expert at extracting structured information from text, including titles, descriptions, and content. You are pragmatic and work with whatever information is available. Always respond with valid JSON only, no additional text or explanation.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1, // Lower for more consistent JSON
    max_tokens: 3000, // Increased for larger responses
    // Note: response_format not supported by smaller models like liquid/lfm2.5-1.2b
  };

  const response = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`  ❌ API Error Response: ${errorText}`);
    throw new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Extract usage information if available
  const usage = data.usage || {};
  
  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      cost: 0 // Local model, no cost
    }
  };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }

  const requestBody = {
    model: OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an expert at extracting structured information from text, including titles, descriptions, and content. You are pragmatic and work with whatever information is available. You always respond with valid JSON only, with no additional text or explanation.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1,
    max_tokens: 3000, // Increased for larger responses
    response_format: { type: 'json_object' } // OpenAI supports JSON mode
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`  ❌ OpenAI API Error: ${errorText}`);
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Extract usage information
  const usage = data.usage || {};
  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const totalTokens = usage.total_tokens || 0;
  
  // Calculate approximate cost for OpenAI gpt-4o-mini
  // Pricing: $0.150 per 1M input tokens, $0.600 per 1M output tokens
  const inputCost = (promptTokens / 1000000) * 0.150;
  const outputCost = (completionTokens / 1000000) * 0.600;
  const totalCost = inputCost + outputCost;
  
  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
      cost: totalCost
    }
  };
}

/**
 * Call FAL AnyLLM API
 * Note: Uses @fal-ai/client SDK for better compatibility
 */
async function callFAL(prompt) {
  if (!FAL_KEY) {
    throw new Error('FAL_KEY environment variable not set');
  }

  // FAL any-llm expects a simpler prompt format
  const systemPrompt = 'You are an expert at extracting structured information from text, including titles, descriptions, and content. You are pragmatic and work with whatever information is available. You always respond with valid JSON only, with no additional text or explanation.';
  
  const fullPrompt = `${systemPrompt}\n\n${prompt}`;

  const requestBody = {
    prompt: fullPrompt,
    model: FAL_MODEL,
    temperature: 0.1,
    max_tokens: 3000, // Increased for larger responses
    priority: 'throughput' // Use throughput for cost-effectiveness
  };

  const response = await fetch('https://queue.fal.run/fal-ai/any-llm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${FAL_KEY}`
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`  ❌ FAL API Error: ${errorText}`);
    throw new Error(`FAL API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // FAL returns {output: "text", partial: bool, error?: string}
  if (data.error) {
    throw new Error(`FAL API error: ${data.error}`);
  }
  
  if (data.output) {
    // FAL doesn't always return usage stats, estimate based on model
    // Approximate cost for meta-llama/llama-3.1-70b-instruct: ~$0.50-0.80 per 1M tokens
    const estimatedTokens = Math.ceil((fullPrompt.length + data.output.length) / 4); // rough estimate
    
    return {
      content: data.output,
      usage: {
        promptTokens: Math.ceil(fullPrompt.length / 4),
        completionTokens: Math.ceil(data.output.length / 4),
        totalTokens: estimatedTokens,
        cost: (estimatedTokens / 1000000) * 0.65 // Estimated cost
      }
    };
  }
  
  // Fallback to other possible formats
  console.error('  ⚠️  Unexpected FAL response structure:');
  console.error(JSON.stringify(data, null, 2));
  throw new Error('FAL API returned unexpected response format. Expected data.output');
}

/**
 * Call AI provider (LM Studio, OpenAI, or FAL)
 */
async function callAI(prompt) {
  if (AI_PROVIDER === 'openai') {
    return await callOpenAI(prompt);
  } else if (AI_PROVIDER === 'fal') {
    return await callFAL(prompt);
  } else {
    return await callLMStudio(prompt);
  }
}

/**
 * Load portfolio companies from JSON files
 */
async function loadPortfolioCompanies() {
  const portfolioFiles = await fs.readdir(PORTFOLIO_DIR);
  const companies = new Set();
  
  for (const file of portfolioFiles) {
    if (file.endsWith('.json')) {
      const filePath = path.join(PORTFOLIO_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const companies_list = JSON.parse(content);
      
      for (const company of companies_list) {
        companies.add(company.name);
      }
    }
  }
  
  return Array.from(companies);
}

/**
 * Known investor/VC firms (should not be classified as companies)
 */
const KNOWN_INVESTORS = new Set([
  'Bessemer Venture Partners',
  'Sequoia',
  'Kleiner Perkins',
  'Spark Capital',
  'Footwork',
  'Fifty Years',
  'Basis Set',
  'Mythos',
  'Lowercarbon Capital',
  'Costanoa Ventures',
  'Preston-Werner Ventures',
  'Backtrace Capital',
  'Mouro Capital',
  'Raise Seed For Good',
  'Speedinvest',
  'Precursor Ventures',
  'First Round Capital',
  'Unusual Ventures',
  'Village Global',
  'Meritech',
  'Salesforce Ventures',
  'Shopify Ventures',
  'Google AI Futures Fund',
  'Kindred Ventures',
  'Notable Capital',
  'a16z',
  'Andreessen Horowitz',
  'GGV',
  'GGV Capital',
]);

/**
 * Extract entities from a single post using AI
 */
async function extractEntitiesFromPost(slug, title, content, frontmatter = {}, portfolioCompanies = []) {
  try {
    console.log(`📄 Processing: ${title}`);

    // Convert markdown to plain text for better processing
    const plainText = marked.parse(content, { async: false });
    let textContent = plainText.replace(/<[^>]*>/g, ' ').trim();
    
    const description = frontmatter.description || '';
    const tags = frontmatter.tags || [];
    const author = frontmatter.author || '';
    const url = frontmatter.url || '';
    const pubDate = frontmatter.pubDate || frontmatter.updatedDate || '';
    
    // Build rich context from all available frontmatter
    let contextParts = [`Title: ${title}`];
    
    if (description) {
      contextParts.push(`Description: ${description}`);
    }
    
    if (pubDate) {
      contextParts.push(`Published: ${pubDate}`);
    }
    
    if (author) {
      contextParts.push(`Author: ${author}`);
    }
    
    if (tags && tags.length > 0) {
      const tagsList = Array.isArray(tags) ? tags.join(', ') : tags;
      contextParts.push(`Tags: ${tagsList}`);
    }
    
    if (url) {
      contextParts.push(`Source: ${url}`);
    }
    
    // If content is very short/empty, use rich context
    if (textContent.length < 100) {
      textContent = contextParts.join('\n\n');
    } else {
      // Prepend context to content for better extraction
      textContent = contextParts.join('\n\n') + '\n\n---\n\nContent:\n' + textContent;
    }
    
    // Limit to 8000 chars for better context (balance between API efficiency and accuracy)
    textContent = textContent.substring(0, 8000);

    // Build portfolio companies context (as a reference, not to extract)
    const portfolioContext = portfolioCompanies.length > 0 
      ? `\n\n────────────────────────────────────────────────────────────\nREFERENCE: KNOWN PORTFOLIO COMPANIES (for classification only - DO NOT extract unless actually mentioned in content above):\n${portfolioCompanies.join(', ')}\n────────────────────────────────────────────────────────────`
      : '';

    // More pragmatic prompt - extract what we can from available information
    const prompt = `Extract structured information from this blog post. Use ALL available information including title, description, tags, author, and content. Be pragmatic - extract what you can find.

AVAILABLE INFORMATION:
${textContent}${portfolioContext}

────────────────────────────────────────────────────────────

Extract the following information. Be pragmatic - work with what you have, even if it's just a title or brief description:

1. COMPANIES (Product/Service Companies - NOT Investors/VCs)
   • **CRITICAL**: ONLY extract companies that are ACTUALLY MENTIONED in the content above
   • **DO NOT** extract companies just because they appear in the Portfolio Companies reference list
   • The Portfolio Companies list is for CLASSIFICATION HELP ONLY - to identify if a mentioned entity is a company
   • Include: Companies explicitly mentioned in title, description, tags, content, or source URL
   • **EXCLUDE**: Investor/VC firms like Sequoia, Kleiner Perkins, a16z, Bessemer, First Round, Spark Capital, etc.
   • **EXCLUDE**: If author field is a company name (like "Aalo", "fal"), do NOT add it to companies
   • Exclude: open-source projects (Git, Linux), programming languages (JavaScript), frameworks (React)
   • Example: If the title says "Aalo Closes $100M", extract "Aalo". If the content doesn't mention a company, don't extract it.

2. INVESTORS (Venture Capital Firms & Investment Entities)
   • **NEW ENTITY TYPE**: Extract VC firms, investment funds, and investors mentioned
   • Include: Sequoia, Kleiner Perkins, a16z, Bessemer Venture Partners, First Round Capital, etc.
   • Include: Corporate venture arms like Salesforce Ventures, Shopify Ventures, Google AI Futures Fund
   • Include: Individual investors if named (with role "Investor")
   • Look for: funding announcements, "led by X", "participated by Y", investor lists
   • Examples: ["Sequoia", "First Round Capital", "Tom Preston-Werner"]

3. PEOPLE (Individuals - NOT Companies)
   • **CRITICAL**: Only extract real people's names, NOT company names
   • **EXCLUDE**: If author field is a company/brand name (like "Aalo", "fal", "Cursor Team", "Liquid AI"), do NOT extract as person
   • People mentioned by name (full name preferred, but first name acceptable if clearly a person)
   • Include their role/title if mentioned
   • Look in: title, author field (ONLY if it's a person's name), description, content
   • Examples: {"name": "Tom Preston-Werner", "role": "Co-founder"} or {"name": "Ralf", "role": "Author"}
   • If just first names appear (like "Ralf and Jan"), extract them ONLY if they're clearly people
   • Check: Is the author a person's name or a company brand? Only extract if it's a person.

4. FACTS
   • Key statements, insights, or announcements
   • Categories: "insight", "trend", "philosophy", "announcement", "milestone", "funding", "launch", "partnership"
   • **PRIORITIZE**: Fundraising, product launches, and partnerships - these are critical business events!
   • Examples:
     - "Aalo closed $100M Series B" → {"text": "Aalo raised $100M in Series B funding", "category": "funding", "date": "2025-08-19"}
     - "Launches new AI platform" → {"text": "Company launched new AI platform", "category": "launch", "date": "2025-09-15"}
     - "Partners with Google" → {"text": "Company partnered with Google", "category": "partnership", "date": "2025-12-04"}
     - Acquisitions, milestones, strategic announcements
   • **Extract from title and description** - external posts often have the key news in metadata!
   • **IMPORTANT**: Include the "date" field using the Published date from the frontmatter above
   • The date makes facts useful for timeline views and chronological analysis

5. FIGURES
   • Numbers with context: funding amounts, metrics, percentages
   • Format: {"value": "100M", "context": "Series B funding", "unit": "USD"}
   • Extract from titles like "Closes $100M Series B"

6. TOPICS
   • Main themes: ["AI", "Funding", "Compliance", "Developer Tools", "Infrastructure"]
   • **IMPORTANT: Use the Tags field as primary source for topics!**
   • Tags like ["myriad", "regulatory compliance", "AI compliance"] → extract as topics
   • Also infer from title, description, and content
   • Normalize tag names (e.g., "regtech" → "Regulatory Technology")

7. QUOTES
   • **NEW**: Memorable, insightful quotes from the content
   • Include the speaker (person or company name) and optional context
   • Examples:
     - {"quote": "Iteration is the new product moat", "speaker": "Tony Holdstock-Brown", "context": "On product development"}
     - {"quote": "We invest because we want to be invested", "speaker": "David Thyresson", "context": "On investing philosophy"}
     - {"quote": "Let the band play", "speaker": "Tom Preston-Werner", "context": "On giving founders space"}
   • Look for: Direct quotes, key philosophies, memorable statements
   • Speaker can be a person's name OR a company name (if it's a company blog post)
   • Context is optional but helpful

────────────────────────────────────────────────────────────

CRITICAL RULES:
• **ONLY extract entities ACTUALLY MENTIONED in the content** - DO NOT extract from the reference lists
• **Portfolio Companies list is for REFERENCE ONLY** - use it to classify entities, not to extract them
• **Companies vs Investors**: Investor/VC firms go in "investors", NOT "companies"
• **Companies vs People**: Company names as authors (like "Aalo", "fal") go in "companies", NOT "people"
• Extract what you CAN find - titles, descriptions, tags, author, and source URLs all contain valuable info!
• **Tags are gold** - use them for topics and company hints
• If title says "Company X raises $YM from Investor Y", extract X as company, Y as investor
• Source URLs often contain company names (e.g., "myriad.company" → extract "Myriad")
• Empty arrays are fine for categories with no information
• Be practical, not overly strict

Return ONLY valid JSON with this exact structure:
{
  "companies": ["Company 1", "Company 2", ...] or [],
  "investors": ["Investor 1", "Investor 2", ...] or [],
  "people": [{"name": "First Last", "role": "Their Role"}, ...] or [],
  "facts": [{"text": "A fact", "category": "funding", "date": "2025-08-19"}, ...] or [],
  "figures": [{"value": "100M", "context": "What it means", "unit": "USD"}, ...] or [],
  "topics": ["Topic 1", "Topic 2", ...] or [],
  "quotes": [{"quote": "The quote text", "speaker": "Person or Company Name", "context": "Optional context"}, ...] or []
}

NOTES ON FACTS:
- **ALWAYS include "date" field** - use the "Published" date from the frontmatter above
- For funding/launch/partnership facts, the date is CRITICAL for timeline views
- Date format: Use exact date from "Published" field (e.g., "2025-08-19")
- This allows chronological sorting and timeline visualization`;

    if (AI_PROVIDER === 'openai') {
      console.log(`  Calling OpenAI API...`);
      console.log(`  Using model: ${OPENAI_MODEL}`);
    } else if (AI_PROVIDER === 'fal') {
      console.log(`  Calling FAL AnyLLM API...`);
      console.log(`  Using model: ${FAL_MODEL}`);
    } else {
      console.log(`  Calling LM Studio API at ${LM_STUDIO_URL}...`);
      console.log(`  Using model: ${LM_STUDIO_MODEL}`);
    }

    const startTime = Date.now();
    const response = await callAI(prompt);
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Clean and parse JSON
    let cleanedJson = response.content.trim();
    
    // Remove markdown code blocks if present
    cleanedJson = cleanedJson.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // Try to find JSON in the response
    const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedJson = jsonMatch[0];
    }

    const entities = JSON.parse(cleanedJson);
    
    // Basic validation to ensure data matches schema requirements
    // Filter out known investors from companies list
    // Filter out company names that appear as authors from people list
    const normalized = {
      companies: Array.isArray(entities.companies) 
        ? entities.companies
            .filter(c => c && typeof c === 'string' && c.trim())
            .filter(c => !KNOWN_INVESTORS.has(c)) // Exclude known investors
        : [],
      investors: Array.isArray(entities.investors) 
        ? entities.investors.filter(i => i && typeof i === 'string' && i.trim())
        : [],
      people: Array.isArray(entities.people) 
        ? entities.people
            .filter(p => p && typeof p === 'object' && p.name)
            .map(p => ({
              name: String(p.name || '').trim(),
              role: String(p.role || 'Unknown').trim()
            }))
            .filter(p => p.name)
            // Exclude if name matches a known company or the author field is a company
            .filter(p => {
              // Check if it's likely a company name (all caps, contains "AI", "Labs", etc.)
              const isLikelyCompany = /^[A-Z][a-z]*\s*(AI|Labs|Studios|Team|Teams)$/.test(p.name);
              // Check if it matches portfolio companies
              const isPortfolioCompany = portfolioCompanies.some(
                pc => pc.toLowerCase() === p.name.toLowerCase()
              );
              return !isLikelyCompany && !isPortfolioCompany;
            })
        : [],
      facts: Array.isArray(entities.facts)
        ? entities.facts
            .filter(f => f && typeof f === 'object' && f.text)
            .map(f => {
              const validCategories = ['insight', 'trend', 'philosophy', 'announcement', 'milestone', 'funding', 'launch', 'partnership'];
              const category = validCategories.includes(f.category) ? f.category : 'insight';
              return {
                text: String(f.text || '').trim(),
                category: category,
                date: f.date ? String(f.date).trim() : undefined
              };
            })
            .filter(f => f.text)
        : [],
      figures: Array.isArray(entities.figures)
        ? entities.figures
            .filter(f => f && typeof f === 'object' && f.value && f.context)
            .map(f => ({
              value: String(f.value || '').trim(),
              context: String(f.context || '').trim(),
              unit: String(f.unit || '').trim()
            }))
            .filter(f => f.value && f.context)
        : [],
      topics: Array.isArray(entities.topics) 
        ? entities.topics.filter(t => t && typeof t === 'string' && t.trim())
        : [],
      quotes: Array.isArray(entities.quotes)
        ? entities.quotes
            .filter(q => q && typeof q === 'object' && q.quote && q.speaker)
            .map(q => ({
              quote: String(q.quote || '').trim(),
              speaker: String(q.speaker || '').trim(),
              context: q.context ? String(q.context).trim() : undefined
            }))
            .filter(q => q.quote && q.speaker)
        : []
    };
    
    // Log extraction results with timing and cost
    const costStr = response.usage.cost > 0 
      ? ` ($${response.usage.cost.toFixed(4)})` 
      : '';
    const tokensStr = response.usage.totalTokens > 0 
      ? ` [${response.usage.totalTokens} tokens]` 
      : '';
    
    console.log(`  ✅ Extracted: ${normalized.companies.length} companies, ${normalized.investors.length} investors, ${normalized.people.length} people, ${normalized.facts.length} facts, ${normalized.quotes.length} quotes`);
    
    // Log actual extracted entities for visibility
    if (normalized.companies.length > 0) {
      console.log(`     Companies: ${normalized.companies.join(', ')}`);
    }
    if (normalized.investors.length > 0) {
      console.log(`     Investors: ${normalized.investors.join(', ')}`);
    }
    if (normalized.people.length > 0) {
      const peopleNames = normalized.people.map(p => typeof p === 'string' ? p : p.name);
      console.log(`     People: ${peopleNames.join(', ')}`);
    }
    if (normalized.quotes.length > 0) {
      console.log(`     Quotes:`);
      normalized.quotes.forEach((q, i) => {
        const preview = q.quote.length > 60 ? q.quote.substring(0, 60) + '...' : q.quote;
        console.log(`       ${i + 1}. "${preview}" — ${q.speaker}`);
      });
    }
    
    console.log(`  ⏱️  Time: ${elapsedTime}s${tokensStr}${costStr}`);

    return {
      ...normalized,
      _meta: {
        elapsedTime: parseFloat(elapsedTime),
        usage: response.usage
      }
    };
  } catch (error) {
    console.error(`  ❌ Error extracting entities: ${error.message}`);
    if (error.message.includes('fetch')) {
      console.error(`  💡 Make sure LM Studio is running: lms server start --port 1234`);
      console.error(`  💡 And the model is loaded: ${LM_STUDIO_MODEL}`);
    }
    return {
      companies: [],
      investors: [],
      people: [],
      facts: [],
      figures: [],
      topics: [],
      quotes: [],
    };
  }
}

/**
 * Process all posts and extract entities
 * @param {number|null} limit - Optional limit on number of posts to process
 * @param {string|null} file - Optional specific file to process
 * @param {boolean} force - If true, re-extract even if entity files exist
 */
async function processAllPosts(limit = null, file = null, force = false) {
  console.log('🚀 Starting entity extraction from blog posts...\n');

  // Load portfolio companies
  console.log('📋 Loading portfolio companies...');
  const portfolioCompanies = await loadPortfolioCompanies();
  console.log(`✅ Loaded ${portfolioCompanies.length} portfolio companies\n`);

  // Ensure output directories exist
  await fs.mkdir(ENTITIES_DIR, { recursive: true });
  await fs.mkdir(POSTS_OUTPUT_DIR, { recursive: true });

  // Read all post files
  const files = await fs.readdir(POSTS_DIR);
  let postFiles = files.filter(
    (f) => f.endsWith('.md') || f.endsWith('.mdx')
  );

  // Apply file filter if specified
  if (file) {
    const matchingFile = postFiles.find(f => f === file);
    if (!matchingFile) {
      console.error(`❌ File "${file}" not found in ${POSTS_DIR}`);
      console.error(`Available files: ${postFiles.slice(0, 5).join(', ')}${postFiles.length > 5 ? '...' : ''}`);
      process.exit(1);
    }
    postFiles = [matchingFile];
    console.log(`📄 Processing specific file: ${file}\n`);
  } else if (limit && limit > 0) {
    // Apply limit if specified (and no specific file)
    postFiles = postFiles.slice(0, limit);
    console.log(`Found ${files.filter(f => f.endsWith('.md') || f.endsWith('.mdx')).length} total posts`);
    console.log(`⚡ Processing first ${postFiles.length} post(s) (--limit ${limit})\n`);
  } else {
    console.log(`Found ${postFiles.length} posts to process\n`);
  }
  
  // Filter out posts that already have entity files (unless force is true)
  if (!force) {
    const postsToProcess = [];
    const skippedPosts = [];
    
    for (const postFile of postFiles) {
      const slug = postFile.replace(/\.(md|mdx)$/, '');
      const entityFilePath = path.join(POSTS_OUTPUT_DIR, `${slug}.json`);
      
      try {
        await fs.access(entityFilePath);
        // File exists, skip it
        skippedPosts.push(postFile);
      } catch {
        // File doesn't exist, process it
        postsToProcess.push(postFile);
      }
    }
    
    if (skippedPosts.length > 0) {
      console.log(`⏭️  Skipping ${skippedPosts.length} post(s) with existing entity files`);
      if (postsToProcess.length === 0) {
        console.log(`✨ All posts already extracted! Use --force to re-extract.\n`);
        return;
      }
      console.log(`🔄 Processing ${postsToProcess.length} new/missing post(s)\n`);
    }
    
    postFiles = postsToProcess;
  }

  const results = {
    posts: {},
    entities: {
      companies: {},
      investors: {},
      people: {},
      topics: {},
      quotes: [], // Array of all quotes with post references
    },
    metadata: {
      extractedAt: new Date().toISOString(),
      totalPosts: postFiles.length,
    },
  };
  
  // Track cumulative costs, timing, and dates
  let totalCost = 0;
  let totalTime = 0;
  let totalTokens = 0;
  let oldestDate = null;
  let newestDate = null;

  // Process each post
  for (let i = 0; i < postFiles.length; i++) {
    const file = postFiles[i];
    const filePath = path.join(POSTS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const { frontmatter, content: bodyContent } = parseFrontmatter(content);

    // Generate slug from full filename (without extension)
    // This ensures the slug matches exactly with Astro's routing
    // Note: Astro's trailingSlash: 'always' config handles the trailing slash in URLs
    const slug = file.replace(/\.(md|mdx)$/, '');
    const title =
      frontmatter.title?.replace(/['"]/g, '') || slug.replace(/-/g, ' ');
    
    console.log(`\n[${i + 1}/${postFiles.length}] 📝 ${slug}`);

    // Extract entities using AI (pass frontmatter and portfolio companies for rich context)
    const entities = await extractEntitiesFromPost(slug, title, bodyContent, frontmatter, portfolioCompanies);

    if (entities) {
      // Track cumulative stats
      if (entities._meta) {
        totalCost += entities._meta.usage.cost || 0;
        totalTime += entities._meta.elapsedTime || 0;
        totalTokens += entities._meta.usage.totalTokens || 0;
      }
      
      // Store per-post data with useful frontmatter (exclude _meta from stored data)
      const cleanAuthor = frontmatter.author?.replace(/^['"]|['"]$/g, '') || '';
      const tags = frontmatter.tags || [];
      const url = frontmatter.url || '';
      const pubDate = frontmatter.pubDate || frontmatter.updatedDate || null;
      
      // Track date range for metadata
      if (pubDate) {
        const postDate = new Date(pubDate);
        if (!isNaN(postDate.getTime())) {
          if (!oldestDate || postDate < oldestDate) {
            oldestDate = postDate;
          }
          if (!newestDate || postDate > newestDate) {
            newestDate = postDate;
          }
        }
      }
      
      const { _meta, ...entityData } = entities; // Remove _meta before storing
      
      const postData = {
        slug,
        title,
        ...entityData,
        pubDate: pubDate,
        author: cleanAuthor,
        tags: Array.isArray(tags) ? tags : [],
        url: url,
      };
      
      results.posts[slug] = postData;
      
      // Write individual post file immediately (progressive save)
      const postFilePath = path.join(POSTS_OUTPUT_DIR, `${slug}.json`);
      await fs.writeFile(postFilePath, JSON.stringify(postData, null, 2), 'utf-8');
      console.log(`  💾 Saved: ${slug}.json`);

      // Aggregate company data
      entities.companies?.forEach((company) => {
        if (!results.entities.companies[company]) {
          results.entities.companies[company] = {
            posts: [],
            mentions: 0,
          };
        }
        results.entities.companies[company].posts.push(slug);
        results.entities.companies[company].mentions++;
      });

      // Aggregate investor data
      entities.investors?.forEach((investor) => {
        if (!results.entities.investors[investor]) {
          results.entities.investors[investor] = {
            posts: [],
            mentions: 0,
          };
        }
        results.entities.investors[investor].posts.push(slug);
        results.entities.investors[investor].mentions++;
      });

      // Aggregate people data
      entities.people?.forEach((person) => {
        const name = typeof person === 'string' ? person : person.name;
        const role = typeof person === 'object' ? person.role : null;

        if (!results.entities.people[name]) {
          results.entities.people[name] = {
            posts: [],
            mentions: 0,
            role: role,
          };
        }
        results.entities.people[name].posts.push(slug);
        results.entities.people[name].mentions++;
        if (role && !results.entities.people[name].role) {
          results.entities.people[name].role = role;
        }
      });

      // Aggregate topics
      entities.topics?.forEach((topic) => {
        if (!results.entities.topics[topic]) {
          results.entities.topics[topic] = {
            posts: [],
            mentions: 0,
          };
        }
        results.entities.topics[topic].posts.push(slug);
        results.entities.topics[topic].mentions++;
      });

      // Aggregate quotes (store all quotes with post reference)
      entities.quotes?.forEach((quoteObj) => {
        results.entities.quotes.push({
          ...quoteObj,
          postSlug: slug,
          postTitle: title,
          pubDate: pubDate || null
        });
      });
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Directories already created at start of processAllPosts

  // Validate that all referenced posts exist
  console.log('\n🔍 Validating post references...');
  const allPostSlugs = new Set(Object.keys(results.posts));
  let invalidReferences = 0;
  
  for (const [companyName, companyData] of Object.entries(results.entities.companies)) {
    for (const postSlug of companyData.posts) {
      if (!allPostSlugs.has(postSlug)) {
        console.warn(`  ⚠️  Invalid post reference: ${postSlug} (in company: ${companyName})`);
        invalidReferences++;
      }
    }
  }
  
  for (const [investorName, investorData] of Object.entries(results.entities.investors)) {
    for (const postSlug of investorData.posts) {
      if (!allPostSlugs.has(postSlug)) {
        console.warn(`  ⚠️  Invalid post reference: ${postSlug} (in investor: ${investorName})`);
        invalidReferences++;
      }
    }
  }
  
  for (const [personName, personData] of Object.entries(results.entities.people)) {
    for (const postSlug of personData.posts) {
      if (!allPostSlugs.has(postSlug)) {
        console.warn(`  ⚠️  Invalid post reference: ${postSlug} (in person: ${personName})`);
        invalidReferences++;
      }
    }
  }
  
  for (const [topicName, topicData] of Object.entries(results.entities.topics)) {
    for (const postSlug of topicData.posts) {
      if (!allPostSlugs.has(postSlug)) {
        console.warn(`  ⚠️  Invalid post reference: ${postSlug} (in topic: ${topicName})`);
        invalidReferences++;
      }
    }
  }
  
  if (invalidReferences === 0) {
    console.log('  ✅ All post references are valid!');
  } else {
    console.warn(`  ⚠️  Found ${invalidReferences} invalid post reference(s)`);
  }

  // Add date range to metadata
  if (oldestDate && newestDate) {
    results.metadata.dateRange = {
      oldest: oldestDate.toISOString().split('T')[0],
      newest: newestDate.toISOString().split('T')[0],
    };
  }

  // Note: Aggregated data is no longer saved to a file
  // Collections are built from individual post files at build time

  console.log('\n✅ Entity extraction complete!');
  console.log(`📊 Results:`);
  console.log(`   Posts processed: ${postFiles.length}`);
  console.log(
    `   Companies found: ${Object.keys(results.entities.companies).length}`
  );
  console.log(
    `   Investors found: ${Object.keys(results.entities.investors).length}`
  );
  console.log(
    `   People found: ${Object.keys(results.entities.people).length}`
  );
  console.log(
    `   Topics found: ${Object.keys(results.entities.topics).length}`
  );
  console.log(
    `   Quotes found: ${results.entities.quotes.length}`
  );
  
  // Display timing and cost summary
  if (totalTokens > 0 || totalCost > 0) {
    console.log(`\n⏱️  Performance:`);
    console.log(`   Total time: ${totalTime.toFixed(2)}s`);
    console.log(`   Avg time per post: ${(totalTime / postFiles.length).toFixed(2)}s`);
    if (totalTokens > 0) {
      console.log(`   Total tokens: ${totalTokens.toLocaleString()}`);
      console.log(`   Avg tokens per post: ${Math.round(totalTokens / postFiles.length).toLocaleString()}`);
    }
    if (totalCost > 0) {
      console.log(`\n💰 Cost:`);
      console.log(`   Total cost: $${totalCost.toFixed(4)}`);
      console.log(`   Avg cost per post: $${(totalCost / postFiles.length).toFixed(4)}`);
    }
  }
  
  console.log(`\n💾 Saved:`);
  console.log(`   Individual files: ${POSTS_OUTPUT_DIR}/`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let limit = null;
  let file = null;
  let force = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      if (isNaN(limit) || limit <= 0) {
        console.error('❌ --limit must be a positive number');
        process.exit(1);
      }
      i++; // Skip the next arg since we used it
    } else if (args[i] === '--file' && args[i + 1]) {
      file = args[i + 1];
      i++; // Skip the next arg since we used it
    } else if (args[i] === '--force') {
      force = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
PWV Entity Extraction Script

Usage:
  node scripts/extract-entities.js [options]

Options:
  --limit <number>   Process only the first N posts (for testing)
  --file <filename>  Process only a specific post file (e.g., post-why-dt-invests.md)
  --force            Re-extract all posts, even if entity files already exist
  --help, -h         Show this help message

Examples:
  node scripts/extract-entities.js                              # Process only new posts
  node scripts/extract-entities.js --force                      # Re-extract all posts
  node scripts/extract-entities.js --limit 5                    # Process only 5 new posts
  node scripts/extract-entities.js --limit 5 --force            # Re-extract 5 posts
  node scripts/extract-entities.js --file post-why-dt-invests.md  # Process specific file if needed
  node scripts/extract-entities.js --file post-why-dt-invests.md --force  # Force re-extract specific file

Environment Variables (AI Provider):
  AI_PROVIDER        'lmstudio', 'openai', or 'fal' (default: lmstudio)
  
  For LM Studio:
    LM_STUDIO_URL    LM Studio server URL (default: http://localhost:1234)
    LM_STUDIO_MODEL  Model to use (default: liquid/lfm2.5-1.2b)
    LM_API_TOKEN     Optional API token
  
  For OpenAI:
    OPENAI_API_KEY   Your OpenAI API key (required)
    OPENAI_MODEL     Model to use (default: gpt-4o-mini)
  
  For FAL AnyLLM:
    FAL_KEY          Your FAL API key (required)
    FAL_MODEL        Model to use (default: meta-llama/llama-3.1-70b-instruct)
      
Recommended setups:
  # OpenAI (easy, cost-effective)
  export AI_PROVIDER=openai
  export OPENAI_API_KEY=sk-...
  export OPENAI_MODEL=gpt-4o-mini
  
  # FAL (easy, cost-effective, powerful)
  export AI_PROVIDER=fal
  export FAL_KEY=your-fal-key
  export FAL_MODEL=meta-llama/Llama-3.3-70B-Instruct
  
  node scripts/extract-entities.js --limit 3
      `);
      process.exit(0);
    }
  }
  
  return { limit, file, force };
}

// Main execution
async function main() {
  const { limit, file, force } = parseArgs();
  
  console.log('🚀 PWV Entity Extraction Script');
  console.log(`🤖 AI Provider: ${AI_PROVIDER.toUpperCase()}`);
  
  if (AI_PROVIDER === 'openai') {
    console.log(`📡 Model: ${OPENAI_MODEL}`);
    if (!OPENAI_API_KEY) {
      console.error('\n❌ Error: OPENAI_API_KEY environment variable not set');
      console.error('   Set it with: export OPENAI_API_KEY=sk-your-key-here\n');
      process.exit(1);
    }
  } else if (AI_PROVIDER === 'fal') {
    console.log(`📡 Model: ${FAL_MODEL}`);
    if (!FAL_KEY) {
      console.error('\n❌ Error: FAL_KEY environment variable not set');
      console.error('   Set it with: export FAL_KEY=your-fal-key-here');
      console.error('   Get your key at: https://fal.ai/dashboard/keys\n');
      process.exit(1);
    }
  } else {
    console.log(`📍 LM Studio URL: ${LM_STUDIO_URL}`);
    console.log(`📡 Model: ${LM_STUDIO_MODEL}`);
  }
  
  if (file) {
    console.log(`📄 File: Processing specific file "${file}"`);
  } else if (limit) {
    console.log(`🔢 Limit: Processing first ${limit} post(s) only`);
  }
  
  if (force) {
    console.log(`⚡ Force: Re-extracting posts even if entity files exist`);
  } else {
    console.log(`✨ Smart mode: Skipping posts with existing entity files (use --force to override)`);
  }
  console.log('');

  // Test connection (LM Studio only, OpenAI and FAL will test on first request)
  if (AI_PROVIDER === 'lmstudio') {
    try {
      console.log('🔍 Testing LM Studio connection...');
      const testResponse = await fetch(`${LM_STUDIO_URL}/v1/models`);
      if (!testResponse.ok) {
        throw new Error(`Cannot connect to LM Studio at ${LM_STUDIO_URL}`);
      }
      const models = await testResponse.json();
      console.log(`✅ Connected! Found ${models.data?.length || 0} model(s) loaded`);
      
      // Check if our model is loaded
      const modelLoaded = models.data?.some(m => m.id === LM_STUDIO_MODEL);
      if (!modelLoaded) {
        console.warn(`⚠️  Model "${LM_STUDIO_MODEL}" not loaded in LM Studio`);
        console.warn('   Load it in LM Studio or set LM_STUDIO_MODEL env var');
      }
      console.log('');
    } catch (error) {
      console.error('❌ Cannot connect to LM Studio');
      console.error(`   Error: ${error.message}`);
      console.error('');
      console.error('💡 To fix this:');
      console.error('   1. Install LM Studio: https://lmstudio.ai');
      console.error('   2. Start the server: lms server start --port 1234');
      console.error('   3. Load a model');
      console.error('');
      console.error('   Or switch to OpenAI: export AI_PROVIDER=openai');
      console.error('   Or switch to FAL: export AI_PROVIDER=fal');
      process.exit(1);
    }
  } else if (AI_PROVIDER === 'openai') {
    console.log('✅ Using OpenAI - will test connection on first request\n');
  } else if (AI_PROVIDER === 'fal') {
    console.log('✅ Using FAL AnyLLM - will test connection on first request\n');
  }

  try {
    await processAllPosts(limit, file, force);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
