import path from 'node:path'
import sharp from 'sharp'

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const inputPngPath = path.resolve(projectRoot, 'public', 'favicon-2048.png')
const outputPngPath = path.resolve(projectRoot, 'public', 'favicon.png')

const run = async () => {
  try {
    await sharp(inputPngPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: sharp.kernel.lanczos3
      })
      .png({ compressionLevel: 9 })
      .toFile(outputPngPath)

    console.log(`Downscaled favicon -> ${outputPngPath}`)
  } catch (err) {
    console.error('Failed to downscale favicon:', err)
    process.exitCode = 1
  }
}

run()


