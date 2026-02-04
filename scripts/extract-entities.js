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
const OUTPUT_FILE = path.join(__dirname, '../src/data/extracted-entities.json');

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
    max_tokens: 2000,
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
  return data.choices[0].message.content;
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
    max_tokens: 2000,
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
  return data.choices[0].message.content;
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
    max_tokens: 2000,
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
    return data.output;
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
 * Extract entities from a single post using AI
 */
async function extractEntitiesFromPost(slug, title, content, frontmatter = {}) {
  try {
    console.log(`\n📄 Processing: ${title}`);

    // Convert markdown to plain text for better processing
    const plainText = marked.parse(content, { async: false });
    let textContent = plainText.replace(/<[^>]*>/g, ' ').trim();
    
    const description = frontmatter.description || '';
    const tags = frontmatter.tags || [];
    const author = frontmatter.author || '';
    const url = frontmatter.url || '';
    
    // Build rich context from all available frontmatter
    let contextParts = [`Title: ${title}`];
    
    if (description) {
      contextParts.push(`Description: ${description}`);
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
    
    // Limit to 3500 chars for API efficiency (increased to accommodate frontmatter)
    textContent = textContent.substring(0, 3500);

    // More pragmatic prompt - extract what we can from available information
    const prompt = `Extract structured information from this blog post. Use ALL available information including title, description, tags, author, and content. Be pragmatic - extract what you can find.

AVAILABLE INFORMATION:
${textContent}

────────────────────────────────────────────────────────────

Extract the following information. Be pragmatic - work with what you have, even if it's just a title or brief description:

1. COMPANIES
   • Business organizations, startups, or corporations mentioned
   • Include: Anysphere, Railway, Cursor, OpenAI, Myriad, Aalo, etc.
   • Exclude: open-source projects (Git, Linux), programming languages (JavaScript), frameworks (React)
   • Look in: title, description, tags, content, source URL
   • If the title mentions a company (e.g., "Aalo Closes $100M"), extract it!

2. PEOPLE
   • People mentioned by name (full name preferred, but first name acceptable if that's all we have)
   • Include their role/title if mentioned
   • Look in: title, author field, description, content
   • Examples: {"name": "Tom Preston-Werner", "role": "Co-founder"} or {"name": "Ralf", "role": "Author"}
   • If just first names appear (like "Ralf and Jan"), extract them with role "Author" or "Founder"
   • The Author field is valuable - if "Author: John Smith" appears, extract that person!

3. FACTS
   • Key statements, insights, or announcements
   • Categories: "insight", "trend", "philosophy", "announcement", "milestone"
   • Examples:
     - "Aalo closed $100M Series B" → {"text": "Aalo raised $100M in Series B funding", "category": "announcement"}
     - Funding announcements, product launches, company milestones
   • Extract from title, description, and tags if that's where the news is!

4. FIGURES
   • Numbers with context: funding amounts, metrics, percentages
   • Format: {"value": "100M", "context": "Series B funding", "unit": "USD"}
   • Extract from titles like "Closes $100M Series B"

5. TOPICS
   • Main themes: ["AI", "Funding", "Compliance", "Developer Tools", "Infrastructure"]
   • **IMPORTANT: Use the Tags field as primary source for topics!**
   • Tags like ["myriad", "regulatory compliance", "AI compliance"] → extract as topics
   • Also infer from title, description, and content
   • Normalize tag names (e.g., "regtech" → "Regulatory Technology")

────────────────────────────────────────────────────────────

PRAGMATIC RULES:
• Extract what you CAN find - titles, descriptions, tags, author, and source URLs all contain valuable info!
• **Tags are gold** - use them for topics and company hints
• **Author field** - extract the author as a person with role "Author"
• If only first names given, that's okay - extract them
• If title says "Company X raises $YM", extract the company, figure, and announcement
• Source URLs often contain company names (e.g., "myriad.company" → extract "Myriad")
• Empty arrays are fine for categories with no information
• Be practical, not overly strict

Return ONLY valid JSON with this exact structure:
{
  "companies": ["Company 1", "Company 2", ...] or [],
  "people": [{"name": "First Last", "role": "Their Role"}, ...] or [],
  "facts": [{"text": "A fact", "category": "insight"}, ...] or [],
  "figures": [{"value": "100M", "context": "What it means", "unit": "USD"}, ...] or [],
  "topics": ["Topic 1", "Topic 2", ...] or []
}`;

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

    const extracted = await callAI(prompt);

    // Clean and parse JSON
    let cleanedJson = extracted.trim();
    
    // Remove markdown code blocks if present
    cleanedJson = cleanedJson.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // Try to find JSON in the response
    const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedJson = jsonMatch[0];
    }

    const entities = JSON.parse(cleanedJson);
    
    // Basic validation to ensure data matches schema requirements
    // Trust the model to extract correctly - no heavy filtering
    const normalized = {
      companies: Array.isArray(entities.companies) 
        ? entities.companies.filter(c => c && typeof c === 'string' && c.trim())
        : [],
      people: Array.isArray(entities.people) 
        ? entities.people
            .filter(p => p && typeof p === 'object' && p.name)
            .map(p => ({
              name: String(p.name || '').trim(),
              role: String(p.role || 'Unknown').trim()
            }))
            .filter(p => p.name)
        : [],
      facts: Array.isArray(entities.facts)
        ? entities.facts
            .filter(f => f && typeof f === 'object' && f.text)
            .map(f => {
              const validCategories = ['insight', 'trend', 'philosophy', 'announcement', 'milestone'];
              const category = validCategories.includes(f.category) ? f.category : 'insight';
              return {
                text: String(f.text || '').trim(),
                category: category
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
        : []
    };
    
    console.log(`  ✅ Extracted: ${normalized.companies.length} companies, ${normalized.people.length} people, ${normalized.facts.length} facts`);

    return normalized;
  } catch (error) {
    console.error(`  ❌ Error extracting entities: ${error.message}`);
    if (error.message.includes('fetch')) {
      console.error(`  💡 Make sure LM Studio is running: lms server start --port 1234`);
      console.error(`  💡 And the model is loaded: ${LM_STUDIO_MODEL}`);
    }
    return {
      companies: [],
      people: [],
      facts: [],
      figures: [],
      topics: [],
    };
  }
}

/**
 * Process all posts and extract entities
 * @param {number|null} limit - Optional limit on number of posts to process
 */
async function processAllPosts(limit = null) {
  console.log('🚀 Starting entity extraction from blog posts...\n');

  // Read all post files
  const files = await fs.readdir(POSTS_DIR);
  let postFiles = files.filter(
    (f) => f.endsWith('.md') || f.endsWith('.mdx')
  );

  // Apply limit if specified
  if (limit && limit > 0) {
    postFiles = postFiles.slice(0, limit);
    console.log(`Found ${files.filter(f => f.endsWith('.md') || f.endsWith('.mdx')).length} total posts`);
    console.log(`⚡ Processing first ${postFiles.length} post(s) (--limit ${limit})\n`);
  } else {
    console.log(`Found ${postFiles.length} posts to process\n`);
  }

  const results = {
    posts: {},
    entities: {
      companies: {},
      people: {},
      topics: {},
    },
    metadata: {
      extractedAt: new Date().toISOString(),
      totalPosts: postFiles.length,
    },
  };

  // Process each post
  for (const file of postFiles) {
    const filePath = path.join(POSTS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const { frontmatter, content: bodyContent } = parseFrontmatter(content);

    // Generate slug from full filename (without extension)
    // This ensures the slug matches exactly with Astro's routing
    // Note: Astro's trailingSlash: 'always' config handles the trailing slash in URLs
    const slug = file.replace(/\.(md|mdx)$/, '');
    const title =
      frontmatter.title?.replace(/['"]/g, '') || slug.replace(/-/g, ' ');
    
    console.log(`  📝 Slug: ${slug}`);

    // Extract entities using AI (pass frontmatter for rich context)
    const entities = await extractEntitiesFromPost(slug, title, bodyContent, frontmatter);

    if (entities) {
      // Store per-post data with useful frontmatter
      const cleanAuthor = frontmatter.author?.replace(/^['"]|['"]$/g, '') || '';
      const tags = frontmatter.tags || [];
      const url = frontmatter.url || '';
      
      results.posts[slug] = {
        title,
        ...entities,
        pubDate: frontmatter.pubDate,
        author: cleanAuthor,
        tags: Array.isArray(tags) ? tags : [],
        url: url,
      };

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
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Create output directory if it doesn't exist
  const outputDir = path.dirname(OUTPUT_FILE);
  await fs.mkdir(outputDir, { recursive: true });

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

  // Write results to file
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n✅ Entity extraction complete!');
  console.log(`📊 Results:`);
  console.log(`   Posts processed: ${postFiles.length}`);
  console.log(
    `   Companies found: ${Object.keys(results.entities.companies).length}`
  );
  console.log(
    `   People found: ${Object.keys(results.entities.people).length}`
  );
  console.log(
    `   Topics found: ${Object.keys(results.entities.topics).length}`
  );
  console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let limit = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      if (isNaN(limit) || limit <= 0) {
        console.error('❌ --limit must be a positive number');
        process.exit(1);
      }
      i++; // Skip the next arg since we used it
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
PWV Entity Extraction Script

Usage:
  node scripts/extract-entities.js [options]

Options:
  --limit <number>   Process only the first N posts (for testing)
  --help, -h         Show this help message

Examples:
  node scripts/extract-entities.js              # Process all posts
  node scripts/extract-entities.js --limit 5    # Process only 5 posts
  node scripts/extract-entities.js --limit 1    # Process just 1 post (quick test)

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
  
  return { limit };
}

// Main execution
async function main() {
  const { limit } = parseArgs();
  
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
  
  if (limit) {
    console.log(`🔢 Limit: Processing first ${limit} post(s) only`);
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
    await processAllPosts(limit);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
