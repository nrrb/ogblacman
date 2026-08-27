#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { access, mkdir, rename, rm } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const unicodeRanges = 'U+0000-024F,U+1E00-1EFF,U+2000-206F,U+20A0-20CF'
const fonts = [
  ['font-quinn-bold.ttf', 'quinn-bold-latin-ext.woff2'],
  ['font-neue-haas-display-medium.ttf', 'neue-haas-display-medium-latin-ext.woff2'],
  ['font-neue-haas-display-roman.ttf', 'neue-haas-display-roman-latin-ext.woff2'],
  ['font-neue-haas-display-thin.ttf', 'neue-haas-display-thin-latin-ext.woff2'],
  ['font-neue-haas-display-light.ttf', 'neue-haas-display-light-latin-ext.woff2'],
  ['tajamuka-script.ttf', 'tajamuka-script-latin-ext.woff2'],
]

const sourceDirectory = path.resolve('tools/font-sources')
const outputDirectory = path.resolve('public/assets/fonts')
const subsetBinary = process.env.PYFTSUBSET || 'pyftsubset'

async function exists(filename) {
  try {
    await access(filename, fsConstants.F_OK)
    return true
  } catch {
    return false
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    const stderr = []
    child.stderr.on('data', chunk => stderr.push(chunk))
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with code ${code}.\n${Buffer.concat(stderr).toString('utf8').slice(-4000)}`))
    })
  })
}

async function main() {
  const overwrite = process.argv.includes('--overwrite')
  const unknown = process.argv.slice(2).filter(argument => argument !== '--overwrite')
  if (unknown.length) throw new Error(`Unknown option: ${unknown[0]}`)

  await mkdir(outputDirectory, { recursive: true })
  for (const [sourceName, outputName] of fonts) {
    const source = path.join(sourceDirectory, sourceName)
    const output = path.join(outputDirectory, outputName)
    const temporary = output.replace(/\.woff2$/, '.tmp.woff2')
    if (!await exists(source)) throw new Error(`Font source not found: ${source}`)
    if (await exists(output) && !overwrite) {
      throw new Error(`Font output already exists: ${output}. Pass --overwrite to replace it.`)
    }

    await rm(temporary, { force: true })
    await run(subsetBinary, [
      source,
      `--output-file=${temporary}`,
      '--flavor=woff2',
      `--unicodes=${unicodeRanges}`,
      '--layout-features=*',
      '--glyph-names',
      '--symbol-cmap',
      '--legacy-cmap',
      '--notdef-glyph',
      '--notdef-outline',
      '--recommended-glyphs',
      '--name-IDs=*',
      '--name-legacy',
      '--name-languages=*',
      '--drop-tables+=DSIG',
    ])
    await rename(temporary, output)
    console.log(`[font] ${sourceName} -> ${outputName}`)
  }
}

main().catch(error => {
  console.error(`process-fonts: ${error.message}`)
  process.exitCode = 1
})
