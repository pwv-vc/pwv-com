#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORTFOLIO_DIR = path.join(__dirname, '../src/content/portfolio');
const OUTPUT_DIR = path.join(__dirname, '../src/images/logos/small');
const FAVICON_BASE_URL =
  'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=';
const FAVICON_SIZE = 64;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadFavicon(url, filename, force = false) {
  try {
    const faviconUrl = `${FAVICON_BASE_URL}${encodeURIComponent(url)}&size=${FAVICON_SIZE}`;
    const filePath = path.join(OUTPUT_DIR, `${filename}.png`);

    if (!force && fs.existsSync(filePath)) {
      console.log(`✓ Skipping existing favicon: ${filename}.png`);
      return true;
    }

    console.log(`Downloading favicon for ${url}...`);

    const response = await fetch(faviconUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`✓ Saved favicon: ${filename}.png`);

    return true;
  } catch (error) {
    console.error(`✗ Failed to download favicon for ${url}:`, error.message);
    return false;
  }
}

async function processPortfolioFile(filename, force = false) {
  const filePath = path.join(PORTFOLIO_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  console.log(`\nProcessing ${filename}...`);

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!Array.isArray(data)) {
      console.error(`Invalid JSON format in ${filename}. Expected an array.`);
      return;
    }

    let successCount = 0;
    let totalCount = data.length;

    for (const company of data) {
      if (!company.url || !company.slug) {
        console.warn(`Skipping company with missing url or slug:`, company);
        continue;
      }

      const success = await downloadFavicon(company.url, company.slug, force);
      if (success) {
        successCount++;
      }

      // Add a small delay to be respectful to the favicon service
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `\nCompleted ${filename}: ${successCount}/${totalCount} favicons downloaded successfully`
    );
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
  }
}

function getPortfolioFiles() {
  const files = fs
    .readdirSync(PORTFOLIO_DIR)
    .filter((file) => file.endsWith('.json'));
  return files;
}

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    question: (query) =>
      new Promise((resolve) => {
        rl.question(query, (answer) => {
          resolve(answer);
        });
      }),
    close: () => rl.close(),
  };
}

async function promptForFile() {
  const files = getPortfolioFiles();
  const prompt = createPrompt();

  console.log('\nAvailable portfolio files:');
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log(`  ${files.length + 1}. All files`);

  const answer = await prompt.question(
    `\nSelect a file to process (1-${files.length + 1}): `
  );
  prompt.close();

  const selection = parseInt(answer.trim());

  if (isNaN(selection) || selection < 1 || selection > files.length + 1) {
    console.error('Invalid selection');
    process.exit(1);
  }

  if (selection === files.length + 1) {
    return 'all';
  }

  return files[selection - 1];
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');

  let target;

  if (args.length > 0 && !args[0].startsWith('--')) {
    target = args[0];
  } else {
    target = await promptForFile();
  }

  const portfolioFiles = getPortfolioFiles();

  if (target === 'all') {
    for (const file of portfolioFiles) {
      await processPortfolioFile(file, force);
    }
  } else if (portfolioFiles.includes(target)) {
    await processPortfolioFile(target, force);
  } else {
    console.error(`Invalid file: ${target}`);
    console.log(`Valid options: ${portfolioFiles.join(', ')}, or all`);
    process.exit(1);
  }

  console.log('\nFavicon download complete!');
}

main().catch(console.error);
