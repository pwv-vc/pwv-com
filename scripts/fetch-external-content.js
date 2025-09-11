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

// Load environment variables from .env file
dotenv.config();

// Configure FAL AI client
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONTENT_DIR = path.join(__dirname, '../src/content/library');
const IMAGES_DIR = path.join(__dirname, '../src/images/library');

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

    protocol.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
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

    protocol.get(imageUrl, (response) => {
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
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Extract metadata from HTML content
 */
function extractMetadata(html, url) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Helper function to get meta content
  const getMetaContent = (name, property) => {
    const meta = document.querySelector(`meta[name="${name}"], meta[property="${property}"]`);
    return meta ? meta.getAttribute('content') : null;
  };

  // Extract title and clean it up
  let title = document.querySelector('title')?.textContent?.trim() ||
              getMetaContent('og:title') ||
              'Untitled';

  // Clean up title - remove site name and separators
  title = title.replace(/\s*\|\s*.*$/, '').replace(/\s*-\s*.*$/, '').trim();

  // Extract description
  let description = getMetaContent('description') ||
                   getMetaContent('og:description') ||
                   getMetaContent('twitter:description') ||
                   '';

  // Clean up description
  description = description.replace(/\s*\.\s*Read more.*$/i, '').trim();

  // Extract author - try multiple methods
  let author = getMetaContent('author') ||
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
      'meta[name="twitter:creator"]'
    ];

    for (const selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        author = element.textContent?.trim() || element.getAttribute('content') || element.getAttribute('data-author');
        if (author) break;
      }
    }
  }

  // Extract publication date
  let pubDate = getMetaContent('article:published_time') ||
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
      /<time[^>]*>([^<]+)<\/time>/i
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
  let ogImage = getMetaContent('og:image') ||
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
      'meta[name="twitter:image:src"]'
    ];

    for (const selector of imageSelectors) {
      const meta = document.querySelector(selector);
      if (meta) {
        ogImage = meta.getAttribute('content');
        if (ogImage) break;
      }
    }
  }

  // Extract site name for tags
  const siteName = new URL(url).hostname.replace('www.', '').split('.')[0];

  // Extract meta keywords
  let keywords = getMetaContent('keywords') || '';

  // Clean up keywords - split by comma and clean each keyword
  const keywordArray = keywords
    .split(',')
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0)
    .slice(0, 5); // Limit to 5 keywords to avoid too many tags

  return {
    title,
    description,
    author,
    pubDate,
    ogImage,
    siteName,
    keywords: keywordArray
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
  const timestamp = now.toISOString()
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
async function generateOGImage(title, description, localPath) {
  try {
    // Check if FAL AI API key is set
    if (!process.env.FAL_KEY) {
      console.warn('FAL_KEY environment variable not set. Skipping image generation.');
      console.warn('To enable image generation, set your FAL AI API key:');
      console.warn('export FAL_KEY=your_fal_api_key_here');
      console.warn('Or create a .env file in the project root with:');
      console.warn('FAL_KEY=your_fal_api_key_here');
      return false;
    }

    console.log('Generating OG image with FAL AI...');
    console.log('FAL AI client configured:', !!process.env.FAL_KEY);

    // Create a comprehensive prompt from title and description
    const prompt = `${title}

${description}`;

    const result = await fal.subscribe('fal-ai/imagen3/fast', {
      input: {
        prompt: prompt,
        aspect_ratio: '16:9',
        num_images: 1,
        resolution: '1K'
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
      return true;
    } else {
      console.warn('No image generated by FAL AI');
      return false;
    }
  } catch (error) {
    console.error(`Failed to generate image with FAL AI: ${error.message}`);
    return false;
  }
}

/**
 * Main function to fetch and create library post
 */
async function createLibraryPost(url) {
  try {
    console.log(`Fetching content from: ${url}`);

    // Fetch HTML content
    const html = await fetchHTML(url);
    const metadata = extractMetadata(html, url);

    console.log('Extracted metadata:', metadata);

    // Generate filename and directory
    const slug = generateSlug(metadata.title);
    const filename = `external-${slug}.md`;
    const filePath = path.join(CONTENT_DIR, filename);

    // Create images directory for this post (keep original slug for folder name)
    const imageDir = path.join(IMAGES_DIR, `external-${slug}`);
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
        const timestamp = now.toISOString()
          .replace(/[-:]/g, '')
          .replace(/\.\d{3}Z$/, '')
          .replace('T', '-');
        const imageFilename = `banner_16_9-1-${timestamp}${imageExt}`;
        const localImagePath = path.join(imageDir, imageFilename);

        console.log(`Downloading image: ${imageUrl}`);
        await downloadImage(imageUrl, localImagePath);

        // Set relative path for the markdown file
        heroImagePath = `../../images/library/external-${slug}/${imageFilename}`;
        console.log(`Image saved to: ${localImagePath}`);
      } catch (error) {
        console.warn(`Failed to download image: ${error.message}`);
      }
    } else {
      // No OG image found, generate one using FAL AI
      console.log('No OG image found, generating one with FAL AI...');
      // Generate timestamp for image filename uniqueness
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, '')
        .replace('T', '-');
      const imageFilename = `banner_16_9-1-${timestamp}.png`;
      const localImagePath = path.join(imageDir, imageFilename);

      const generated = await generateOGImage(metadata.title, metadata.description, localImagePath);

      if (generated) {
        // Set relative path for the markdown file
        heroImagePath = `../../images/library/external-${slug}/${imageFilename}`;
        console.log(`Generated image saved to: ${localImagePath}`);
      } else {
        console.warn('Failed to generate image with FAL AI');
      }
    }

    // Generate markdown content
    const allTags = [metadata.siteName, ...metadata.keywords];
    const tagsString = allTags.map(tag => `"${tag.replace(/"/g, '\\"')}"`).join(', ');

    const markdownContent = `---
title: "${metadata.title.replace(/"/g, '\\"')}"
description: "${metadata.description.replace(/"/g, '\\"')}"
author: "${metadata.author}"
pubDate: '${metadata.pubDate}'
updatedDate: '${metadata.pubDate}'
${heroImagePath ? `heroImage: '${heroImagePath}'` : ''}
url: "${url}?ref=pwv.com"
tags: [ ${tagsString}]
---

`;

    // Write markdown file
    await fs.writeFile(filePath, markdownContent, 'utf8');
    console.log(`Library post created: ${filePath}`);

    return {
      success: true,
      filePath,
      metadata
    };

  } catch (error) {
    console.error(`Error creating library post: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Main execution
async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error('Usage: node fetch-external-content.js <URL>');
    console.error('Example: node fetch-external-content.js https://www.aalo.com/post/aalo-closes-100m-series-b');
    console.error('');
    console.error('Note: If no OG image is found, the script will attempt to generate one using FAL AI.');
    console.error('To enable image generation, set your FAL AI API key:');
    console.error('export FAL_KEY=your_fal_api_key_here');
    console.error('Or create a .env file in the project root with:');
    console.error('FAL_KEY=your_fal_api_key_here');
    process.exit(1);
  }

  try {
    const result = await createLibraryPost(url);

    if (result.success) {
      console.log('\n✅ Successfully created library post!');
      console.log(`📄 File: ${result.filePath}`);
      console.log(`📝 Title: ${result.metadata.title}`);
      console.log(`👤 Author: ${result.metadata.author}`);
      console.log(`📅 Date: ${result.metadata.pubDate}`);
    } else {
      console.error('\n❌ Failed to create library post');
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
