#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { access, mkdir, rename, rm } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DEFAULTS = Object.freeze({
  input: 'OG_Blacman_-_Telephone_Official_Video [g5QyDi5Cjtc].mp4',
  outputDirectory: 'public/assets/hero',
  posterTime: 4.5,
  speedFactor: 3,
  fps: 24,
  desktopWidth: 1280,
  desktopHeight: 720,
  mobileWidth: 404,
  mobileHeight: 720,
  mobileFocus: 0.5,
  desktopMp4Bitrate: '600k',
  desktopWebmBitrate: '460k',
  mobileMp4Bitrate: '200k',
  mobileWebmBitrate: '145k',
});

function usage() {
  return `
Create responsive web delivery assets from the Telephone source video.

Usage:
  npm run process:hero -- [options]

Options:
  -i, --input <file>           Source video (default: ${DEFAULTS.input})
  -o, --output-dir <dir>       Delivery asset directory (default: ${DEFAULTS.outputDirectory})
      --poster-time <seconds>  Poster frame timestamp (default: ${DEFAULTS.posterTime})
      --speed <number>         Playback speed multiplier (default: ${DEFAULTS.speedFactor})
      --fps <number>           Delivery frame rate (default: ${DEFAULTS.fps})
      --mobile-focus <0..1>    Horizontal mobile crop focus: 0 left, 1 right (default: ${DEFAULTS.mobileFocus})
      --overwrite              Replace an existing delivery set
  -h, --help                   Show this help
`;
}

function valueAfter(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith('-')) throw new Error(`${flag} requires a value.`);
  return value;
}

function parseNumber(value, flag, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`${flag} must be between ${min} and ${max}.`);
  }
  return number;
}

function parseArgs(argv) {
  const options = { ...DEFAULTS };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--help' || flag === '-h') options.help = true;
    else if (flag === '--overwrite') options.overwrite = true;
    else if (flag === '--input' || flag === '-i') options.input = valueAfter(argv, index++, flag);
    else if (flag === '--output-dir' || flag === '-o') options.outputDirectory = valueAfter(argv, index++, flag);
    else if (flag === '--poster-time') options.posterTime = parseNumber(valueAfter(argv, index++, flag), flag, 0, 86_400);
    else if (flag === '--speed') options.speedFactor = parseNumber(valueAfter(argv, index++, flag), flag, 0.1, 10);
    else if (flag === '--fps') options.fps = parseNumber(valueAfter(argv, index++, flag), flag, 1, 60);
    else if (flag === '--mobile-focus') options.mobileFocus = parseNumber(valueAfter(argv, index++, flag), flag, 0, 1);
    else throw new Error(`Unknown option: ${flag}`);
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

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    const stderr = [];
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}.\n${Buffer.concat(stderr).toString('utf8').slice(-4000)}`));
    });
  });
}

function deliveryFiles(outputDirectory) {
  return {
    desktopMp4: path.join(outputDirectory, 'hero-desktop.mp4'),
    desktopWebm: path.join(outputDirectory, 'hero-desktop.webm'),
    desktopPoster: path.join(outputDirectory, 'hero-desktop-poster.jpg'),
    mobileMp4: path.join(outputDirectory, 'hero-mobile.mp4'),
    mobileWebm: path.join(outputDirectory, 'hero-mobile.webm'),
    mobilePoster: path.join(outputDirectory, 'hero-mobile-poster.jpg'),
  };
}

function temporaryName(filename) {
  const extension = path.extname(filename);
  return `${filename.slice(0, -extension.length)}.tmp${extension}`;
}

function videoFilter(width, height, focus = 0.5, speedFactor = 1) {
  return [
    `scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos`,
    `crop=${width}:${height}:(iw-ow)*${focus}:(ih-oh)/2`,
    'setsar=1',
    'format=yuv420p',
    `setpts=PTS/${speedFactor}`,
  ].join(',');
}

async function encodeH264(input, output, filter, options, bitrate) {
  const temporary = temporaryName(output);
  await rm(temporary, { force: true });
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', input,
    '-map', '0:v:0',
    '-vf', filter,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-b:v', bitrate,
    '-maxrate', bitrate,
    '-bufsize', bitrate,
    '-profile:v', 'high',
    '-level:v', '4.0',
    '-pix_fmt', 'yuv420p',
    '-r', String(options.fps),
    '-fps_mode', 'cfr',
    '-g', String(options.fps * 2),
    '-keyint_min', String(Math.round(options.fps / 2)),
    '-movflags', '+faststart',
    temporary,
  ]);
  await rename(temporary, output);
}

async function encodeVp9(input, output, filter, options, bitrate) {
  const temporary = temporaryName(output);
  await rm(temporary, { force: true });
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', input,
    '-map', '0:v:0',
    '-vf', filter,
    '-an',
    '-c:v', 'libvpx-vp9',
    '-b:v', bitrate,
    '-deadline', 'good',
    '-cpu-used', '3',
    '-row-mt', '1',
    '-tile-columns', '2',
    '-frame-parallel', '1',
    '-pix_fmt', 'yuv420p',
    '-r', String(options.fps),
    '-fps_mode', 'cfr',
    '-g', String(options.fps * 4),
    temporary,
  ]);
  await rename(temporary, output);
}

async function makePoster(input, output, filter, posterTime) {
  const temporary = temporaryName(output);
  await rm(temporary, { force: true });
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(posterTime),
    '-i', input,
    '-map', '0:v:0',
    '-vf', filter,
    '-frames:v', '1',
    '-q:v', '3',
    temporary,
  ]);
  await rename(temporary, output);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage().trim());
    return;
  }

  const input = path.resolve(options.input);
  const outputDirectory = path.resolve(options.outputDirectory);
  if (!await exists(input)) throw new Error(`Input not found: ${input}`);
  await mkdir(outputDirectory, { recursive: true });
  const files = deliveryFiles(outputDirectory);
  const existing = [];
  for (const filename of Object.values(files)) {
    if (await exists(filename)) existing.push(filename);
  }
  if (existing.length && !options.overwrite) {
    throw new Error(`Delivery assets already exist. Pass --overwrite to replace them:\n${existing.join('\n')}`);
  }

  const desktopFilter = videoFilter(options.desktopWidth, options.desktopHeight, 0.5, options.speedFactor);
  const mobileFilter = videoFilter(options.mobileWidth, options.mobileHeight, options.mobileFocus, options.speedFactor);
  const desktopPosterFilter = videoFilter(options.desktopWidth, options.desktopHeight);
  const mobilePosterFilter = videoFilter(options.mobileWidth, options.mobileHeight, options.mobileFocus);

  console.log('[1/3] Encoding H.264 desktop and mobile assets');
  await Promise.all([
    encodeH264(input, files.desktopMp4, desktopFilter, options, options.desktopMp4Bitrate),
    encodeH264(input, files.mobileMp4, mobileFilter, options, options.mobileMp4Bitrate),
  ]);

  console.log('[2/3] Encoding VP9 desktop and mobile fallbacks');
  await Promise.all([
    encodeVp9(input, files.desktopWebm, desktopFilter, options, options.desktopWebmBitrate),
    encodeVp9(input, files.mobileWebm, mobileFilter, options, options.mobileWebmBitrate),
  ]);

  console.log('[3/3] Extracting desktop and mobile posters');
  await Promise.all([
    makePoster(input, files.desktopPoster, desktopPosterFilter, options.posterTime * options.speedFactor),
    makePoster(input, files.mobilePoster, mobilePosterFilter, options.posterTime * options.speedFactor),
  ]);

  console.log(`Hero delivery assets written to ${outputDirectory}`);
}

main().catch((error) => {
  console.error(`process-hero: ${error.message}`);
  process.exitCode = 1;
});
