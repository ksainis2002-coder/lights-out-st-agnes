// Converts the owner's downloaded sounds (assets/sounds/incoming) into game
// clips (assets/sounds/<id>.ogg, 44.1 kHz Vorbis, peak -3 dBFS; mono unless
// the entry sets "channels": 2, as music does),
// following assets/sounds/manifest.json. Needs ffmpeg on PATH.
// Usage: node tools/process-sounds.mjs
//
// Modes per manifest entry:
//   whole  – the file with leading/trailing quiet removed (up to maxLength)
//   trim   – one clip starting at the first sound event, maxLength long
//   split  – single hits (e.g. footsteps) cut out of long recordings: each
//            clip starts on a detected onset; `take` loudest per source file
//            (a number, or one number per source), numbered id_1, id_2…
//   loop   – starts at the first event and ends just before a later event,
//            so the clip loops on a natural boundary (breathing, heartbeat)
//   bed    – stereo ambience bed, up to maxLength, with its end crossfaded
//            into its start (crossfade seconds) so it loops without a seam
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const IN_DIR = join(ROOT, 'assets/sounds/incoming');
const OUT_DIR = join(ROOT, 'assets/sounds');
const RATE = 44100;
const WINDOW = 0.01; // envelope window in seconds
const PEAK_DB = -3;

function decode(file) {
  const result = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(RATE), '-f', 'f32le', '-'], {
    maxBuffer: 1 << 30,
  });
  if (result.status !== 0) throw new Error(`ffmpeg could not read ${file}: ${result.stderr}`);
  const bytes = result.stdout;
  return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.length / 4);
}

// RMS level per window, in dB.
function envelope(samples) {
  const size = Math.round(RATE * WINDOW);
  const levels = [];
  for (let i = 0; i < samples.length; i += size) {
    let sum = 0;
    const end = Math.min(samples.length, i + size);
    for (let j = i; j < end; j++) sum += samples[j] * samples[j];
    levels.push(10 * Math.log10(sum / (end - i) + 1e-12));
  }
  return levels;
}

const percentile = (values, p) => [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * p)];

// Sound events: runs of windows clearly above the file's own noise floor.
function findEvents(levels) {
  const floor = percentile(levels, 0.2);
  const top = percentile(levels, 0.99);
  const threshold = floor + (top - floor) * 0.4;
  const events = [];
  let start = -1;
  levels.forEach((level, i) => {
    if (level >= threshold && start < 0) start = i;
    if (level < threshold && start >= 0) {
      events.push({ start: start * WINDOW, end: i * WINDOW });
      start = -1;
    }
  });
  if (start >= 0) events.push({ start: start * WINDOW, end: levels.length * WINDOW });
  return mergeClose(events, 0.08).map((event) => ({ ...event, peak: peakOf(levels, event) }));
}

function mergeClose(events, gap) {
  const merged = [];
  for (const event of events) {
    const last = merged[merged.length - 1];
    if (last && event.start - last.end < gap) last.end = event.end;
    else merged.push({ ...event });
  }
  return merged;
}

function peakOf(levels, { start, end }) {
  return Math.max(...levels.slice(Math.floor(start / WINDOW), Math.ceil(end / WINDOW) + 1));
}

// Onsets: sharp rises (8 dB within 50 ms) in the upper half of the file's
// range, at least minGap apart (the louder one wins).
function findOnsets(levels, minGap = 0.3) {
  const floor = percentile(levels, 0.2);
  const top = percentile(levels, 0.995);
  const onsets = [];
  for (let i = 5; i < levels.length; i++) {
    const before = Math.min(...levels.slice(i - 5, i));
    if (levels[i] < floor + (top - floor) * 0.5 || levels[i] - before < 8) continue;
    const peak = Math.max(...levels.slice(i, i + 10));
    const last = onsets[onsets.length - 1];
    if (last && i * WINDOW - last.start < minGap) {
      if (peak > last.peak) onsets[onsets.length - 1] = { start: i * WINDOW, peak };
    } else {
      onsets.push({ start: i * WINDOW, peak });
    }
  }
  return onsets;
}

function samplePeakDb(samples, from, to) {
  let peak = 0;
  for (let i = Math.floor(from * RATE); i < Math.min(samples.length, to * RATE); i++) peak = Math.max(peak, Math.abs(samples[i]));
  return 20 * Math.log10(peak + 1e-12);
}

function encode(file, samples, from, to, outName, fade, channels = 1) {
  const length = Math.max(0.05, to - from);
  const gain = PEAK_DB - samplePeakDb(samples, from, to);
  const fadeOut = Math.min(fade, length / 3);
  const filters = [
    `atrim=start=${from.toFixed(3)}:duration=${length.toFixed(3)}`,
    'asetpts=PTS-STARTPTS',
    `volume=${gain.toFixed(2)}dB`,
    `afade=t=in:d=0.005`,
    `afade=t=out:st=${(length - fadeOut).toFixed(3)}:d=${fadeOut.toFixed(3)}`,
  ].join(',');
  const out = join(OUT_DIR, `${outName}.ogg`);
  const result = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-af', filters, '-ac', String(channels), '-ar', String(RATE), '-c:a', 'libvorbis', '-q:a', '4', out]);
  if (result.status !== 0) throw new Error(`ffmpeg could not write ${out}: ${result.stderr}`);
  return { out: `${outName}.ogg`, seconds: Number(length.toFixed(2)) };
}

// Seamless loop: [xf, L] crossfaded into [0, xf], so the output's end
// flows straight back into its start.
function encodeBed(file, samples, entry, outName) {
  const length = Math.min(samples.length / RATE, entry.maxLength ?? 60);
  const xf = entry.crossfade ?? 3;
  const gain = PEAK_DB - samplePeakDb(samples, 0, length);
  const graph = [
    `[0:a]atrim=start=${xf}:end=${length.toFixed(3)},asetpts=PTS-STARTPTS[body]`,
    `[1:a]atrim=start=0:end=${xf},asetpts=PTS-STARTPTS[head]`,
    `[body][head]acrossfade=d=${xf}:c1=tri:c2=tri,volume=${gain.toFixed(2)}dB[out]`,
  ].join(';');
  const out = join(OUT_DIR, `${outName}.ogg`);
  // The file is opened twice: one asplit feeding acrossfade stalls in ffmpeg.
  const result = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-i', file, '-filter_complex', graph, '-map', '[out]', '-ac', '2', '-ar', String(RATE), '-c:a', 'libvorbis', '-q:a', '4', out]);
  if (result.status !== 0) throw new Error(`ffmpeg could not write ${out}: ${result.stderr}`);
  return { out: `${outName}.ogg`, seconds: Number((length - xf).toFixed(2)) };
}

function clipsFor(entry, file, samples, events, sourceIndex) {
  const duration = samples.length / RATE;
  const pre = 0.02;
  const max = entry.maxLength ?? duration;
  const first = events[0] ?? { start: 0, end: duration };
  if (entry.mode === 'whole') {
    const last = events[events.length - 1] ?? first;
    const from = Math.max(0, first.start - pre);
    return [[from, Math.min(duration, last.end + 0.25, from + max)]];
  }
  if (entry.mode === 'trim') return [[Math.max(0, first.start - pre), Math.min(duration, first.start + max)]];
  if (entry.mode === 'loop') {
    const from = Math.max(0, first.start - pre);
    const later = events.filter((e) => e.start > first.start + (entry.minLength ?? 1) && e.start - pre <= from + max);
    const end = later.length ? later[later.length - 1].start - pre : Math.min(duration, from + max);
    return [[from, end]];
  }
  // split: loudest onsets, kept in time order; a clip stops before the next onset
  const onsets = findOnsets(envelope(samples), entry.minGap);
  const take = Array.isArray(entry.take) ? entry.take[sourceIndex] : entry.take ?? 3;
  const picked = [...onsets].sort((a, b) => b.peak - a.peak).slice(0, take).sort((a, b) => a.start - b.start);
  return picked.map((onset) => {
    const next = onsets.find((o) => o.start > onset.start);
    const end = Math.min(duration, onset.start + max, next ? next.start - pre : duration);
    return [Math.max(0, onset.start - pre), end];
  });
}

function processEntry(id, entry) {
  const sources = Array.isArray(entry.from) ? entry.from : [entry.from];
  const results = [];
  let counter = 0;
  sources.forEach((source, sourceIndex) => {
    const file = join(IN_DIR, source);
    const samples = decode(file);
    if (entry.mode === 'bed') {
      results.push({ source, ...encodeBed(file, samples, entry, id) });
      return;
    }
    const events = findEvents(envelope(samples));
    for (const [from, to] of clipsFor(entry, file, samples, events, sourceIndex)) {
      counter += 1;
      const numbered = entry.mode === 'split' || sources.length > 1;
      results.push({ source, ...encode(file, samples, from, to, numbered ? `${id}_${counter}` : id, entry.fade ?? 0.05, entry.channels) });
    }
  });
  return results;
}

const manifest = JSON.parse(readFileSync(join(OUT_DIR, 'manifest.json'), 'utf8'));
mkdirSync(OUT_DIR, { recursive: true });
const only = process.argv.slice(2);
for (const [id, entry] of Object.entries(manifest.sounds)) {
  if (only.length && !only.includes(id)) continue;
  for (const clip of processEntry(id, entry)) console.log(`${clip.out.padEnd(24)} ${String(clip.seconds).padStart(6)} s  <- ${clip.source}`);
}
