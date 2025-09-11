import path from 'node:path';
import sharp from 'sharp';

const projectRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..'
);
const src2048 = path.resolve(projectRoot, 'public', 'favicon-2048.png');

const targets = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon-48x48.png', size: 48 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'android-chrome-192x192.png', size: 192 },
  { file: 'android-chrome-512x512.png', size: 512 },
];

const run = async () => {
  try {
    for (const t of targets) {
      const output = path.resolve(projectRoot, 'public', t.file);
      await sharp(src2048)
        .resize(t.size, t.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          kernel: sharp.kernel.lanczos3,
        })
        .png({ compressionLevel: 9 })
        .toFile(output);
      console.log(`Wrote ${t.file}`);
    }
    // Keep favicon.png as 32x32 for default link
    const fav32 = path.resolve(projectRoot, 'public', 'favicon-32x32.png');
    const favOut = path.resolve(projectRoot, 'public', 'favicon.png');
    await sharp(fav32).toFile(favOut);
    console.log('Updated favicon.png (32x32)');
  } catch (err) {
    console.error('Failed to generate favicons:', err);
    process.exitCode = 1;
  }
};

run();
