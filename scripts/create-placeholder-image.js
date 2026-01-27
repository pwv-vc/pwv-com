#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Creates a placeholder PNG image
 */
async function createPlaceholderImage(outputPath, title, description) {
  const width = 1200;
  const height = 630; // Standard OG image size

  // Create a simple gradient background
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${title}</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" fill="#cccccc" text-anchor="middle" dominant-baseline="middle">${description.substring(0, 80)}${description.length > 80 ? '...' : ''}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Placeholder image created: ${outputPath}`);
}

// Main execution
async function main() {
  const postSlug = 'why-invest-in-teams';
  const imageDir = path.join(projectRoot, 'src', 'images', 'posts', postSlug);
  const imagePath = path.join(imageDir, 'why-invest-in-teams.png');

  // Ensure directory exists
  await fs.mkdir(imageDir, { recursive: true });

  const title = 'Before U2 Was U2: Why We Invest in Teams, Not Products';
  const description = "Most early products aren't very good. But the right team can evolve, pivot, and find their edge—even when the product isn't finished yet.";

  await createPlaceholderImage(imagePath, title, description);
  console.log(`✅ Image created at: ${imagePath}`);
  console.log(`Relative path: ../../images/posts/${postSlug}/why-invest-in-teams.png`);
}

main().catch(console.error);
