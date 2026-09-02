import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { stat } from 'node:fs/promises'
import test from 'node:test'
import { promisify } from 'node:util'
import { presentation } from '../src/config/presentation.js'

const execFileAsync = promisify(execFile)
const heroDirectory = new URL('../public/assets/hero/', import.meta.url)

const expectedAssets = [
  { name: 'hero-desktop.mp4', codec: 'h264', width: 1280, height: 720, maxBytes: 24_000_000 },
  { name: 'hero-desktop.webm', codec: 'vp9', width: 1280, height: 720, maxBytes: 28_000_000 },
  { name: 'hero-mobile.mp4', codec: 'h264', width: 404, height: 720, maxBytes: 13_000_000 },
  { name: 'hero-mobile.webm', codec: 'vp9', width: 404, height: 720, maxBytes: 13_000_000 },
]

async function probe(name) {
  const filename = new URL(name, heroDirectory)
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=codec_name,width,height,avg_frame_rate',
    '-of', 'json',
    filename.pathname,
  ])
  return JSON.parse(stdout)
}

test('hero delivery asset is a compact silent video', async () => {
  for (const expected of expectedAssets) {
    const filename = new URL(expected.name, heroDirectory)
    const [details, fileStat] = await Promise.all([probe(expected.name), stat(filename)])
    const stream = details.streams[0]
    assert.equal(details.streams.length, 1)
    assert.equal(stream.codec_name, expected.codec)
    assert.equal(stream.width, expected.width)
    assert.equal(stream.height, expected.height)
    assert.equal(stream.avg_frame_rate, '24000/1001')
    assert.ok(Math.abs(Number(details.format.duration) - 156.74) < 0.1)
    assert.ok(fileStat.size <= expected.maxBytes, `${expected.name} exceeds ${expected.maxBytes} bytes`)
  }
})

test('non-hero background source order prefers an explicitly declared VP9 stream', () => {
  for (const video of [presentation.videos.standardMobile, presentation.videos.merchMobile, presentation.videos.newsletterMobile]) {
    assert.match(video.sources[0].type, /^video\/webm; codecs="vp9"$/)
    assert.match(video.sources[1].type, /^video\/mp4; codecs="avc1\.640028"$/)
  }
})

test('hero uses separate desktop and mobile sources with WebM fallbacks', () => {
  assert.notDeepEqual(presentation.videos.heroDesktop.sources, presentation.videos.heroMobile.sources)
  assert.equal(presentation.videos.heroDesktop.sources.length, 2)
  assert.equal(presentation.videos.heroMobile.sources.length, 2)
  assert.match(presentation.videos.heroDesktop.sources[0].type, /^video\/webm/)
  assert.match(presentation.videos.heroMobile.sources[0].type, /^video\/webm/)
})
