// Inspect real frames and confirm seek/order determinism, cue preservation and twelve attempts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { startServer, ROOT } from '../export/server.mjs';
import { attemptRoute } from '../src/components/memory-instruments.js';
import { execFileSync } from 'node:child_process';

const routes = Array.from({ length: 12 }, (_, i) => attemptRoute(i));
const realLyrics = process.argv.includes('--real-lyrics');
assert.equal(new Set(routes.map(JSON.stringify)).size, 12);
assert(routes.every(r => JSON.stringify(r.at(-1)) === '[1,0.5]'));
const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/amadeus_shot_grid.json'), 'utf8'));
fs.mkdirSync(path.join(ROOT, 'out/sg_frames'), { recursive: true });
const current = fs.readFileSync(path.join(ROOT, 'STORYBOARD.md'), 'utf8');
const timings = s => [...s.matchAll(/^\| ([^|]+) \| ([^|]+) \| `([^`]+)` \|/gm)].map(m => [m[3], m[1].trim(), m[2].trim()]);
assert.deepEqual(timings(current), baseline, 'Shot times or beat positions changed');
for (const f of ['src/scenes/04_pre1.js', 'src/scenes/climax.js']) assert(!/mosaic\(|mosaicBlocks/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')), 'Pixelation remains in a live scene');

const { server, url } = await startServer({ port: 5184 });
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--enable-gpu', ...(process.platform === 'darwin' ? ['--use-angle=metal'] : process.platform === 'win32' ? ['--use-angle=d3d11'] : [])] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (/^\[(shot |scenes|text)/.test(m.text())) errors.push(m.text()); });
  await page.goto(`${url}/?${realLyrics ? '' : 'layoutOnly=1&'}w=960&h=540`);
  await page.waitForFunction(() => document.getElementById('loading').hidden, null, { timeout: 60000 });
  await page.evaluate(async real => {
    const { createEngine } = await import('/src/engine/engine.js');
    const { layoutLyrics } = await import('/src/engine/placeholder.js');
    const get = async p => (await fetch('/' + p)).json();
    const cfg = await get('config.json');
    const engine = await createEngine({ canvas: document.createElement('canvas'), width: 1920, height: 1080, flipY: true,
      cfg, featuresData: await get(cfg.paths.features), lyricsData: real ? await get(cfg.paths.lyrics) : layoutLyrics(await get('data/lyric_timing.json')) });
    window.qa = { engine, buf: new Uint8Array(1920 * 1080 * 4) };
    window.frameHash = t => {
      engine.renderFrame(t); engine.readPixels(qa.buf);
      let h = 2166136261;
      for (let i = 0; i < qa.buf.length; i++) h = Math.imul(h ^ qa.buf[i], 16777619);
      return h >>> 0;
    };
  }, realLyrics);
  const samples = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/memory_lab_samples.json'), 'utf8'));
  // Export raw frames via the same engine/readPixels used by the MP4 exporter, top row first.
  const stills = [];
  for (const [name, t] of Object.entries(samples)) {
    const data = await page.evaluate(t => { qa.engine.renderFrame(t); qa.engine.readPixels(qa.buf); let s = ''; for (let i = 0; i < qa.buf.length; i += 32768) s += String.fromCharCode(...qa.buf.subarray(i, i + 32768)); return btoa(s); }, t);
    const out = path.join(ROOT, `out/sg_frames/${name}.png`);
    execFileSync('ffmpeg', ['-v', 'error', '-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', '1920x1080', '-i', 'pipe:0', '-frames:v', '1', '-y', out], { input: Buffer.from(data, 'base64') });
    stills.push({ name, songTime: t, fileTime: t + 5, path: `out/sg_frames/${name}.png` });
  }
  // Compare every byte of a frame rendered directly with the frame reached through preceding frames.
  const seekChecks = [];
  const selected = [2.6, 10.5, 48.9, 51.6, 52.7, 54.7, 148.7, 151.9, 155.6, 158.5, 163.3, 197.3, 204.1];
  for (const t of selected) {
    const result = await page.evaluate(t => {
      const direct = frameHash(t);
      for (let i = 15; i >= 0; i--) qa.engine.renderFrame(t - i / 60);
      const sequential = frameHash(t);
      qa.engine.renderFrame(12); qa.engine.renderFrame(195); const sought = frameHash(t);
      return { songTime: t, direct, sequential, sought };
    }, t);
    assert.equal(result.direct, result.sequential, `Sequential frame differs at ${t}`);
    assert.equal(result.direct, result.sought, `Seeking differs at ${t}`);
    seekChecks.push(result);
  }
  // Frames on both sides of switches, query pulls, scene cuts, each round and syllable.
  const cueFrames = await page.evaluate(async () => {
    const e = qa.engine, f = e.features;
    const { cues } = await import('/src/scenes/shared.js');
    const { B, Bt, P } = cues({ features: f, lyrics: e.lyrics, cfg: await (await fetch('/config.json')).json() });
    const times = [B(26), Bt(107), Bt(108), Bt(109), Bt(109.5), Bt(110), ...Array.from({ length: 7 }, (_, i) => B(28) + i * P),
      ...Array.from({ length: 48 }, (_, i) => Bt(320 + i * 0.5)), B(104), B(106), B(108), B(110), Bt(445)];
    let count = 0;
    for (const t of times) for (const dt of [-2, -1, 0, 1, 2]) { e.renderFrame(t + dt / 60); count++; }
    return { frames: count, sceneErrors: e.errors() };
  });
  assert.deepEqual(cueFrames.sceneErrors, []);
  assert.deepEqual(errors, []);
  const result = { passed: true, shotTimingUnchanged: true, shots: timings(current).length, distinctAttemptPaths: 12, allAttemptsEndAtNoReply: true,
    cueFrames, seekChecks, stills, renderer: await page.evaluate(() => qa.engine.rendererInfo()), errors };
  result.realLyrics = realLyrics;
  fs.writeFileSync(path.join(ROOT, realLyrics ? 'out/amadeus_memory_lyrics_check.json' : 'out/amadeus_memory_check.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(`Memory lab passed: unchanged shot grid, 12 paths, ${cueFrames.frames} cue frames, ${seekChecks.length} deterministic seek checks, ${stills.length} full-size stills.`);
} finally { await browser?.close(); await new Promise(res => server.close(res)); }
