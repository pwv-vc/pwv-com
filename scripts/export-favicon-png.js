// Minimal script to export a tightly-cropped, square PNG from the SVG favicon
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const inputSvgPath = path.resolve(projectRoot, 'public', 'favicon.svg')

const sizeArg = Number.parseInt(process.argv[2] || '512', 10)
const exportSize = Number.isNaN(sizeArg) ? 512 : Math.max(64, Math.min(4096, sizeArg))
const outputPngPath = path.resolve(projectRoot, 'public', `favicon-${exportSize}.png`)

const exportPng = async () => {
  try {
    const svgBuffer = await fs.readFile(inputSvgPath)

    // 1) Trim any transparent whitespace
    // 2) Contain within a square canvas and export as PNG
    // Using 512x512 which works well across platforms; adjust if needed
    await sharp(svgBuffer, { density: Math.max(300, exportSize * 2) })
      .trim({ threshold: 10 })
      .resize(exportSize, exportSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ compressionLevel: 9 })
      .toFile(outputPngPath)

    console.log(`Exported square PNG -> ${outputPngPath}`)
    // Also write canonical favicon.png for convenience when size is 512
    if (exportSize === 512) {
      await fs.copyFile(outputPngPath, path.resolve(projectRoot, 'public', 'favicon.png'))
    }
  } catch (err) {
    console.error('Failed to export PNG from SVG:', err)
    process.exitCode = 1
  }
}

exportPng()


