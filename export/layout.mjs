// Render three independent frame ranges, then join their H.264 streams losslessly.
// Each child uses the existing exporter and absolute song-frame indices.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { ROOT } from './server.mjs';
import { ensureLyrics } from '../tools/fill_lyrics.mjs';

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
const features = JSON.parse(fs.readFileSync(path.join(ROOT, cfg.paths.features), 'utf8'));
const realLyrics = process.argv.includes('--real-lyrics');
if (realLyrics) {
  ensureLyrics({ quiet: true });
  if (!fs.existsSync(path.join(ROOT, cfg.paths.audio))) throw new Error(`Audio missing: ${cfg.paths.audio}`);
}
const mode = realLyrics ? 'final' : 'layout';
const fps = cfg.video.fps, first = -Math.round(cfg.safety.preroll * fps), last = Math.round(features.meta.duration * fps);
const total = last - first, dir = path.join(ROOT, `out/sensetime_${mode}_parts`);
const out = path.join(ROOT, realLyrics ? 'out/sensetime_1080p60.mp4' : 'out/sensetime_layout_1080p60.mp4');
fs.mkdirSync(dir, { recursive: true });
const children = new Set();
const parts = Array.from({ length: 3 }, (_, i) => ({
  first: first + Math.floor(total * i / 3), last: first + Math.floor(total * (i + 1) / 3),
  file: path.join(dir, `part_${i}.mp4`),
}));
const stop = () => { for (const child of children) child.kill('SIGTERM'); };
process.once('SIGINT', () => { stop(); process.exit(130); });
process.once('SIGTERM', () => { stop(); process.exit(143); });

try {
  await Promise.all(parts.map((part, i) => new Promise((resolve, reject) => {
    const args = ['export/export.mjs', ...(!realLyrics ? ['--layout-only'] : []), '--silent', '--codec', 'libx264',
      '--start', String(part.first / fps), '--end', String(part.last / fps),
      '--width', String(cfg.video.width), '--height', String(cfg.video.height), '--fps', String(fps),
      '--cq', realLyrics ? '16' : '26', '--preset', realLyrics ? 'fast' : 'veryfast', '--out', part.file];
    const child = spawn(process.execPath, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    children.add(child);
    let previous = -1;
    child.stdout.on('data', data => {
      const matches = [...data.toString().matchAll(/\[export\] (\d+)\/(\d+) frames/g)];
      if (!matches.length) return;
      const m = matches.at(-1), percent = Math.floor(Number(m[1]) / Number(m[2]) * 100);
      if (percent > previous) { previous = percent; console.log(`[${mode} ${i + 1}/3] ${percent}%`); }
    });
    child.stderr.on('data', data => process.stderr.write(`[${mode} ${i + 1}/3] ${data}`));
    child.on('error', reject);
    child.on('exit', code => { children.delete(child); code === 0 ? resolve() : reject(new Error(`Layout part ${i + 1}: exit ${code}`)); });
  })));
} catch (error) { stop(); throw error; }

const list = path.join(dir, 'concat.txt');
fs.writeFileSync(list, parts.map(p => `file '${path.basename(p.file)}'\nduration ${((p.last - p.first) / fps).toFixed(9)}`).join('\n') + '\n');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list,
  ...(realLyrics ? ['-i', path.join(ROOT, cfg.paths.audio), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
    '-af', `adelay=${Math.round(-first / fps * features.meta.sampleRate)}S:all=1`, ...cfg.export.audio, '-shortest'] : ['-map', '0:v:0', '-c', 'copy']),
  '-bsf:v', 'h264_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-metadata', `comment=mv_start=${(first / fps).toFixed(6)}${realLyrics ? '' : ';layout_only=true'}`, '-movflags', '+faststart', out]);
const streams = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', out], { encoding: 'utf8' })).streams;
if (streams.length !== (realLyrics ? 2 : 1) || Number(streams[0].nb_frames) !== total || streams[0].avg_frame_rate !== `${fps}/1`) {
  throw new Error('Joined layout video has unexpected streams, frame count or frame rate');
}
console.log(`[${mode}] wrote ${path.relative(ROOT, out)} (${total} frames, ${fps}fps)`);
