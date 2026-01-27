#!/usr/bin/env node

import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { fal } from '@fal-ai/client';
import dotenv from 'dotenv';
import readline from 'readline';

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
const projectRoot = path.resolve(__dirname, '..');

/**
 * Scans the posts directory for markdown and MDX files
 */
async function scanPostFiles() {
  const postsDir = path.join(projectRoot, 'src', 'content', 'posts');

  try {
    const files = await fs.readdir(postsDir);
    const markdownFiles = files
      .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
      .sort();

    return markdownFiles;
  } catch (error) {
    console.error('Error scanning posts directory:', error);
    return [];
  }
}

/**
 * Creates a readline interface for user input
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompts user to select a file from the list
 */
async function selectFile(files) {
  const rl = createReadlineInterface();

  return new Promise((resolve, reject) => {
      console.log('\n📚 Available post files:\n');

    files.forEach((file, index) => {
      const fileType = file.endsWith('.mdx') ? 'MDX' : 'MD';
      console.log(`${index + 1}. ${file} (${fileType})`);
    });

    console.log('\n0. Exit\n');

    const askForSelection = () => {
      rl.question('Select a file by number (0 to exit): ', (answer) => {
        const selection = parseInt(answer.trim());

        if (isNaN(selection)) {
          console.log('❌ Please enter a valid number.');
          askForSelection();
          return;
        }

        if (selection === 0) {
          console.log('👋 Goodbye!');
          rl.close();
          resolve(null);
          return;
        }

        if (selection < 1 || selection > files.length) {
          console.log(
            `❌ Please enter a number between 0 and ${files.length}.`
          );
          askForSelection();
          return;
        }

        const selectedFile = files[selection - 1];
        const fullPath = path.join(
          projectRoot,
          'src',
          'content',
          'posts',
          selectedFile
        );

        console.log(`✅ Selected: ${selectedFile}`);
        rl.close();
        resolve(fullPath);
      });
    };

    askForSelection();
  });
}

/**
 * Downloads an image from a URL to a local path
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
 * Parses frontmatter from a markdown file
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('No frontmatter found in markdown file');
  }

  const frontmatterText = match[1];
  const markdownContent = match[2];

  // Parse YAML-like frontmatter
  const frontmatter = {};
  const lines = frontmatterText.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        let value = trimmedLine.substring(colonIndex + 1).trim();

        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // Handle array values
        if (value.startsWith('[') && value.endsWith(']')) {
          const arrayContent = value.slice(1, -1);
          frontmatter[key] = arrayContent
            .split(',')
            .map((item) => item.trim().replace(/^['"]|['"]$/g, ''));
        } else {
          frontmatter[key] = value;
        }
      }
    }
  }

  return { frontmatter, markdownContent };
}

/**
 * Generates a unique filename based on the post slug
 */
function generateUniqueFilename(postSlug) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${postSlug}-${timestamp}-${randomSuffix}.png`;
}

/**
 * Updates the heroImage field in markdown frontmatter
 */
function updateFrontmatter(content, newHeroImage) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('No frontmatter found in markdown file');
  }

  const frontmatterText = match[1];
  const markdownContent = match[2];

  // Update or add heroImage field
  let updatedFrontmatter = frontmatterText;

  if (frontmatterText.includes('heroImage:')) {
    // Update existing heroImage
    updatedFrontmatter = frontmatterText.replace(
      /heroImage:\s*['"]?[^'\n]*['"]?/,
      `heroImage: '${newHeroImage}'`
    );
  } else {
    // Add new heroImage field
    updatedFrontmatter = frontmatterText + `\nheroImage: '${newHeroImage}'`;
  }

  return `---\n${updatedFrontmatter}\n---\n${markdownContent}`;
}

/**
 * Generates an OG image using FAL AI
 */
async function generateOGImage(title, description, localPath) {
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
      return true;
    } else {
      console.warn('No image generated by FAL AI');
      return false;
    }
  } catch (error) {
    console.error('Error generating OG image:', error);
    return false;
  }
}

/**
 * Main function to process a markdown post and generate OG image
 */
async function generatePostOGImage(markdownFilePath) {
  try {
    console.log(`Processing markdown file: ${markdownFilePath}`);

    // Read the markdown file
    const content = await fs.readFile(markdownFilePath, 'utf-8');

    // Parse frontmatter
    const { frontmatter, markdownContent } = parseFrontmatter(content);

    // Extract title and description
    const title = frontmatter.title;
    const description = frontmatter.description;

    if (!title || !description) {
      throw new Error('Title and description are required in frontmatter');
    }

    console.log(`Title: ${title}`);
    console.log(`Description: ${description}`);

    // Generate post slug from filename
    const filename = path.basename(
      markdownFilePath,
      path.extname(markdownFilePath)
    );
    const postSlug = filename.replace(/^post-/, ''); // Remove 'post-' prefix if present

    // Create directory for images if it doesn't exist
    const imageDir = path.join(
      projectRoot,
      'src',
      'images',
      'posts',
      postSlug
    );
    await fs.mkdir(imageDir, { recursive: true });

    // Generate unique filename
    const imageFilename = generateUniqueFilename(postSlug);
    const imagePath = path.join(imageDir, imageFilename);

    // Generate the OG image
    const success = await generateOGImage(title, description, imagePath);

    if (success) {
      // Create relative path for frontmatter
      const relativeImagePath = `../../images/posts/${postSlug}/${imageFilename}`;

      // Update the markdown file with new heroImage
      const updatedContent = updateFrontmatter(content, relativeImagePath);
      await fs.writeFile(markdownFilePath, updatedContent, 'utf-8');

      console.log(`✅ Successfully generated OG image and updated frontmatter`);
      console.log(`Image saved to: ${imagePath}`);
      console.log(`Frontmatter updated with: ${relativeImagePath}`);
    } else {
      console.error('❌ Failed to generate OG image');
    }
  } catch (error) {
    console.error('Error processing markdown file:', error);
  }
}

// Main execution
async function main() {
  console.log('🎨 PWV OG Image Generator');
  console.log('========================\n');

  // Check if a file path was provided as command line argument
  const filePathArg = process.argv[2];

  if (filePathArg) {
    // Use provided file path
    const fullPath = path.isAbsolute(filePathArg)
      ? filePathArg
      : path.join(projectRoot, filePathArg);

    try {
      await fs.access(fullPath);
      await generatePostOGImage(fullPath);
    } catch (error) {
      console.error(`❌ File not found: ${fullPath}`);
      process.exit(1);
    }
    return;
  }

  // Scan for available files
  const files = await scanPostFiles();

  if (files.length === 0) {
    console.log('❌ No markdown or MDX files found in src/content/posts');
    process.exit(1);
  }

  console.log(`Found ${files.length} files in the posts directory.`);

  // Let user select a file
  const selectedFilePath = await selectFile(files);

  if (!selectedFilePath) {
    // User chose to exit
    process.exit(0);
  }

  // Check if file exists (should always be true, but just in case)
  try {
    await fs.access(selectedFilePath);
  } catch (error) {
    console.error(`❌ File not found: ${selectedFilePath}`);
    process.exit(1);
  }

  // Generate the OG image
  await generatePostOGImage(selectedFilePath);
}

// Run the script
main().catch(console.error);
