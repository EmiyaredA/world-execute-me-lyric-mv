// Match local OCR candidates against the original text-free timing hashes.
// Never embed recovered words in this script; results belong in ignored out/.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { layoutLyrics } from '../src/engine/placeholder.js';
import { ensureLyrics } from './fill_lyrics.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = path.join(root, 'out/lyric_recovery');
const table = JSON.parse(fs.readFileSync(path.join(root, 'data/lyric_timing.json'), 'utf8'));
const placeholders = layoutLyrics(table).lines;
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 8);
const words = s => [...s.matchAll(/[\p{L}\p{N}\p{M}]+/gu)];
const key = s => words(s).map(w => w[0].normalize('NFKC').toLowerCase()).join(' ');
const matches = Array.from({ length: table.count }, () => []);
function variants(body) {
  const out = new Set([body, body.normalize('NFKC'), body.replace(/[‘’]/g, "'").replace(/[“”]/g, '"')]);
  for (const str of [...out]) {
    const base = str.replace(/[.!?;:,]+$/, '');
    for (const end of ['', '.', '?', '!', ';', ':', ',', '...']) for (const b of [base, base.toUpperCase(), base.toLowerCase(), base[0]?.toUpperCase() + base.slice(1)]) out.add(b + end);
  }
  return [...out];
}
function match(candidate, meta) {
  const text = candidate.trim().replace(/^[›>»]\s*/, ''), tokens = words(text);
  for (let start = 0; start + meta.words <= tokens.length; start++) {
    const end = start + meta.words, a = tokens[start].index, b = tokens[end - 1].index + tokens[end - 1][0].length;
    let body = start === 0 && end === tokens.length ? text : text.slice(a, b);
    if (hash(key(body)) !== meta.h) continue;
    if (meta.emphasis) body = body.toUpperCase();
    const exact = variants(body).find(v => hash(v) === meta.x);
    return { text: exact ?? body, wordHashMatch: true, exactHashMatch: !!exact };
  }
  return null;
}
for (const file of fs.readdirSync(folder).filter(f => f.endsWith('_ocr.jsonl'))) {
  const samples = JSON.parse(fs.readFileSync(path.join(folder, file.replace('_ocr.jsonl', '.json')), 'utf8'));
  const byFrame = new Map(samples.map(s => [s.frame, s]));
  for (const line of fs.readFileSync(path.join(folder, file), 'utf8').split('\n').filter(Boolean)) {
    const frame = JSON.parse(line), sample = byFrame.get(frame.file);
    const rows = frame.rows.sort((a, b) => b.box[1] - a.box[1]);
    const candidates = rows.flatMap(r => r.candidates.map(c => c.text));
    for (let j = 0; j < rows.length; j++) for (const n of [2, 3, 4]) candidates.push(rows.slice(j, j + n).map(r => r.candidates[0].text).join(' '));
    for (const candidate of candidates) for (let i = 0; i < table.count; i++) {
      const found = match(candidate, table.lines[i]);
      if (found) matches[i].push({ ...found, referenceIndex: sample.index, referenceFileTime: sample.fileTime, frame: sample.frame });
    }
  }
}
const manualPath = path.join(folder, 'verified_text.json');
if (fs.existsSync(manualPath)) {
  const manual = JSON.parse(fs.readFileSync(manualPath, 'utf8'));
  for (const [i, entry] of Object.entries(manual)) {
    const found = match(entry.text, table.lines[i]);
    if (!found) throw new Error(`Manual text fails original word hash: ${i}`);
    matches[i].unshift({ ...entry, ...found, manuallyReviewed: true });
  }
}
const recovered = table.lines.map((line, index) => {
  const best = matches[index].sort((a, b) => Number(b.exactHashMatch) - Number(a.exactHashMatch) || Number(b.referenceIndex === index) - Number(a.referenceIndex === index))[0];
  return { index, displayLine: index + 1, songStart: line.start, songEnd: line.end,
    placeholder: placeholders[index].text, ...best };
});
fs.writeFileSync(path.join(folder, 'recovered.json'), JSON.stringify(recovered, null, 2) + '\n');
const missing = recovered.filter(r => !r.text).map(r => r.index), differing = recovered.filter(r => r.text && !r.exactHashMatch).map(r => r.index);
console.log(JSON.stringify({ total: table.count, recovered: table.count - missing.length, exact: recovered.filter(r => r.exactHashMatch).length, missing, differing }, null, 2));
if (process.argv.includes('--write')) {
  if (missing.length || differing.length) throw new Error('All original word and exact-text hashes must match before writing lyrics');
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
  const time = t => `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toFixed(3).padStart(6, '0')}`;
  const target = path.join(root, cfg.paths.lrc);
  fs.writeFileSync(target, recovered.map(r => `[${time(r.songStart)}]${r.text}`).join('\n') + '\n');
  const report = ensureLyrics();
  if (report.exact !== table.count || report.missing.length || report.wording.length) throw new Error('Lyric fill differs from the verified recovery');
}
