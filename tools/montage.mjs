#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { cpus, tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {
  ANALYSIS_VERSION,
  parseFfmpegMetadata,
  parseFrameRate,
  selectTimeline,
  summarizeAnalysisFrames,
} from './montage/lib.mjs';

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm', '.mkv']);

const DEFAULTS = Object.freeze({
  duration: 55.933333,
  fps: 30,
  analysisFps: 6,
  analysisWidth: 320,
  width: 1280,
  height: 720,
  seed: 'og-montage',
  cooldown: 3,
  maxSourceShare: 0.3,
  topFraction: 0.35,
  sourceMargin: 0.25,
  sourceCutPenalty: 0.08,
  sceneThreshold: 18,
  concurrency: Math.max(1, Math.min(4, cpus().length)),
  crf: 20,
  preset: 'medium',
});

function usage() {
  return `
Build an activity-weighted rapid-cut montage from a bank of videos.

Usage:
  npm run montage -- --input <file-or-directory> [--input <path> ...] --output <video.mp4>
  npm run montage -- --from-manifest <edit.json> --output <video.mp4>

Options:
  -i, --input <path>          Video file or a directory containing videos (repeatable)
  -o, --output <path>         Output MP4 file
      --manifest <path>       Edit manifest path (default: <output>.edit.json)
      --manifest-only         Analyze and write the edit manifest without rendering
      --from-manifest <path>  Render an existing manifest without re-analyzing
      --duration <seconds>    Output duration (default: ${DEFAULTS.duration})
      --seed <value>          Deterministic sequencing seed (default: ${DEFAULTS.seed})
      --fps <number>          Output frame rate (default: ${DEFAULTS.fps})
      --width <pixels>        Output width (default: ${DEFAULTS.width})
      --height <pixels>       Output height (default: ${DEFAULTS.height})
      --analysis-fps <number> Proxy analysis rate (default: ${DEFAULTS.analysisFps})
      --cooldown <seconds>    Reuse spacing within each source (default: ${DEFAULTS.cooldown})
      --max-source-share <n>  Maximum initial share per source (default: ${DEFAULTS.maxSourceShare})
      --top-fraction <n>      Sample from this top fraction of candidates (default: ${DEFAULTS.topFraction})
      --concurrency <number>  Parallel fragment renders (default: ${DEFAULTS.concurrency})
      --cache <directory>     Analysis cache (default: .montage-cache)
      --crf <number>          H.264 quality value (default: ${DEFAULTS.crf})
      --preset <name>         x264 preset (default: ${DEFAULTS.preset})
      --force-analysis        Ignore cached source analysis
      --keep-work             Preserve rendered fragments for inspection
      --overwrite             Permit replacing output/manifest files
  -h, --help                  Show this help
`;
}

function takeValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith('-')) throw new Error(`${flag} requires a value.`);
  return value;
}

function numberOption(value, flag, { min = -Infinity, max = Infinity, integer = false } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max || (integer && !Number.isInteger(parsed))) {
    throw new Error(`${flag} must be ${integer ? 'a whole number' : 'a number'} between ${min} and ${max}.`);
  }
  return parsed;
}

function parseArgs(argv) {
  const options = { ...DEFAULTS, inputs: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--help' || flag === '-h') options.help = true;
    else if (flag === '--manifest-only') options.manifestOnly = true;
    else if (flag === '--force-analysis') options.forceAnalysis = true;
    else if (flag === '--keep-work') options.keepWork = true;
    else if (flag === '--overwrite') options.overwrite = true;
    else if (flag === '--input' || flag === '-i') options.inputs.push(takeValue(argv, index++, flag));
    else if (flag === '--output' || flag === '-o') options.output = takeValue(argv, index++, flag);
    else if (flag === '--manifest') options.manifest = takeValue(argv, index++, flag);
    else if (flag === '--from-manifest') options.fromManifest = takeValue(argv, index++, flag);
    else if (flag === '--cache') options.cache = takeValue(argv, index++, flag);
    else if (flag === '--seed') options.seed = takeValue(argv, index++, flag);
    else if (flag === '--preset') options.preset = takeValue(argv, index++, flag);
    else if (flag === '--duration') options.duration = numberOption(takeValue(argv, index++, flag), flag, { min: 0.3 });
    else if (flag === '--fps') options.fps = numberOption(takeValue(argv, index++, flag), flag, { min: 1, max: 120, integer: true });
    else if (flag === '--width') options.width = numberOption(takeValue(argv, index++, flag), flag, { min: 2, max: 7680, integer: true });
    else if (flag === '--height') options.height = numberOption(takeValue(argv, index++, flag), flag, { min: 2, max: 4320, integer: true });
    else if (flag === '--analysis-fps') options.analysisFps = numberOption(takeValue(argv, index++, flag), flag, { min: 1, max: 30 });
    else if (flag === '--cooldown') options.cooldown = numberOption(takeValue(argv, index++, flag), flag, { min: 0, max: 60 });
    else if (flag === '--max-source-share') options.maxSourceShare = numberOption(takeValue(argv, index++, flag), flag, { min: 0.05, max: 1 });
    else if (flag === '--top-fraction') options.topFraction = numberOption(takeValue(argv, index++, flag), flag, { min: 0.01, max: 1 });
    else if (flag === '--concurrency') options.concurrency = numberOption(takeValue(argv, index++, flag), flag, { min: 1, max: 16, integer: true });
    else if (flag === '--crf') options.crf = numberOption(takeValue(argv, index++, flag), flag, { min: 0, max: 51, integer: true });
    else throw new Error(`Unknown option: ${flag}`);
  }

  if (options.width % 2 || options.height % 2) {
    throw new Error('--width and --height must be even for yuv420p output.');
  }
  return options;
}

async function exists(filename) {
  try {
    await access(filename, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function run(command, args, { quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => {
      stderr.push(chunk);
      if (!quiet) process.stderr.write(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      const result = {
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
      };
      if (code === 0) resolve(result);
      else reject(new Error(`${command} exited with code ${code}.\n${result.stderr.slice(-4000)}`));
    });
  });
}

async function requireBinary(binary) {
  try {
    await run(binary, ['-version'], { quiet: true });
  } catch {
    throw new Error(`${binary} is required but was not found on PATH.`);
  }
}

async function collectInputs(inputPaths, excludedPath) {
  const videos = [];
  for (const supplied of inputPaths) {
    const resolved = path.resolve(supplied);
    const details = await stat(resolved);
    if (details.isDirectory()) {
      const entries = await readdir(resolved, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
        videos.push(path.join(resolved, entry.name));
      }
    } else if (details.isFile() && VIDEO_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
      videos.push(resolved);
    } else {
      throw new Error(`Unsupported video input: ${supplied}`);
    }
  }

  const unique = [...new Set(videos.map((filename) => path.resolve(filename)))]
    .filter((filename) => filename !== excludedPath)
    .sort((a, b) => a.localeCompare(b));
  if (!unique.length) throw new Error('No supported video files were found in the supplied inputs.');
  return unique;
}

async function probeVideo(filename) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'format=duration:stream=width,height,avg_frame_rate,r_frame_rate,codec_name',
    '-of', 'json',
    filename,
  ], { quiet: true });
  const data = JSON.parse(stdout);
  const stream = data.streams?.[0];
  const duration = Number(data.format?.duration);
  if (!stream || !Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Could not read a usable video stream from ${filename}.`);
  }
  return {
    duration,
    width: stream.width,
    height: stream.height,
    frameRate: parseFrameRate(stream.avg_frame_rate || stream.r_frame_rate),
    codec: stream.codec_name,
  };
}

function filterEscape(filename) {
  return filename
    .replaceAll('\\', '\\\\')
    .replaceAll(':', '\\:')
    .replaceAll("'", "\\'")
    .replaceAll(',', '\\,');
}

async function analyzeVideo(filename, id, options, cacheDirectory) {
  const fileStat = await stat(filename);
  const fingerprint = createHash('sha256').update(JSON.stringify({
    version: ANALYSIS_VERSION,
    filename,
    size: fileStat.size,
    modified: fileStat.mtimeMs,
    analysisFps: options.analysisFps,
    analysisWidth: options.analysisWidth,
    sceneThreshold: options.sceneThreshold,
  })).digest('hex').slice(0, 20);
  const cacheFile = path.join(cacheDirectory, `${fingerprint}.json`);

  if (!options.forceAnalysis && await exists(cacheFile)) {
    const cached = JSON.parse(await readFile(cacheFile, 'utf8'));
    return { ...cached, id, path: filename, cached: true };
  }

  const probe = await probeVideo(filename);
  const metadataFile = path.join(cacheDirectory, `${fingerprint}.metadata.txt`);
  const videoFilter = [
    `fps=${options.analysisFps}`,
    `scale=${options.analysisWidth}:-2:flags=fast_bilinear`,
    'vmafmotion',
    'signalstats',
    'blurdetect',
    `scdet=threshold=${options.sceneThreshold}`,
    `metadata=mode=print:file='${filterEscape(metadataFile)}'`,
  ].join(',');

  try {
    await run('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-i', filename,
      '-map', '0:v:0',
      '-vf', videoFilter,
      '-an', '-f', 'null', '-',
    ], { quiet: true });
    const frames = parseFfmpegMetadata(await readFile(metadataFile, 'utf8'));
    if (frames.length < 2) throw new Error(`Analysis returned too few frames for ${filename}.`);
    const analysis = {
      version: ANALYSIS_VERSION,
      label: path.basename(filename),
      duration: probe.duration,
      width: probe.width,
      height: probe.height,
      frameRate: probe.frameRate,
      codec: probe.codec,
      analysisFps: options.analysisFps,
      ranges: summarizeAnalysisFrames(frames),
      frames,
    };
    await writeFile(cacheFile, `${JSON.stringify(analysis)}\n`);
    return { ...analysis, id, path: filename, cached: false };
  } finally {
    await rm(metadataFile, { force: true });
  }
}

function relativeManifestPath(filename, manifestFile) {
  const relative = path.relative(path.dirname(manifestFile), filename);
  return relative || path.basename(filename);
}

function buildManifest(selection, analyses, options, manifestFile) {
  const totalFrames = selection.shots.reduce((sum, shot) => sum + shot.frames, 0);
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    seed: String(options.seed),
    output: {
      fps: options.fps,
      width: options.width,
      height: options.height,
      frames: totalFrames,
      duration: Number((totalFrames / options.fps).toFixed(6)),
      audio: false,
    },
    selection: {
      analysisFps: options.analysisFps,
      cooldown: options.cooldown,
      maxSourceShare: options.maxSourceShare,
      topFraction: options.topFraction,
      durationProfile: 'hero-desktop-background-keyframes',
    },
    sources: analyses.map((source) => ({
      id: source.id,
      path: relativeManifestPath(source.path, manifestFile),
      duration: Number(source.duration.toFixed(6)),
      width: source.width,
      height: source.height,
      frameRate: Number(source.frameRate.toFixed(6)),
    })),
    shots: selection.shots.map((shot) => ({
      index: shot.index,
      sourceId: shot.sourceId,
      source: relativeManifestPath(shot.sourcePath, manifestFile),
      sourceStart: shot.sourceStart,
      sourceEnd: Number(shot.sourceEnd.toFixed(6)),
      timelineStart: shot.timelineStart,
      timelineEnd: shot.timelineEnd,
      frames: shot.frames,
      duration: shot.duration,
      activity: shot.activity,
      detail: shot.detail,
      exposure: shot.exposure,
      sourceCuts: shot.sourceCuts,
      score: shot.score,
    })),
  };
}

async function mapLimit(items, limit, worker) {
  let cursor = 0;
  async function consume() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, consume));
}

async function renderManifest(manifest, manifestFile, outputFile, options) {
  const workDirectory = await mkdtemp(path.join(tmpdir(), 'og-montage-'));
  const total = manifest.shots.length;
  let completed = 0;
  let renderSucceeded = false;
  const fps = manifest.output.fps;
  const width = manifest.output.width;
  const height = manifest.output.height;

  try {
    await mapLimit(manifest.shots, options.concurrency, async (shot, index) => {
      const source = path.resolve(path.dirname(manifestFile), shot.source);
      const fragment = path.join(workDirectory, `${String(index).padStart(5, '0')}.mp4`);
      const filter = [
        `fps=${fps}`,
        `scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos`,
        `crop=${width}:${height}`,
        'setsar=1',
        'format=yuv420p',
        `setpts=N/(${fps}*TB)`,
      ].join(',');
      await run('ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-y',
        '-ss', String(shot.sourceStart),
        '-i', source,
        '-map', '0:v:0',
        '-vf', filter,
        '-frames:v', String(shot.frames),
        '-an',
        '-c:v', 'libx264',
        '-r', String(fps),
        '-fps_mode', 'cfr',
        '-video_track_timescale', String(fps * 1000),
        '-preset', options.preset,
        '-crf', String(options.crf),
        '-pix_fmt', 'yuv420p',
        '-g', '300',
        '-keyint_min', '300',
        '-sc_threshold', '0',
        '-threads', '2',
        fragment,
      ], { quiet: true });
      completed += 1;
      if (completed === total || completed % 10 === 0) {
        process.stdout.write(`\r[render] ${completed}/${total} fragments`);
      }
    });
    process.stdout.write('\n');

    const concatFile = path.join(workDirectory, 'concat.txt');
    const concatLines = manifest.shots.map((_, index) => (
      `file '${String(index).padStart(5, '0')}.mp4'`
    ));
    await writeFile(concatFile, `${concatLines.join('\n')}\n`);
    await mkdir(path.dirname(outputFile), { recursive: true });
    await run('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'concat', '-safe', '0', '-i', concatFile,
      '-map', '0:v:0',
      '-c', 'copy',
      '-movflags', '+faststart',
      outputFile,
    ], { quiet: true });
    renderSucceeded = true;
  } catch (error) {
    error.message += `\nRendered fragments were stored in ${workDirectory}`;
    throw error;
  } finally {
    if (!options.keepWork && renderSucceeded) {
      await rm(workDirectory, { recursive: true, force: true });
    } else if (options.keepWork) {
      console.log(`[work] ${workDirectory}`);
    }
  }
}

async function loadManifest(filename) {
  const manifestFile = path.resolve(filename);
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  if (!manifest.output?.fps || !manifest.output?.width || !manifest.output?.height) {
    throw new Error('Manifest is missing output settings.');
  }
  if (!Array.isArray(manifest.shots) || !manifest.shots.length) {
    throw new Error('Manifest does not contain any shots.');
  }
  for (const shot of manifest.shots) {
    if (!shot.source || !Number.isFinite(shot.sourceStart) || !Number.isInteger(shot.frames)) {
      throw new Error(`Manifest shot ${shot.index ?? '?'} is invalid.`);
    }
  }
  return { manifest, manifestFile };
}

async function assertWritableTargets(targets, overwrite) {
  if (overwrite) return;
  for (const target of targets.filter(Boolean)) {
    if (await exists(target)) throw new Error(`${target} already exists. Pass --overwrite to replace it.`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage().trim());
    return;
  }
  await Promise.all([requireBinary('ffmpeg'), requireBinary('ffprobe')]);

  if (options.fromManifest) {
    if (!options.output) throw new Error('--output is required when rendering a manifest.');
    const outputFile = path.resolve(options.output);
    if (path.extname(outputFile).toLowerCase() !== '.mp4') throw new Error('The renderer currently outputs MP4 files.');
    await assertWritableTargets([outputFile], options.overwrite);
    const { manifest, manifestFile } = await loadManifest(options.fromManifest);
    console.log(`[manifest] ${manifest.shots.length} shots, ${manifest.output.duration}s`);
    await renderManifest(manifest, manifestFile, outputFile, options);
    console.log(`[output] ${outputFile}`);
    return;
  }

  if (!options.inputs.length) throw new Error('At least one --input file or directory is required.');
  if (!options.output && !options.manifestOnly) throw new Error('--output is required unless --manifest-only is used.');
  const outputFile = options.output ? path.resolve(options.output) : null;
  if (outputFile && path.extname(outputFile).toLowerCase() !== '.mp4') {
    throw new Error('The renderer currently outputs MP4 files.');
  }
  const manifestFile = path.resolve(options.manifest ?? (
    outputFile ? `${outputFile.slice(0, -path.extname(outputFile).length)}.edit.json` : 'montage-edit.json'
  ));
  await assertWritableTargets([
    options.manifestOnly ? manifestFile : outputFile,
    manifestFile,
  ], options.overwrite);

  const inputFiles = await collectInputs(options.inputs, outputFile);
  const cacheDirectory = path.resolve(options.cache ?? '.montage-cache');
  await mkdir(cacheDirectory, { recursive: true });
  console.log(`[bank] ${inputFiles.length} video${inputFiles.length === 1 ? '' : 's'}`);

  const analyses = [];
  for (let index = 0; index < inputFiles.length; index += 1) {
    const filename = inputFiles[index];
    process.stdout.write(`[analyze ${index + 1}/${inputFiles.length}] ${path.basename(filename)} ... `);
    const analysis = await analyzeVideo(filename, `source-${index + 1}`, options, cacheDirectory);
    analyses.push(analysis);
    console.log(`${analysis.cached ? 'cache' : `${analysis.frames.length} samples`}`);
  }

  const targetFrames = Math.round(options.duration * options.fps);
  const selection = selectTimeline(analyses, { ...options, targetFrames });
  const manifest = buildManifest(selection, analyses, options, manifestFile);
  await mkdir(path.dirname(manifestFile), { recursive: true });
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

  const averageActivity = selection.shots.reduce((sum, shot) => sum + shot.activity, 0)
    / selection.shots.length;
  console.log(`[edit] ${selection.shots.length} shots, ${manifest.output.duration}s, activity ${averageActivity.toFixed(3)}`);
  console.log(`[manifest] ${manifestFile}`);

  if (!options.manifestOnly) {
    await renderManifest(manifest, manifestFile, outputFile, options);
    console.log(`[output] ${outputFile}`);
  }
}

main().catch((error) => {
  console.error(`montage: ${error.message}`);
  process.exitCode = 1;
});
