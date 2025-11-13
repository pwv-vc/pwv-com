import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read version from package.json
const packageJsonPath = join(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

// Read Footer.astro
const footerPath = join(rootDir, 'src', 'components', 'Footer.astro');
let footerContent = readFileSync(footerPath, 'utf-8');

// Replace the version in Footer.astro
// Match the version number in the link (line 30)
footerContent = footerContent.replace(
  /(target="_blank">)(\d+\.\d+\.\d+)(<\/a)/,
  `$1${version}$3`
);

// Write updated Footer.astro
writeFileSync(footerPath, footerContent, 'utf-8');

console.log(`Updated Footer.astro with version ${version}`);
