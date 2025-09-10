#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONTENT_DIR = path.join(__dirname, '../src/content/library');
const IMAGES_DIR = path.join(__dirname, '../src/images/library');

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

  return {
    title,
    description,
    author,
    pubDate,
    ogImage,
    siteName
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

    // Create images directory for this post
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
        const imageFilename = `banner_16_9-1${imageExt}`;
        const localImagePath = path.join(imageDir, imageFilename);

        console.log(`Downloading image: ${imageUrl}`);
        await downloadImage(imageUrl, localImagePath);

        // Set relative path for the markdown file
        heroImagePath = `../../images/library/external-${slug}/${imageFilename}`;
        console.log(`Image saved to: ${localImagePath}`);
      } catch (error) {
        console.warn(`Failed to download image: ${error.message}`);
      }
    }

    // Generate markdown content
    const markdownContent = `---
title: "${metadata.title.replace(/"/g, '\\"')}"
description: "${metadata.description.replace(/"/g, '\\"')}"
author: "${metadata.author}"
pubDate: '${metadata.pubDate}'
updatedDate: '${metadata.pubDate}'
${heroImagePath ? `heroImage: '${heroImagePath}'` : ''}
url: "${url}?ref=pwv.com"
tags: [ "${metadata.siteName}", "external"]
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
