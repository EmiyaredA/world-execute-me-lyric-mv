// Validate a delivered layout or real-lyric MP4 and inspect frames decoded from that file.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { ROOT } from '../export/server.mjs';

const realLyrics = process.argv.includes('--real-lyrics');
const mode = realLyrics ? 'final' : 'layout';
const input = path.resolve(ROOT, process.argv.slice(2).find(a => !a.startsWith('--')) ?? (realLyrics ? 'out/sensetime_1080p60.mp4' : 'out/sensetime_layout_1080p60.mp4'));
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
const features = JSON.parse(fs.readFileSync(path.join(ROOT, cfg.paths.features), 'utf8'));
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', input], { encoding: 'utf8' }));
const streams = probe.streams, video = streams.find(s => s.codec_type === 'video');
const frames = Math.round(features.meta.duration * cfg.video.fps) + Math.round(cfg.safety.preroll * cfg.video.fps);
assert.equal(streams.length, realLyrics ? 2 : 1, 'Unexpected number of streams');
if (realLyrics) assert.equal(streams.find(s => s.codec_type === 'audio')?.codec_name, 'aac');
assert.equal(video?.codec_name, 'h264');
assert.equal(video.width, cfg.video.width);
assert.equal(video.height, cfg.video.height);
assert.equal(video.avg_frame_rate, `${cfg.video.fps}/1`);
assert.equal(Number(video.nb_frames), frames);
assert.equal(video.pix_fmt, 'yuv420p');
for (const key of ['color_space', 'color_transfer', 'color_primaries']) assert.equal(video[key], 'bt709');
assert.equal(probe.format.tags.comment, `mv_start=${(-cfg.safety.preroll).toFixed(6)}${realLyrics ? '' : ';layout_only=true'}`);
assert(Math.abs(Number(probe.format.duration) - frames / cfg.video.fps) < 1 / cfg.video.fps);
// Decode the complete file, including the boundaries between rendered parts.
execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', input, '-f', 'null', '-']);

const flash = execFileSync(process.execPath, ['tools/python.mjs', 'tools/check_flash.py', input], { cwd: ROOT, encoding: 'utf8' });
fs.writeFileSync(path.join(ROOT, `out/check_flash_sensetime_${mode}.txt`), flash);
assert(!flash.includes('FAIL'), flash);
assert.equal((flash.match(/-> PASS/g) ?? []).length, 2, 'Both general and red flash checks must pass');
assert(flash.includes('single-frame pops: none'), flash);
const luma = execFileSync(process.execPath, ['tools/python.mjs', 'tools/luma.py', input], { cwd: ROOT, encoding: 'utf8' });
fs.writeFileSync(path.join(ROOT, `out/luma_sensetime_${mode}.txt`), luma);
let sync = null;
if (realLyrics) {
  sync = execFileSync(process.execPath, ['tools/python.mjs', 'tools/check_sync.py', input], { cwd: ROOT, encoding: 'utf8' });
  fs.writeFileSync(path.join(ROOT, 'out/check_sync_sensetime_final.txt'), sync);
  const audioLag = sync.match(/audio in mp4 vs source wav: lag = ([+-]?[\d.]+) ms/);
  assert(audioLag, 'Audio synchronization measurement missing');
  assert(Math.abs(Number(audioLag[1])) <= 1000 / cfg.video.fps, 'Audio is displaced by more than one video frame');
}

const samples = [
  ['boot', 2.6], ['editor', 19.2], ['vision_off', 48.9], ['vision_final_click', 51.12],
  ['observation', 52.7], ['cat', 84], ['female_F', 91.1], ['male_M', 91.9],
  ['female_restored', 92.7], ['attempts', 155.6], ['climax', 163.3], ['shutdown', 197.3],
];
const dir = path.join(ROOT, realLyrics ? 'out/sensetime_final_video_frames' : 'out/sensetime_video_frames');
fs.mkdirSync(dir, { recursive: true });
const stills = samples.map(([name, songTime], i) => {
  const file = path.join(dir, `frame_${String(i).padStart(2, '0')}.png`);
  const fileTime = songTime + cfg.safety.preroll;
  execFileSync('ffmpeg', ['-v', 'error', '-ss', String(fileTime), '-i', input, '-frames:v', '1', '-y', file]);
  return { name, songTime, fileTime, path: path.relative(ROOT, file) };
});
execFileSync('ffmpeg', ['-v', 'error', '-framerate', '1', '-i', path.join(dir, 'frame_%02d.png'),
  '-vf', 'scale=640:360,tile=4x3:padding=6:color=0x303030', '-frames:v', '1', '-y', path.join(ROOT, realLyrics ? 'out/sensetime_final_video_keyframes.png' : 'out/sensetime_video_keyframes.png')]);

const lyricStills = [];
if (realLyrics) {
  const lyrics = JSON.parse(fs.readFileSync(path.join(ROOT, cfg.paths.lyrics), 'utf8'));
  assert.equal(lyrics.lines.length, 129);
  assert(!lyrics.placeholder);
  const lyricDir = path.join(ROOT, 'out/sensetime_final_lyrics_frames');
  fs.mkdirSync(lyricDir, { recursive: true });
  for (const [index, line] of lyrics.lines.entries()) {
    const songTime = line.start + (line.end - line.start) * 0.82;
    const frame = Math.round((songTime + cfg.safety.preroll) * cfg.video.fps);
    lyricStills.push({ index, songTime, frame, fileTime: frame / cfg.video.fps,
      path: path.relative(ROOT, path.join(lyricDir, `line_${String(index).padStart(3, '0')}.png`)) });
  }
  assert.equal(new Set(lyricStills.map(s => s.frame)).size, 129);
  // A flat sum of 129 terms exceeds FFmpeg's expression parser depth.
  const select = terms => terms.length === 1 ? terms[0]
    : `(${select(terms.slice(0, terms.length >> 1))}+${select(terms.slice(terms.length >> 1))})`;
  execFileSync('ffmpeg', ['-v', 'error', '-i', input, '-vf',
    `select='${select(lyricStills.map(s => `eq(n,${s.frame})`))}',scale=640:360`,
    '-fps_mode', 'vfr', '-frames:v', '129', '-start_number', '0', '-y', path.join(lyricDir, 'line_%03d.png')]);
  for (const still of lyricStills) assert(fs.statSync(path.join(ROOT, still.path)).size > 0);
  execFileSync('ffmpeg', ['-v', 'error', '-framerate', '1', '-i', path.join(lyricDir, 'line_%03d.png'),
    '-vf', 'tile=8x17:padding=4:color=0x303030', '-frames:v', '1', '-y', path.join(ROOT, 'out/sensetime_final_all_lyrics_keyframes.png')]);
}

const result = {
  passed: true, file: path.relative(ROOT, input), sha256: createHash('sha256').update(fs.readFileSync(input)).digest('hex'),
  width: video.width, height: video.height, fps: cfg.video.fps, frames, duration: Number(probe.format.duration),
  codec: video.codec_name, colorSpace: video.color_space, pixelFormat: video.pix_fmt, audioTracks: realLyrics ? 1 : 0,
  bytes: fs.statSync(input).size, comment: probe.format.tags.comment, completeDecode: true,
  flashReport: flash.trim(), lumaSummary: luma.split('\n')[0], syncReport: sync?.trim() ?? null, stills, lyricStills,
};
fs.writeFileSync(path.join(ROOT, realLyrics ? 'out/sensetime_final_video_check.json' : 'out/sensetime_video_check.json'), JSON.stringify(result, null, 2) + '\n');
console.log(`${mode} video passed: ${frames} frames, ${cfg.video.fps}fps, complete decode, flash checks and ${stills.length} decoded stills.`);
console.log(flash.trim());
console.log(result.lumaSummary);
