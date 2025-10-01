import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PARTICLE_COUNT = 400;
const PARTICLE_SIZE = 3;
const PARTICLE_COLOR = '#00d22e';
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

// Density zones (from right to left)
const DENSE_ZONE = { start: 800, end: 1200 }; // Right side - high density
const MEDIUM_ZONE = { start: 400, end: 800 }; // Center - medium density
const SPARSE_ZONE = { start: 0, end: 400 }; // Left side - low density

function generateParticleBackground() {
  // Create SVG content
  let svgContent = `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`;

  // Generate particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = Math.random() * CANVAS_WIDTH;
    const y = Math.random() * CANVAS_HEIGHT;

    // Determine opacity based on x position
    let opacity = 1;

    if (x >= DENSE_ZONE.start) {
      // Dense zone - high opacity
      opacity = 0.9;
    } else if (x >= MEDIUM_ZONE.start) {
      // Medium zone - medium opacity
      opacity = 0.7;
    } else {
      // Sparse zone - low opacity
      opacity = 0.4;
    }

    // Add circle to SVG
    svgContent += `<circle cx="${x}" cy="${y}" r="${PARTICLE_SIZE}" fill="${PARTICLE_COLOR}" opacity="${opacity}" filter="blur(0.2px)" />`;
  }

  svgContent += '</svg>';

  // Write to public directory
  const outputPath = path.join(__dirname, '..', 'public', 'particle-bg.svg');
  fs.writeFileSync(outputPath, svgContent);

  console.log(
    `Generated particle background with ${PARTICLE_COUNT} particles at ${outputPath}`
  );
}

// Run the generator
generateParticleBackground();
