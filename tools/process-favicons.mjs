import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import { parse } from 'yaml'
import { presentation } from '../src/config/presentation.js'

// Favicons are always an icon version of seo.socialImage in src/content/site.yaml.
// Run `npm run process:favicons` after changing that image; tests/content.mjs fails when stale.
const root = new URL('../', import.meta.url)
const stampPath = new URL('tools/favicons.lock.json', root)
const outputs = [
  { file: 'public/assets/favicon-32.png', size: 32 },
  { file: 'public/assets/apple-touch-icon.png', size: 180 },
]

export function socialImageSource() {
  const site = parse(fs.readFileSync(new URL('src/content/site.yaml', root), 'utf8'))
  const asset = site.siteSettings.seo.socialImage.asset
  const src = presentation.images[asset]?.src
  if (!src) throw new Error(`Unknown socialImage asset: ${asset}`)
  const file = new URL(`public${src.split('?')[0]}`, root)
  return { asset, file, hash: createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.on('error', reject)
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} failed: ${stderr}`))))
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const source = socialImageSource()
  for (const { file, size } of outputs) {
    // Center-crop to a square, then downscale.
    await run('ffmpeg', [
      '-y', '-loglevel', 'error', '-i', source.file.pathname,
      '-vf', `crop='min(iw,ih)':'min(iw,ih)',scale=${size}:${size}:flags=lanczos`,
      '-frames:v', '1', new URL(file, root).pathname,
    ])
  }
  fs.writeFileSync(stampPath, `${JSON.stringify({ asset: source.asset, sourceSha256: source.hash }, null, 2)}\n`)
  console.log(`Favicons generated from ${source.asset}`)
}
