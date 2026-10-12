// Real lyric data and normal audio preview, plus every lyric cue in the actual renderer.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { chromium } from 'playwright-core';
import { startServer, ROOT } from '../export/server.mjs';
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const cfg = read('config.json'), table = read('data/lyric_timing.json'), lyrics = read(cfg.paths.lyrics);
const h = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 8);
const forbidden = /(?:ARCHIVE|SENSOR)\s+\d{3}\s*\/\s*TEXT|TEXT PENDING|PENDING09|LAYOUT PREVIEW/;
assert.equal(lyrics.lines.length, 129);
assert(!lyrics.placeholder);
lyrics.lines.forEach((line, i) => {
  const tokens = [...line.text.matchAll(/[\p{L}\p{N}\p{M}]+/gu)].map(m => m[0].normalize('NFKC').toLowerCase());
  assert.equal(h(tokens.join(' ')), table.lines[i].h, `Word hash: ${i}`);
  assert.equal(h(line.text), table.lines[i].x, `Exact hash: ${i}`);
  assert(!forbidden.test(line.text));
  assert.equal(line.start, table.lines[i].start);
  assert.equal(line.end, table.lines[i].end);
});
fs.mkdirSync(path.join(ROOT, 'out/lyrics_frames'), { recursive: true });
const { server, url } = await startServer({ port: 5185 });
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--enable-gpu', ...(process.platform === 'darwin' ? ['--use-angle=metal'] : []), '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (/^\[(shot |scenes|text)/.test(m.text())) errors.push(m.text()); });
  await page.goto(`${url}/?t=64.7`);
  await page.waitForFunction(() => document.getElementById('loading').hidden, null, { timeout: 60000 });
  await page.waitForFunction(() => document.getElementById('audio').readyState >= 2, null, { timeout: 30000 });
  const preview = await page.evaluate(async () => {
    const audio = document.getElementById('audio');
    audio.currentTime = 64.7; await audio.play();
    await new Promise(r => setTimeout(r, 600));
    const result = { currentTime: audio.currentTime, duration: audio.duration, paused: audio.paused, readyState: audio.readyState, error: audio.error?.message ?? null };
    audio.pause(); return result;
  });
  assert(preview.currentTime > 65 && !preview.paused && preview.error === null);
  await page.evaluate(async () => {
    const get = async p => (await fetch('/' + p)).json();
    const cfg = await get('config.json'), { createEngine } = await import('/src/engine/engine.js');
    const canvas = document.createElement('canvas');
    const engine = await createEngine({ canvas, width: 1920, height: 1080, cfg, featuresData: await get(cfg.paths.features), lyricsData: await get(cfg.paths.lyrics) });
    const thumb = document.createElement('canvas'); thumb.width = 640; thumb.height = 360;
    window.lyricQA = { engine, canvas, thumb };
  });
  const stills = [];
  for (let i = 0; i < lyrics.lines.length; i++) {
    const line = lyrics.lines[i], t = line.start + (line.end - line.start) * 0.82;
    const png = await page.evaluate(t => {
      const { engine, canvas, thumb } = lyricQA;
      for (const dt of [-1 / 60, 0, 1 / 60]) engine.renderFrame(t + dt);
      engine.renderFrame(t);
      const g = thumb.getContext('2d'); g.drawImage(canvas, 0, 0, 640, 360);
      return thumb.toDataURL('image/png').split(',')[1];
    }, t);
    const file = `out/lyrics_frames/line_${String(i).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(ROOT, file), Buffer.from(png, 'base64'));
    stills.push({ index: i, songTime: t, fileTime: t + 5, path: file });
  }
  const sceneErrors = await page.evaluate(() => lyricQA.engine.errors());
  assert.deepEqual(sceneErrors, []); assert.deepEqual(errors, []);
  const result = { passed: true, lines: 129, exactHashMatches: 129, unchangedLineTimings: true, placeholderLines: 0, preview, checkedCueFrames: 387, sceneErrors, errors, stills };
  fs.writeFileSync(path.join(ROOT, 'out/sensetime_lyrics_check.json'), JSON.stringify(result, null, 2) + '\n');
  console.log('Restored lyrics passed: 129 exact hashes, no placeholders, 387 cue frames, normal audio preview plays.');
} finally { await browser?.close(); await new Promise(r => server.close(r)); }
