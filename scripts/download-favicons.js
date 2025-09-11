#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORTFOLIO_DIR = path.join(__dirname, '../src/content/portfolio');
const OUTPUT_DIR = path.join(__dirname, '../src/images/logos/small');
const FAVICON_BASE_URL = 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=';
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
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\nCompleted ${filename}: ${successCount}/${totalCount} favicons downloaded successfully`);

  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node download-favicons.js [rolling-fund.json|representative.json|angel.json|all] [--force|-f]');
    console.log('Examples:');
    console.log('  node download-favicons.js rolling-fund.json');
    console.log('  node download-favicons.js representative.json');
    console.log('  node download-favicons.js angel.json');
    console.log('  node download-favicons.js all');
    console.log('  node download-favicons.js all --force');
    process.exit(1);
  }

  const target = args[0];
  const force = args.includes('--force') || args.includes('-f');

  if (target === 'all') {
    await processPortfolioFile('rolling-fund.json', force);
    await processPortfolioFile('representative.json', force);
    await processPortfolioFile('angel.json', force);
  } else if (target === 'rolling-fund.json' || target === 'representative.json' || target === 'angel.json') {
    await processPortfolioFile(target, force);
  } else {
    console.error(`Invalid argument: ${target}`);
    console.log('Valid options: rolling-fund.json, representative.json, angel.json, or all');
    process.exit(1);
  }

  console.log('\nFavicon download complete!');
}

main().catch(console.error);

