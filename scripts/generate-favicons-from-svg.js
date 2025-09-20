import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const projectRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..'
);
const srcSvg = path.resolve(
  projectRoot,
  'scripts',
  'Favicon_iOS touch icon_180x180.svg'
);

const targets = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon-48x48.png', size: 48 },
  { file: 'favicon-1024.png', size: 1024 },
  { file: 'favicon-2048.png', size: 2048 },
  { file: 'favicon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'android-chrome-192x192.png', size: 192 },
  { file: 'android-chrome-512x512.png', size: 512 },
];

const run = async () => {
  try {
    console.log(`Generating favicons from: ${srcSvg}`);

    // Read the SVG and add a white background rectangle
    const originalSvgContent = readFileSync(srcSvg, 'utf8');
    const svgWithBackground = originalSvgContent.replace(
      '<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="180" height="180" fill="white"/>'
    );

    for (const t of targets) {
      const output = path.resolve(projectRoot, 'public', t.file);
      await sharp(Buffer.from(svgWithBackground))
        .resize(t.size, t.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
          kernel: sharp.kernel.lanczos3,
        })
        .png({ compressionLevel: 9 })
        .toFile(output);
      console.log(`Wrote ${t.file} (${t.size}x${t.size})`);
    }

    // Keep favicon.png as 32x32 for default link
    const fav32 = path.resolve(projectRoot, 'public', 'favicon-32x32.png');
    const favOut = path.resolve(projectRoot, 'public', 'favicon.png');
    await sharp(fav32).toFile(favOut);
    console.log('Updated favicon.png (32x32)');

    // Generate favicon.svg (copy the source SVG)
    const faviconSvg = path.resolve(projectRoot, 'public', 'favicon.svg');
    const svgContent = readFileSync(srcSvg, 'utf8');
    writeFileSync(faviconSvg, svgContent);
    console.log('Updated favicon.svg');

    console.log('✅ All favicons generated successfully!');
  } catch (err) {
    console.error('Failed to generate favicons:', err);
    process.exitCode = 1;
  }
};

run();
