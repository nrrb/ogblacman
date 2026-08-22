import { createHash } from 'node:crypto';

export const ANALYSIS_VERSION = 1;

export const REFERENCE_DURATION_WEIGHTS = Object.freeze([
  { frames: 9, weight: 11 },
  { frames: 10, weight: 19 },
  { frames: 11, weight: 7 },
  { frames: 12, weight: 8 },
  { frames: 13, weight: 1 },
  { frames: 14, weight: 7 },
  { frames: 15, weight: 7 },
  { frames: 16, weight: 8 },
  { frames: 17, weight: 12 },
  { frames: 18, weight: 5 },
  { frames: 19, weight: 1 },
  { frames: 20, weight: 6 },
  { frames: 21, weight: 3 },
  { frames: 22, weight: 3 },
  { frames: 23, weight: 2 },
  { frames: 25, weight: 2 },
  { frames: 28, weight: 1 },
  { frames: 32, weight: 1 },
  { frames: 33, weight: 1 },
  { frames: 40, weight: 1 },
  { frames: 81, weight: 1 },
]);

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function quantile(values, amount) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * clamp(amount);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  const weight = position - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function normalize(value, low, high) {
  if (!Number.isFinite(value) || high <= low) return 0.5;
  return clamp((value - low) / (high - low));
}

export function createSeededRandom(seed) {
  const digest = createHash('sha256').update(String(seed)).digest();
  let state = digest.readUInt32LE(0) || 0x6d2b79f5;

  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function weightedChoice(items, getWeight, random) {
  const total = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);
  if (total <= 0) return items[Math.floor(random() * items.length)];
  let cursor = random() * total;
  for (const item of items) {
    cursor -= Math.max(0, getWeight(item));
    if (cursor <= 0) return item;
  }
  return items.at(-1);
}

export function planShotFrames(targetFrames, random, weights = REFERENCE_DURATION_WEIGHTS) {
  if (!Number.isInteger(targetFrames) || targetFrames <= 0) {
    throw new Error('Target duration must resolve to a positive whole number of frames.');
  }

  const minimum = Math.min(...weights.map((entry) => entry.frames));
  const plan = [];
  let remaining = targetFrames;

  while (remaining > 0) {
    if (remaining < minimum) {
      if (!plan.length) plan.push(remaining);
      else plan[plan.length - 1] += remaining;
      break;
    }

    const choices = weights.filter(({ frames }) => (
      frames <= remaining && (remaining - frames === 0 || remaining - frames >= minimum)
    ));

    if (!choices.length) {
      plan.push(remaining);
      break;
    }

    const chosen = weightedChoice(choices, (entry) => entry.weight, random);
    plan.push(chosen.frames);
    remaining -= chosen.frames;
  }

  return plan;
}

export function parseFfmpegMetadata(text) {
  const frames = [];
  let current = null;

  function commit() {
    if (!current) return;
    frames.push({
      time: current.time ?? 0,
      motion: current.motion ?? 0,
      yAverage: current.yAverage ?? 0,
      yLow: current.yLow ?? 0,
      yHigh: current.yHigh ?? 0,
      saturation: current.saturation ?? 0,
      blur: current.blur ?? 0,
      sceneScore: current.sceneScore ?? 0,
      sceneChange: Boolean(current.sceneChange),
    });
  }

  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('frame:')) {
      commit();
      const time = /pts_time:([^\s]+)/.exec(line);
      current = { time: time ? Number(time[1]) : 0 };
      continue;
    }
    if (!current) continue;

    const separator = line.indexOf('=');
    if (separator < 0) continue;
    const key = line.slice(0, separator);
    const value = Number(line.slice(separator + 1));
    if (!Number.isFinite(value)) continue;

    if (key === 'lavfi.vmafmotion.score') current.motion = value;
    else if (key === 'lavfi.signalstats.YAVG') current.yAverage = value;
    else if (key === 'lavfi.signalstats.YLOW') current.yLow = value;
    else if (key === 'lavfi.signalstats.YHIGH') current.yHigh = value;
    else if (key === 'lavfi.signalstats.SATAVG') current.saturation = value;
    else if (key === 'lavfi.blur') current.blur = value;
    else if (key === 'lavfi.scd.score') current.sceneScore = value;
    else if (key === 'lavfi.scd.time') current.sceneChange = true;
  }
  commit();
  return frames;
}

export function summarizeAnalysisFrames(frames) {
  const nonCuts = frames.filter((frame) => !frame.sceneChange);
  const usable = nonCuts.length ? nonCuts : frames;
  const motions = usable.map((frame) => frame.motion);
  const blurs = frames.map((frame) => frame.blur);
  const contrasts = frames.map((frame) => Math.max(0, frame.yHigh - frame.yLow));

  return {
    motionLow: quantile(motions, 0.1),
    motionHigh: quantile(motions, 0.9),
    blurLow: quantile(blurs, 0.1),
    blurHigh: quantile(blurs, 0.9),
    contrastLow: quantile(contrasts, 0.1),
    contrastHigh: quantile(contrasts, 0.9),
  };
}

function exposureScore(yAverage) {
  if (yAverage <= 5 || yAverage >= 251) return 0;
  if (yAverage < 18) return (yAverage - 5) / 13;
  if (yAverage > 238) return (251 - yAverage) / 13;
  return 1;
}

export function buildCandidates(source, shotFrames, config) {
  const {
    fps,
    analysisFps,
    sourceMargin = 0.25,
    candidateStep = 1 / analysisFps,
    sourceCutPenalty = 0.08,
  } = config;
  const duration = shotFrames / fps;
  const stepFrames = Math.max(1, Math.round(candidateStep * analysisFps));
  const output = [];
  const ranges = source.ranges ?? summarizeAnalysisFrames(source.frames);

  for (let index = 0; index < source.frames.length; index += stepFrames) {
    const rawStart = source.frames[index].time;
    const start = Math.round(rawStart * fps) / fps;
    const end = start + duration;
    if (start < sourceMargin || end > source.duration - sourceMargin) continue;

    const windowFrames = [];
    for (let cursor = index; cursor < source.frames.length; cursor += 1) {
      const frame = source.frames[cursor];
      if (frame.time >= end) break;
      if (frame.time >= start) windowFrames.push(frame);
    }
    if (windowFrames.length < 2) continue;

    const motionValues = windowFrames
      .filter((frame) => !frame.sceneChange)
      .map((frame) => normalize(frame.motion, ranges.motionLow, ranges.motionHigh));
    const fallbackMotion = windowFrames.map((frame) => (
      normalize(frame.motion, ranges.motionLow, ranges.motionHigh)
    ));
    const normalizedMotion = motionValues.length ? motionValues : fallbackMotion;
    const activity = (
      quantile(normalizedMotion, 0.5) * 0.65 + quantile(normalizedMotion, 0.75) * 0.35
    );

    const contrast = quantile(windowFrames.map((frame) => normalize(
      Math.max(0, frame.yHigh - frame.yLow),
      ranges.contrastLow,
      ranges.contrastHigh,
    )), 0.5);
    const sharpness = 1 - quantile(windowFrames.map((frame) => normalize(
      frame.blur,
      ranges.blurLow,
      ranges.blurHigh,
    )), 0.5);
    const detail = contrast * 0.55 + sharpness * 0.45;
    const exposure = mean(windowFrames.map((frame) => exposureScore(frame.yAverage)));
    const sourceCuts = windowFrames.filter((frame) => frame.sceneChange).length;
    const score = clamp(
      activity * 0.72 + detail * 0.18 + exposure * 0.1
        - Math.min(0.3, sourceCuts * sourceCutPenalty),
    );

    if (exposure < 0.15) continue;
    output.push({
      sourceId: source.id,
      sourcePath: source.path,
      sourceLabel: source.label,
      sourceStart: start,
      sourceEnd: end,
      frames: shotFrames,
      activity: Number(activity.toFixed(4)),
      detail: Number(detail.toFixed(4)),
      exposure: Number(exposure.toFixed(4)),
      sourceCuts,
      score: Number(score.toFixed(4)),
    });
  }

  return output;
}

function intervalAvailable(candidate, used, cooldown) {
  return used.every((interval) => (
    candidate.sourceEnd + cooldown <= interval.start
      || candidate.sourceStart >= interval.end + cooldown
  ));
}

function shortlist(candidates, fraction) {
  const ordered = [...candidates].sort((a, b) => b.score - a.score);
  const count = Math.min(ordered.length, Math.max(10, Math.ceil(ordered.length * fraction)));
  return ordered.slice(0, count);
}

export function selectTimeline(sources, config) {
  const {
    targetFrames,
    seed,
    fps,
    topFraction = 0.35,
    cooldown = 3,
    maxSourceShare = 0.3,
  } = config;
  if (!sources.length) throw new Error('No analyzed video sources were provided.');

  const random = createSeededRandom(seed);
  const durationPlan = planShotFrames(targetFrames, random);
  const usedBySource = new Map(sources.map((source) => [source.id, []]));
  const sourceFrameTotals = new Map(sources.map((source) => [source.id, 0]));
  const cache = new Map();
  const shots = [];
  const effectiveShare = Math.max(maxSourceShare, 1 / sources.length + 0.05);
  let timelineFrame = 0;

  function candidatesFor(source, shotFrames) {
    const key = `${source.id}:${shotFrames}`;
    if (!cache.has(key)) cache.set(key, buildCandidates(source, shotFrames, config));
    return cache.get(key);
  }

  for (const shotFrames of durationPlan) {
    const allCandidates = sources.flatMap((source) => candidatesFor(source, shotFrames));
    if (!allCandidates.length) {
      throw new Error(`No usable ${shotFrames}-frame windows were found in the source bank.`);
    }

    const previousSource = shots.at(-1)?.sourceId;
    const levels = [
      { cooldown, consecutive: false, quota: effectiveShare },
      { cooldown: Math.min(1, cooldown), consecutive: false, quota: Math.min(1, effectiveShare + 0.1) },
      { cooldown: 0, consecutive: false, quota: 1 },
      { cooldown: 0, consecutive: true, quota: 1 },
    ];

    let eligible = [];
    for (const level of levels) {
      eligible = allCandidates.filter((candidate) => {
        if (!level.consecutive && sources.length > 1 && candidate.sourceId === previousSource) {
          return false;
        }
        const projectedShare = (
          (sourceFrameTotals.get(candidate.sourceId) ?? 0) + shotFrames
        ) / targetFrames;
        if (projectedShare > level.quota) return false;
        return intervalAvailable(
          candidate,
          usedBySource.get(candidate.sourceId) ?? [],
          level.cooldown,
        );
      });
      if (eligible.length) break;
    }

    if (!eligible.length) {
      throw new Error('The source bank is too short for the requested duration and reuse constraints.');
    }

    const pool = shortlist(eligible, topFraction);
    const selected = weightedChoice(
      pool,
      (candidate) => 0.02 + Math.pow(candidate.score, 3),
      random,
    );
    const timelineStart = timelineFrame / fps;
    timelineFrame += shotFrames;
    const timelineEnd = timelineFrame / fps;

    shots.push({
      index: shots.length + 1,
      timelineStart: Number(timelineStart.toFixed(6)),
      timelineEnd: Number(timelineEnd.toFixed(6)),
      duration: Number((shotFrames / fps).toFixed(6)),
      ...selected,
    });
    usedBySource.get(selected.sourceId).push({
      start: selected.sourceStart,
      end: selected.sourceEnd,
    });
    sourceFrameTotals.set(
      selected.sourceId,
      (sourceFrameTotals.get(selected.sourceId) ?? 0) + shotFrames,
    );
  }

  return {
    shots,
    sourceFrameTotals: Object.fromEntries(sourceFrameTotals),
  };
}

export function parseFrameRate(value) {
  if (!value) return 0;
  const [numerator, denominator = '1'] = String(value).split('/').map(Number);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return 0;
  return numerator / denominator;
}
