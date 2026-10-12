// Meaningful adaptation checks: real source geometry, all timed sections, no male assets/fallback shots.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { Art } from '../src/engine/art.js';
import { Features } from '../src/engine/features.js';
import { Lyrics } from '../src/engine/lyrics.js';
import { layoutLyrics } from '../src/engine/placeholder.js';
import { registerCharacter, EYE, REACH_CROP, REACH_PALM } from '../src/scenes/shared.js';
import { buildShots } from '../src/scenes/index.js';
import { markSvg } from '../src/components/sensetime-mark.js';

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const cfg = read('config.json'), regions = read(`${cfg.paths.art}/regions.json`);
const art = Object.create(Art.prototype);
art.regions = regions; art.dim = {};
for (const name of cfg.character.names) {
  const png = fs.readFileSync(`${cfg.paths.art}/${name}.png`);
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
  assert.deepEqual(regions[name].size, [w, h], `${name}: wrong source dimensions`);
  assert.equal(png[25], 6, `${name}: must preserve RGBA transparency`);
  const rgba = execFileSync('ffmpeg', ['-v', 'error', '-i', `${cfg.paths.art}/${name}.png`, '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'], { maxBuffer: 32 * 1024 * 1024 });
  let minAlpha = 255, maxAlpha = 0, opaque = 0, red = 0, gold = 0;
  for (let i = 3; i < rgba.length; i += 4) { minAlpha = Math.min(minAlpha, rgba[i]); maxAlpha = Math.max(maxAlpha, rgba[i]); if (rgba[i] >= 250) opaque++; }
  for (let i = 0; i < rgba.length; i += 4) {
    const pixel = i / 4, x = pixel % w, y = Math.floor(pixel / w), clip = regions[name].hairclip;
    if (!clip || x < clip[0] || y < clip[1] || x >= clip[0] + clip[2] || y >= clip[1] + clip[3]) continue;
    const [r, g, b, a] = rgba.subarray(i, i + 4);
    if (a < 128) continue;
    if (r > 150 && r > g * 1.45 && r > b * 1.5) red++;
    else if (r > 175 && g > 110 && b < 170 && r > b * 1.3) gold++;
  }
  assert(red > 100, `${name}: red infinity hairclip missing from source`);
  assert(gold > 30, `${name}: gold infinity hairclip missing from source`);
  assert.equal(minAlpha, 0, `${name}: background must really be transparent`);
  assert.equal(maxAlpha, 255, `${name}: figure must contain solid ink`);
  assert(opaque > w * h * 0.08, `${name}: missing solid silhouette`);
  assert(regions[name].hairclip, `${name}: hairclip anchor missing`);
  art.dim[name] = { w, h };
  for (const key of ['eye', 'iris', 'face', 'palm', 'hand', 'tie', 'chin', 'hairclip']) {
    if (!regions[name][key]) continue;
    const r = art.region(name, key);
    assert(r.x >= 0 && r.y >= 0 && r.x + r.w <= w && r.y + r.h <= h, `${name}.${key}: outside source`);
  }
}
assert.equal(cfg.identity.name, 'SenseTime');
assert.equal(fs.readFileSync(`${cfg.paths.art}/mark-full.svg`, 'utf8'), markSvg(), 'Full SVG differs from live Canvas paths');
assert.equal(fs.readFileSync(`${cfg.paths.art}/mark-compact.svg`, 'utf8'), markSvg({ compact: true }), 'Compact SVG differs from live Canvas paths');
assert.deepEqual(cfg.character.names, ['f_bust', 'f_profile', 'f_reach', 'f_eye', 'cat_bust', 'cat_paws']);
assert.deepEqual(cfg.character.sourceInks, [[250, 246, 237], [151, 130, 118], [73, 54, 47]]);
for (const state of ['off', 'dead']) for (const role of ['brandRed', 'brandGold']) {
  const rgb = cfg.palettes[state][role].slice(1).match(/../g).map(v => parseInt(v, 16));
  assert(Math.max(...rgb) - Math.min(...rgb) <= 12, `${state}.${role}: colored shutdown mark`);
}
registerCharacter(art);
assert.deepEqual(art.point('f_eye', 'eye', EYE, { flip: true }).map(Math.round), EYE.eye);
assert.deepEqual(art.point('f_reach', 'palm', { x: 0, y: 0, w: 1920, h: 1080 }, { crop: REACH_CROP }), REACH_PALM);
const features = new Features(read(cfg.paths.features), cfg);
const data = layoutLyrics(read('data/lyric_timing.json'));
assert.equal(data.placeholder, true);
assert(data.lines.every(line => line.words === undefined), "Timing word counts must not be interpreted as word timestamp arrays");
const lyrics = new Lyrics(data, cfg, features);
const warnings = [], warn = console.warn;
console.warn = (...args) => warnings.push(args.join(' '));
let shots;
try { shots = await buildShots({ cfg, features, lyrics, art, script: read(cfg.paths.script), errors: read(cfg.paths.errors) }); }
finally { console.warn = warn; }
assert.deepEqual(warnings, [], 'A section failed to build');
assert(!shots.some(s => s.id.startsWith('todo-')), 'Unexpected fallback scene');
for (let i = 0; i < data.lines.length; i++) assert(shots.some(s => s.lines && i >= s.lines[0] && i <= s.lines[1]), `Line ${i} uncovered`);
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
for (const file of [...walk('src').filter(p => !p.endsWith('amadeus-mark.js')), cfg.paths.script, cfg.paths.errors, 'index.html']) {
  const source = fs.readFileSync(file, 'utf8');
  assert(!/boy_bust|man_bust/.test(source), `${file}: male asset remains active`);
  assert(!/Amadeus|AMADEUS|amadeus|Kurisu|KURISU|Anthropic|['"]Claude['"]/.test(source), `${file}: old visible branding`);
}
for (const file of [...walk('src'), ...walk('tools'), ...walk('export')].filter(p => /\.(m?js)$/.test(p))) execFileSync(process.execPath, ['--check', file]);
assert.equal(shots.length, 87);
assert.equal(data.lines.length, 129);
console.log(`SenseTime checks passed: ${cfg.character.names.length} RGBA plates, ${shots.length} shots, ${data.lines.length} timed lines; eye and palm registration verified.`);
