import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import test from 'node:test';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import {
  buildCandidates,
  createSeededRandom,
  parseFfmpegMetadata,
  planShotFrames,
  selectTimeline,
  summarizeAnalysisFrames,
} from '../tools/montage/lib.mjs';

const execFileAsync = promisify(execFile);

test('parses the FFmpeg metadata used by the activity analyzer', () => {
  const metadata = `frame:0    pts:0       pts_time:0
lavfi.vmafmotion.score=0.00
lavfi.signalstats.YLOW=18
lavfi.signalstats.YAVG=64.5
lavfi.signalstats.YHIGH=201
lavfi.signalstats.SATAVG=32.1
lavfi.blur=5.9
lavfi.scd.score=0.000
frame:1    pts:1       pts_time:0.166667
lavfi.vmafmotion.score=24.75
lavfi.signalstats.YLOW=20
lavfi.signalstats.YAVG=80
lavfi.signalstats.YHIGH=220
lavfi.signalstats.SATAVG=40
lavfi.blur=4.2
lavfi.scd.score=21.2
lavfi.scd.time=0.166667
`;
  const frames = parseFfmpegMetadata(metadata);
  assert.equal(frames.length, 2);
  assert.equal(frames[1].time, 0.166667);
  assert.equal(frames[1].motion, 24.75);
  assert.equal(frames[1].sceneChange, true);
  assert.equal(frames[0].sceneChange, false);
});

test('duration planning is seeded and exactly fills the requested frame count', () => {
  const first = planShotFrames(1_680, createSeededRandom('same-seed'));
  const second = planShotFrames(1_680, createSeededRandom('same-seed'));
  assert.deepEqual(first, second);
  assert.equal(first.reduce((sum, frames) => sum + frames, 0), 1_680);
  assert.ok(first.length > 80);
  assert.ok(first.every((frames) => Number.isInteger(frames) && frames > 0));
});

function syntheticSource(id, motionOffset) {
  const frames = Array.from({ length: 240 }, (_, index) => ({
    time: index / 6,
    motion: motionOffset + 8 + 12 * Math.abs(Math.sin(index / 5)),
    yAverage: 80 + 30 * Math.sin(index / 17),
    yLow: 20,
    yHigh: 210,
    saturation: 35,
    blur: 4 + Math.abs(Math.sin(index / 11)),
    sceneScore: 0,
    sceneChange: false,
  }));
  return {
    id,
    label: `${id}.mp4`,
    path: `/video-bank/${id}.mp4`,
    duration: 40,
    frames,
    ranges: summarizeAnalysisFrames(frames),
  };
}

test('candidate generation produces frame-accurate, scored source windows', () => {
  const source = syntheticSource('source-1', 5);
  const candidates = buildCandidates(source, 15, {
    fps: 30,
    analysisFps: 6,
    candidateStep: 1 / 6,
  });
  assert.ok(candidates.length > 100);
  assert.equal(candidates[0].frames, 15);
  assert.ok(Math.abs(candidates[0].sourceEnd - candidates[0].sourceStart - 0.5) < 1e-9);
  assert.ok(candidates.every(({ score }) => score >= 0 && score <= 1));
});

test('selection is deterministic, diverse, and fills the exact timeline', () => {
  const sources = [
    syntheticSource('source-1', 0),
    syntheticSource('source-2', 3),
    syntheticSource('source-3', 6),
  ];
  const config = {
    targetFrames: 450,
    seed: 'deterministic-edit',
    fps: 30,
    analysisFps: 6,
    sourceMargin: 0.25,
    candidateStep: 1 / 6,
    cooldown: 1,
    maxSourceShare: 0.4,
    topFraction: 0.35,
    sourceCutPenalty: 0.08,
  };
  const first = selectTimeline(sources, config);
  const second = selectTimeline(sources, config);
  assert.deepEqual(first, second);
  assert.equal(first.shots.reduce((sum, shot) => sum + shot.frames, 0), 450);
  assert.equal(first.shots.at(-1).timelineEnd, 15);
  for (let index = 1; index < first.shots.length; index += 1) {
    assert.notEqual(first.shots[index].sourceId, first.shots[index - 1].sourceId);
  }
});

test('end-to-end render has the exact requested frame count and CFR timestamps', { timeout: 30_000 }, async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'og-montage-test-'));
  const tool = new URL('../tools/montage.mjs', import.meta.url).pathname;
  try {
    const sources = ['source-a.mp4', 'source-b.mp4'];
    await Promise.all(sources.map((name, index) => execFileAsync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'lavfi',
      '-i', `testsrc2=size=160x90:rate=30`,
      '-t', '4',
      '-vf', `hue=h=${index * 90}`,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p',
      path.join(directory, name),
    ])));

    const output = path.join(directory, 'montage.mp4');
    await execFileAsync(process.execPath, [
      tool,
      '--input', directory,
      '--output', output,
      '--cache', path.join(directory, 'cache'),
      '--duration', '2',
      '--width', '160',
      '--height', '90',
      '--analysis-fps', '4',
      '--concurrency', '1',
      '--preset', 'ultrafast',
      '--crf', '35',
      '--seed', 'integration-test',
    ]);

    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0', '-count_frames',
      '-show_entries', 'stream=avg_frame_rate,nb_read_frames,duration',
      '-of', 'json', output,
    ]);
    const stream = JSON.parse(stdout).streams[0];
    assert.equal(stream.avg_frame_rate, '30/1');
    assert.equal(Number(stream.nb_read_frames), 60);
    assert.equal(Number(stream.duration), 2);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
