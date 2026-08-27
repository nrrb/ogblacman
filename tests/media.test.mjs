import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { stat } from 'node:fs/promises'
import test from 'node:test'
import { promisify } from 'node:util'
import { presentation } from '../src/config/presentation.js'

const execFileAsync = promisify(execFile)
const heroDirectory = new URL('../public/assets/hero/', import.meta.url)

const expectedAssets = [
  { name: 'hero-montage-desktop.mp4', codec: 'h264', width: 1280, height: 720, maxBytes: 13_000_000 },
  { name: 'hero-montage-desktop.webm', codec: 'vp9', width: 1280, height: 720, maxBytes: 11_000_000 },
  { name: 'hero-montage-mobile.mp4', codec: 'h264', width: 404, height: 720, maxBytes: 4_500_000 },
  { name: 'hero-montage-mobile.webm', codec: 'vp9', width: 404, height: 720, maxBytes: 4_000_000 },
]

async function probe(name) {
  const filename = new URL(name, heroDirectory)
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'format=duration:stream=codec_name,width,height,avg_frame_rate',
    '-of', 'json',
    filename.pathname,
  ])
  return JSON.parse(stdout)
}

test('hero delivery assets retain the montage while meeting delivery budgets', async () => {
  for (const expected of expectedAssets) {
    const filename = new URL(expected.name, heroDirectory)
    const [details, fileStat] = await Promise.all([probe(expected.name), stat(filename)])
    const stream = details.streams[0]
    assert.equal(stream.codec_name, expected.codec)
    assert.equal(stream.width, expected.width)
    assert.equal(stream.height, expected.height)
    assert.equal(stream.avg_frame_rate, '24/1')
    assert.ok(Math.abs(Number(details.format.duration) - 55.933) < 0.1)
    assert.ok(fileStat.size <= expected.maxBytes, `${expected.name} exceeds ${expected.maxBytes} bytes`)
  }
})

test('hero source order prefers an explicitly declared VP9 stream', () => {
  for (const video of [presentation.videos.heroDesktop, presentation.videos.heroMobile]) {
    assert.match(video.sources[0].type, /^video\/webm; codecs="vp9"$/)
    assert.match(video.sources[1].type, /^video\/mp4; codecs="avc1\.640028"$/)
  }
})
