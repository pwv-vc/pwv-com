#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { fal } from '@fal-ai/client';
import dotenv from 'dotenv';
import inquirer from 'inquirer';

// Load environment variables from .env file
dotenv.config();

// Configure FAL AI client
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY,
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONTENT_DIR = path.join(__dirname, '../src/content/posts');
const IMAGES_DIR = path.join(__dirname, '../src/images/posts');

// Available FAL AI Models
const PROMPT_GENERATION_MODELS = [
  {
    name: 'Claude 3.5 Sonnet (Recommended)',
    value: 'anthropic/claude-3.5-sonnet',
  },
  { name: 'Claude 3.5 Haiku (Faster)', value: 'anthropic/claude-3.5-haiku' },
  { name: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-001' },
];

const IMAGE_GENERATION_MODELS = [
  { name: 'Imagen 3 Fast (Recommended)', value: 'fal-ai/imagen3/fast' },
  { name: 'Flux Schnell (Fast)', value: 'fal-ai/flux/schnell' },
];

// FAL AI configuration
// Make sure to set your FAL AI API key as an environment variable:
// export FAL_KEY=your_fal_api_key_here
// Or create a .env file in the project root with:
// FAL_KEY=your_fal_api_key_here

/**
 * Fetch HTML content from a URL
 */
async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;

    protocol
      .get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          resolve(data);
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Download an image from URL and save it locally
 */
async function downloadImage(imageUrl, localPath) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https:') ? https : http;

    protocol
      .get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const fileStream = createWriteStream(localPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });

        fileStream.on('error', (error) => {
          fs.unlink(localPath).catch(() => {}); // Delete the file on error
          reject(error);
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Extract full text content from HTML
 */
function extractTextContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Remove script and style elements
  const scripts = document.querySelectorAll(
    'script, style, nav, header, footer, aside'
  );
  scripts.forEach((el) => el.remove());

  // Get the main content - try different selectors
  const contentSelectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.post-body',
    '.entry-body',
  ];

  let contentElement = null;
  for (const selector of contentSelectors) {
    contentElement = document.querySelector(selector);
    if (contentElement) break;
  }

  // If no specific content element found, use body
  if (!contentElement) {
    contentElement = document.body;
  }

  // Extract text content
  let textContent = contentElement
    ? contentElement.textContent
    : document.body.textContent;

  // Clean up the text
  textContent = textContent
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();

  // Limit to reasonable length (first 2000 characters should be enough for prompt generation)
  return textContent.substring(0, 2000);
}

/**
 * Interactive CLI to select models
 */
async function selectModels() {
  console.log('🤖 FAL AI Model Selection');
  console.log('='.repeat(50));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'promptModel',
      message: 'Select a prompt generation model:',
      choices: PROMPT_GENERATION_MODELS,
      default: 0, // Default to first option (Claude 3.5 Sonnet)
    },
    {
      type: 'list',
      name: 'imageModel',
      message: 'Select an image generation model:',
      choices: IMAGE_GENERATION_MODELS,
      default: 0, // Default to first option (Imagen 3 Fast)
    },
  ]);

  console.log(`\n✅ Selected models:`);
  console.log(`📝 Prompt Generation: ${answers.promptModel}`);
  console.log(`🎨 Image Generation: ${answers.imageModel}`);
  console.log('');

  return {
    promptModel: answers.promptModel,
    imageModel: answers.imageModel,
  };
}

/**
 * Generate a description using FAL AI any-llm when no description is found
 */
async function generateDescription(textContent, title, promptModel) {
  try {
    if (!process.env.FAL_KEY) {
      console.warn('FAL_KEY not set, cannot generate description');
      return '';
    }

    const prompt = `Summarize in a two sentence blog description the following article: ${title}

${textContent}`;

    console.log('Generating description with FAL AI any-llm...');
    console.log('Prompt being sent to LLM:', prompt);

    // Use non-streaming approach for simplicity
    const result = await fal.subscribe('fal-ai/any-llm', {
      input: {
        prompt: prompt,
        priority: 'latency',
        model: promptModel,
      },
    });

    console.log('LLM result:', result);

    // Extract the generated description from the result
    let generatedDescription = '';
    if (result.data && result.data.output) {
      generatedDescription = result.data.output;
    } else if (result.data && result.data.content) {
      generatedDescription = result.data.content;
    } else if (result.data && result.data.text) {
      generatedDescription = result.data.text;
    } else if (result.data && result.data.response) {
      generatedDescription = result.data.response;
    } else if (result.content) {
      generatedDescription = result.content;
    } else if (result.text) {
      generatedDescription = result.text;
    } else {
      console.warn('Could not extract description from result:', result);
      generatedDescription = '';
    }

    // Clean up the generated description
    generatedDescription = generatedDescription.trim();

    console.log('Generated description:', generatedDescription);

    // If the generated description is too short or seems incomplete, return empty string
    if (
      generatedDescription.length < 10 ||
      generatedDescription.trim() === ''
    ) {
      console.warn('Generated description too short or empty');
      return '';
    }

    return generatedDescription;
  } catch (error) {
    console.warn(
      `Failed to generate description with FAL AI: ${error.message}`
    );
    return '';
  }
}

/**
 * Generate a better image prompt using FAL AI any-llm
 */
async function generateImagePrompt(
  textContent,
  title,
  description,
  promptModel
) {
  try {
    if (!process.env.FAL_KEY) {
      console.warn('FAL_KEY not set, using fallback prompt');
      return `${title}\n\n${description}`;
    }

    const prompt = `Read this blog post and create a vivid, 2 sentence image-generation prompt that visually captures its core theme and mood. Focus on clear imagery, color, lighting, and style. Avoid text or logos.

Blog post: ${title} ${description} ${textContent}`;

    console.log('Generating image prompt with FAL AI any-llm...');
    console.log('Prompt being sent to LLM:', prompt);

    // Use non-streaming approach for simplicity
    const result = await fal.subscribe('fal-ai/any-llm', {
      input: {
        prompt: prompt,
        priority: 'latency',
        model: promptModel,
      },
    });

    console.log('LLM result:', result);

    // Extract the generated prompt from the result
    let generatedPrompt = '';
    if (result.data && result.data.output) {
      generatedPrompt = result.data.output;
    } else if (result.data && result.data.content) {
      generatedPrompt = result.data.content;
    } else if (result.data && result.data.text) {
      generatedPrompt = result.data.text;
    } else if (result.data && result.data.response) {
      generatedPrompt = result.data.response;
    } else if (result.content) {
      generatedPrompt = result.content;
    } else if (result.text) {
      generatedPrompt = result.text;
    } else {
      console.warn('Could not extract prompt from result:', result);
      generatedPrompt = '';
    }

    // Clean up the generated prompt
    generatedPrompt = generatedPrompt.trim();

    console.log('Generated image prompt:', generatedPrompt);

    // If the generated prompt is too short or seems incomplete, fall back to original
    if (generatedPrompt.length < 10 || generatedPrompt.trim() === '') {
      console.warn('Generated prompt too short or empty, using fallback');
      console.warn('Generated prompt was:', JSON.stringify(generatedPrompt));
      return `${title}\n\n${description}`;
    }

    console.log('Generated image prompt:', generatedPrompt);
    return generatedPrompt;
  } catch (error) {
    console.warn(
      `Failed to generate image prompt with FAL AI: ${error.message}`
    );
    return `${title}\n\n${description}`;
  }
}

/**
 * Extract metadata from HTML content
 */
function extractMetadata(html, url) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Helper function to get meta content
  const getMetaContent = (name, property) => {
    const meta = document.querySelector(
      `meta[name="${name}"], meta[property="${property}"]`
    );
    return meta ? meta.getAttribute('content') : null;
  };

  // Extract title and clean it up
  let title =
    document.querySelector('title')?.textContent?.trim() ||
    getMetaContent('og:title') ||
    'Untitled';

  // Clean up title - remove site name and separators
  title = title
    .replace(/\s*\|\s*.*$/, '')
    .replace(/\s*-\s*.*$/, '')
    .trim();

  // Extract description
  let description =
    getMetaContent('description') ||
    getMetaContent('og:description') ||
    getMetaContent('twitter:description') ||
    '';

  // Clean up description
  description = description.replace(/\s*\.\s*Read more.*$/i, '').trim();

  // Extract author - try multiple methods
  let author =
    getMetaContent('author') ||
    getMetaContent('article:author') ||
    getMetaContent('twitter:creator') ||
    '';

  // Try to extract author from content if not in meta tags
  if (!author) {
    // Look for author in structured data or content
    const authorSelectors = [
      '[data-author]',
      '.author',
      '.byline',
      '[rel="author"]',
      'meta[name="twitter:creator"]',
    ];

    for (const selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        author =
          element.textContent?.trim() ||
          element.getAttribute('content') ||
          element.getAttribute('data-author');
        if (author) break;
      }
    }
  }

  // Extract publication date
  let pubDate =
    getMetaContent('article:published_time') ||
    getMetaContent('article:modified_time') ||
    getMetaContent('og:updated_time') ||
    getMetaContent('datePublished') ||
    getMetaContent('dateModified') ||
    null;

  // If no date found in meta tags, try to extract from HTML comments
  if (!pubDate) {
    const commentRegex = /<!--\s*Last Published:\s*([^>]+)-->/i;
    const match = html.match(commentRegex);
    if (match) {
      try {
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          pubDate = date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }

  // If still no date, try to extract from other common patterns
  if (!pubDate) {
    const datePatterns = [
      /<!--\s*Published:\s*([^>]+)-->/i,
      /<!--\s*Date:\s*([^>]+)-->/i,
      /<!--\s*Updated:\s*([^>]+)-->/i,
      /<time[^>]*datetime="([^"]+)"[^>]*>/i,
      /<time[^>]*>([^<]+)<\/time>/i,
    ];

    for (const pattern of datePatterns) {
      const match = html.match(pattern);
      if (match) {
        try {
          const dateStr = match[1].trim();
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            pubDate = date.toISOString().split('T')[0];
            break;
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
    }
  }

  // Fallback to current date if still no date found
  if (!pubDate) {
    pubDate = new Date().toISOString().split('T')[0];
  }

  // Format date to YYYY-MM-DD (in case it's not already formatted)
  if (pubDate) {
    try {
      const date = new Date(pubDate);
      pubDate = date.toISOString().split('T')[0];
    } catch (e) {
      pubDate = new Date().toISOString().split('T')[0];
    }
  }

  // Extract Open Graph image - try multiple selectors
  let ogImage =
    getMetaContent('og:image') ||
    getMetaContent('twitter:image') ||
    getMetaContent('twitter:image:src') ||
    null;

  // If not found with getMetaContent, try direct selectors
  if (!ogImage) {
    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="og:image"]',
      'meta[property="twitter:image"]',
      'meta[name="twitter:image"]',
      'meta[property="twitter:image:src"]',
      'meta[name="twitter:image:src"]',
    ];

    for (const selector of imageSelectors) {
      const meta = document.querySelector(selector);
      if (meta) {
        ogImage = meta.getAttribute('content');
        if (ogImage) break;
      }
    }
  }

  // Extract full site hostname (without www) for tags and filenames
  const siteName = new URL(url).hostname.replace(/^www\./, '');

  // Extract meta keywords
  let keywords = getMetaContent('keywords') || '';

  // Clean up keywords - split by comma and clean each keyword
  const keywordArray = keywords
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0)
    .slice(0, 5); // Limit to 5 keywords to avoid too many tags

  return {
    title,
    description,
    author,
    pubDate,
    ogImage,
    siteName,
    keywords: keywordArray,
  };
}

/**
 * Generate a slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Generate a file-safe filename with timestamp for uniqueness
 */
function generateUniqueFilename(title, slug) {
  // Create a timestamp in YYYYMMDD-HHMMSS format
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, '')
    .replace('T', '-');

  // Create a file-safe name from the title/slug
  const fileSafeName = slug
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length to 50 characters

  // If the file-safe name is empty or too short, use a fallback
  const finalName = fileSafeName.length > 3 ? fileSafeName : 'external-post';

  return `external-${finalName}-${timestamp}`;
}

/**
 * Get file extension from URL
 */
function getFileExtension(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);
    return ext || '.png'; // Default to .png if no extension
  } catch {
    return '.png';
  }
}

/**
 * Generate an OG image using FAL AI
 */
async function generateOGImage(
  title,
  description,
  textContent,
  localPath,
  promptModel,
  imageModel
) {
  try {
    // Check if FAL AI API key is set
    if (!process.env.FAL_KEY) {
      console.warn(
        'FAL_KEY environment variable not set. Skipping image generation.'
      );
      console.warn('To enable image generation, set your FAL AI API key:');
      console.warn('export FAL_KEY=your_fal_api_key_here');
      console.warn('Or create a .env file in the project root with:');
      console.warn('FAL_KEY=your_fal_api_key_here');
      return { success: false, prompt: `${title}\n\n${description}` };
    }

    console.log('Generating OG image with FAL AI...');
    console.log('FAL AI client configured:', !!process.env.FAL_KEY);

    // Generate a better prompt using the extracted text content
    const imagePrompt = await generateImagePrompt(
      textContent,
      title,
      description,
      promptModel
    );
    console.log('🎨 Generated image prompt:');
    console.log('='.repeat(80));
    console.log(imagePrompt);
    console.log('='.repeat(80));

    const result = await fal.subscribe(imageModel, {
      input: {
        prompt: imagePrompt,
        aspect_ratio: '16:9',
        num_images: 1,
        resolution: '1K',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('FAL AI generation result:', result.data);
    console.log('Request ID:', result.requestId);

    // Download the generated image
    if (result.data && result.data.images && result.data.images.length > 0) {
      const imageUrl = result.data.images[0].url;
      console.log(`Downloading generated image: ${imageUrl}`);
      await downloadImage(imageUrl, localPath);
      console.log(`Generated image saved to: ${localPath}`);
      return { success: true, prompt: imagePrompt };
    } else {
      console.warn('No image generated by FAL AI');
      return { success: false, prompt: imagePrompt };
    }
  } catch (error) {
    console.error(`Failed to generate image with FAL AI: ${error.message}`);
    return { success: false, prompt: `${title}\n\n${description}` };
  }
}

/**
 * Main function to fetch and create post
 */
async function createPost(url, models) {
  try {
    console.log(`Fetching content from: ${url}`);

    // Fetch HTML content
    const html = await fetchHTML(url);
    const metadata = extractMetadata(html, url);
    const textContent = extractTextContent(html);

    console.log('Extracted metadata:', metadata);
    console.log('Extracted text content length:', textContent.length);

    // Track AI usage
    let aiGeneratedDescription = false;
    let aiGeneratedImage = false;

    // Generate description if none found
    if (!metadata.description || metadata.description.trim() === '') {
      console.log('No description found, generating one with FAL AI...');
      const generatedDescription = await generateDescription(
        textContent,
        metadata.title,
        models.promptModel
      );
      if (generatedDescription) {
        metadata.description = generatedDescription;
        aiGeneratedDescription = true;
        console.log('Generated description:', metadata.description);
      } else {
        console.warn('Failed to generate description, using empty string');
        metadata.description = '';
      }
    }

    // Use site name as author if no author found
    if (!metadata.author || metadata.author.trim() === '') {
      console.log('No author found, using site name as author...');
      metadata.author = metadata.siteName || 'Unknown';
      console.log('Using site name as author:', metadata.author);
    }

    // Generate filename and directory (prefix normalized site name)
    const slug = generateSlug(metadata.title);
    const normalizedSite = (metadata.siteName || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    const sitePrefix = normalizedSite ? `${normalizedSite}-` : '';
    const filename = `external-${sitePrefix}${slug}.md`;
    const filePath = path.join(CONTENT_DIR, filename);

    // Create images directory for this post (match filename prefix + slug)
    const imageDir = path.join(IMAGES_DIR, `external-${sitePrefix}${slug}`);
    await fs.mkdir(imageDir, { recursive: true });

    let heroImagePath = null;

    // Download and save OG image if available
    if (metadata.ogImage) {
      try {
        const imageUrl = metadata.ogImage.startsWith('http')
          ? metadata.ogImage
          : new URL(metadata.ogImage, url).href;

        const imageExt = getFileExtension(imageUrl);
        // Generate timestamp for image filename uniqueness
        const now = new Date();
        const timestamp = now
          .toISOString()
          .replace(/[-:]/g, '')
          .replace(/\.\d{3}Z$/, '')
          .replace('T', '-');
        const imageFilename = `banner_16_9-1-${timestamp}${imageExt}`;
        const localImagePath = path.join(imageDir, imageFilename);

        console.log(`Downloading image: ${imageUrl}`);
        await downloadImage(imageUrl, localImagePath);

        // Set relative path for the markdown file (match filename prefix + slug)
        heroImagePath = `../../images/posts/external-${sitePrefix}${slug}/${imageFilename}`;
        console.log(`Image saved to: ${localImagePath}`);
      } catch (error) {
        console.warn(`Failed to download image: ${error.message}`);
      }
    } else {
      // No OG image found, generate one using FAL AI
      console.log('No OG image found, generating one with FAL AI...');
      aiGeneratedImage = true;
      // Generate timestamp for image filename uniqueness
      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, '')
        .replace('T', '-');
      const imageFilename = `banner_16_9-1-${timestamp}.png`;
      const localImagePath = path.join(imageDir, imageFilename);

      const generated = await generateOGImage(
        metadata.title,
        metadata.description,
        textContent,
        localImagePath,
        models.promptModel,
        models.imageModel
      );

      if (generated.success) {
        // Set relative path for the markdown file (match filename prefix + slug)
        heroImagePath = `../../images/posts/external-${sitePrefix}${slug}/${imageFilename}`;
        console.log(`Generated image saved to: ${localImagePath}`);

        // Save the prompt as a text file
        const promptFilename = imageFilename.replace(/\.[^/.]+$/, '.txt');
        const promptPath = path.join(imageDir, promptFilename);
        await fs.writeFile(promptPath, generated.prompt, 'utf8');
        console.log(`Generated prompt saved to: ${promptPath}`);
      } else {
        console.warn('Failed to generate image with FAL AI');
        aiGeneratedImage = false; // Reset if generation failed
      }
    }

    // Generate markdown content
    const allTags = [metadata.siteName, ...metadata.keywords];
    const tagsString = allTags
      .map((tag) => `"${tag.replace(/"/g, '\\"')}"`)
      .join(', ');

    const markdownContent = `---
title: "${metadata.title.replace(/"/g, '\\"')}"
description: "${metadata.description.replace(/"/g, '\\"')}"
author: "${metadata.author}"
pubDate: '${metadata.pubDate}'
updatedDate: '${metadata.pubDate}'
${heroImagePath ? `heroImage: '${heroImagePath}'` : ''}
url: "${url}?ref=pwv.com"
tags: [ ${tagsString}]
${aiGeneratedDescription ? 'aiGeneratedDescription: true' : ''}
${aiGeneratedImage ? 'aiGeneratedImage: true' : ''}
---

`;

    // Write markdown file
    await fs.writeFile(filePath, markdownContent, 'utf8');
    console.log(`Post created: ${filePath}`);

    return {
      success: true,
      filePath,
      metadata,
    };
  } catch (error) {
    console.error(`Error creating post: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const skipInteractive = args.includes('--default-models');
  const url = args.find((arg) => !arg.startsWith('--'));

  if (!url) {
    console.error(
      'Usage: node fetch-external-content.js <URL> [--default-models]'
    );
    console.error(
      'Example: node fetch-external-content.js https://www.aalo.com/post/aalo-closes-100m-series-b'
    );
    console.error('');
    console.error('Options:');
    console.error(
      '  --default-models    Use default models without interactive selection'
    );
    console.error('');
    console.error(
      'Note: If no description is found, the script will generate one using FAL AI.'
    );
    console.error(
      'If no OG image is found, the script will attempt to generate one using FAL AI.'
    );
    console.error(
      'The script extracts full text content and uses FAL AI any-llm to generate'
    );
    console.error(
      'better descriptions and image prompts based on the actual article content.'
    );
    console.error('To enable AI features, set your FAL AI API key:');
    console.error('export FAL_KEY=your_fal_api_key_here');
    console.error('Or create a .env file in the project root with:');
    console.error('FAL_KEY=your_fal_api_key_here');
    process.exit(1);
  }

  try {
    let models;

    if (skipInteractive) {
      // Use default models
      models = {
        promptModel: 'anthropic/claude-3.5-sonnet',
        imageModel: 'fal-ai/imagen3/fast',
      };
      console.log('🤖 Using default models:');
      console.log(`📝 Prompt Generation: ${models.promptModel}`);
      console.log(`🎨 Image Generation: ${models.imageModel}`);
      console.log('');
    } else {
      // Interactive model selection
      models = await selectModels();
    }

    const result = await createPost(url, models);

    if (result.success) {
      console.log('\n✅ Successfully created post!');
      console.log(`📄 File: ${result.filePath}`);
      console.log(`📝 Title: ${result.metadata.title}`);
      console.log(`👤 Author: ${result.metadata.author}`);
      console.log(`📅 Date: ${result.metadata.pubDate}`);
      console.log(`🤖 Models used:`);
      console.log(`   📝 Prompt: ${models.promptModel}`);
      console.log(`   🎨 Image: ${models.imageModel}`);
    } else {
      console.error('\n❌ Failed to create post');
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
