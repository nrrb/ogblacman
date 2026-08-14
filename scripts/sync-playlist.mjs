import { execFile } from 'node:child_process'
import { readdir, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const projectDirectory = fileURLToPath(new URL('../', import.meta.url))
const musicDirectory = join(projectDirectory, 'public', 'music')
const playlistPath = join(projectDirectory, 'src', 'content', 'playlist.json')

function findTag(tags, name) {
  const entry = Object.entries(tags ?? {}).find(([key]) => key.toLowerCase() === name)
  return typeof entry?.[1] === 'string' ? entry[1].trim() : ''
}

function titleFromFilename(filename) {
  return basename(filename, extname(filename))
    .replace(/^\d+[\s_-]*/, '')
    .replace(/[\s_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function inspectTrack(filename) {
  let stdout
  try {
    const result = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration:format_tags=title,artist',
      '-of',
      'json',
      join(musicDirectory, filename),
    ])
    stdout = result.stdout
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      throw new Error('ffprobe is required. Install FFmpeg, then run the playlist sync again.')
    }
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Could not read metadata from ${filename}: ${message}`)
  }

  const format = JSON.parse(stdout).format ?? {}
  const title = findTag(format.tags, 'title') || titleFromFilename(filename)
  const artist = findTag(format.tags, 'artist') || 'OG Blacman'
  const duration = Number(format.duration)
  const slug = slugify(title)

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Could not determine a positive duration for ${filename}.`)
  }
  if (!slug) throw new Error(`Could not derive a URL-safe slug for ${filename}.`)

  return {
    slug,
    title,
    artist,
    audioUrl: `/music/${filename}`,
    durationSeconds: Math.round(duration * 1000) / 1000,
    provisional: true,
  }
}

const filenames = (await readdir(musicDirectory))
  .filter((filename) => extname(filename).toLowerCase() === '.mp3')
  .sort((left, right) => left.localeCompare(right, 'en', { numeric: true }))

if (filenames.length === 0) {
  throw new Error(`No MP3 files found in ${musicDirectory}.`)
}

const playlist = await Promise.all(filenames.map(inspectTrack))
const slugs = playlist.map((track) => track.slug)

if (new Set(slugs).size !== slugs.length) {
  throw new Error('Track titles produced duplicate slugs. Edit the MP3 title tags so each track is unique.')
}

await writeFile(playlistPath, `${JSON.stringify(playlist, null, 2)}\n`)
console.log(`Updated src/content/playlist.json from ${playlist.length} MP3 files in public/music/.`)
