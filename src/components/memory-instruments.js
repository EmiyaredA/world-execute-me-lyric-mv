// Amadeus memory instruments. Pure drawings: clocks and fixed seeds come from the shot.
import { rand } from '../engine/prng.js';
import { clamp } from '../engine/util.js';
import { trace } from '../engine/shapes.js';

/** Nixie-style glass digits; numeric fractions roll without changing the clock or flickering. */
export function nixieDigits(ctx, x, y, value, { digits = 4, size = 72, color = 'text', alpha = 1, lit = 1, overflow = 0 } = {}) {
  const cw = ctx.cw(size), w = cw * digits, h = size * 1.08;
  const n = Math.max(0, Number(value) || 0), integer = Math.floor(n), fraction = n - integer;
  for (let i = 0; i < digits; i++) {
    const xx = x + i * cw, unit = 10 ** (digits - i - 1), digit = Math.floor(integer / unit) % 10;
    const light = clamp(lit * digits - i), rolling = integer % unit === unit - 1 ? fraction : 0;
    ctx.rrect(xx + 2, y - h + 6, cw - 4, h + 16, Math.min(15, cw * 0.2), { fill: 'bg', fillAlpha: 0.55, stroke: 'sub', strokeAlpha: 0.35, alpha, width: 1.5 });
    ctx.line(xx + cw * 0.24, y + 22, xx + cw * 0.24, y + 30, { color: 'sub', alpha: 0.4 * alpha, width: 2 });
    ctx.line(xx + cw * 0.76, y + 22, xx + cw * 0.76, y + 30, { color: 'sub', alpha: 0.4 * alpha, width: 2 });
    for (let ghost = 0; ghost < 10; ghost++) ctx.text(String(ghost), xx + cw / 2, y, { size: size * 0.82, font: 'mono', weight: 300, align: 'center', color: 'sub', alpha: alpha * 0.018 });
    const ink = overflow > 0 ? 'err' : color;
    const draw = () => ctx.clip({ x: xx + 2, y: y - h + 6, w: cw - 4, h: h + 8 }, () => {
      ctx.text(String(digit), xx + cw / 2, y - rolling * h, { size: size * 0.82, font: 'mono', weight: 400, align: 'center', color: ink, alpha: alpha * light });
      if (rolling > 0) ctx.text(String((digit + 1) % 10), xx + cw / 2, y + (1 - rolling) * h, { size: size * 0.82, font: 'mono', weight: 400, align: 'center', color: ink, alpha: alpha * light });
    });
    ctx.glow(ink, Math.min(18, size * 0.18), draw, 0.3 * light);
    ctx.line(xx + cw * 0.22, y - h + 14, xx + cw * 0.22, y - h * 0.53, { color: 'text', alpha: 0.11 * alpha, width: 1.5 });
  }
  return w;
}

/** Stable, widely spaced scan lines. No resizing or reading pixels; content remains sharp. */
export function scanField(ctx, r, t, { strength = 1, dim = 0.3, seed = 0, moving = true } = {}) {
  const a = clamp(strength);
  if (a < 0.003) return;
  ctx.clip(r, () => {
    ctx.rect(r.x, r.y, r.w, r.h, { fill: true, color: 'bg', alpha: dim * a });
    for (let y = r.y + 6; y < r.y + r.h; y += 14) ctx.line(r.x, y, r.x + r.w, y, { color: 'sub', width: 1.5, alpha: a * 0.07 });
    const u = moving ? ((t * 0.14 + rand(812, seed)) % 1 + 1) % 1 : 0.5;
    const y = r.y + u * r.h;
    ctx.gradRect(r.x, y - 40, r.w, 80, [[0, 'text', 0], [0.5, 'text', 0.035 * a], [1, 'text', 0]]);
    ctx.line(r.x, y, r.x + r.w, y, { color: 'text', width: 2, alpha: 0.1 * a });
  });
}

/** Oscilloscope-like neural signal; stopped input becomes a flat trace. */
export function signalTrace(ctx, r, t, { alpha = 1, color = 'text', activity = 1, running = true, seed = 0 } = {}) {
  const phase = running ? t * 1.6 : 0, points = [];
  for (let i = 0; i <= 120; i++) {
    const u = i / 120, z = (u * 4 - phase + rand(813, seed) + 1000) % 1;
    const pulse = Math.exp(-(((z - 0.38) / 0.045) ** 2)) - 0.55 * Math.exp(-(((z - 0.46) / 0.065) ** 2));
    points.push([r.x + u * r.w, r.y + r.h / 2 - activity * r.h * (0.3 * pulse + 0.04 * Math.sin(u * 65 + phase))]);
  }
  ctx.line(r.x, r.y + r.h / 2, r.x + r.w, r.y + r.h / 2, { color: 'line', alpha: 0.65 * alpha, width: 1 });
  ctx.poly(points, { color, width: 2, alpha });
}

/** Twelve distinct routes, all ending at the same unavailable reply node. */
export function attemptRoute(round, seed = 20161011) {
  const i = clamp(Math.floor(round), 0, 11);
  const lane = 0.1 + i * 0.067;
  return [[0, 0.5], [0.12, 0.5], [0.24, lane], [0.48 + 0.12 * rand(814, seed, i), lane], [0.78, 0.5], [1, 0.5]];
}

export function attemptPaths(ctx, r, round, progress, { seed = 20161011, alpha = 1 } = {}) {
  for (let i = 0; i <= round; i++) {
    const pts = attemptRoute(i, seed).map(([x, y]) => [r.x + x * r.w, r.y + y * r.h]);
    const active = i === round;
    ctx.poly(active ? trace(pts, clamp(progress)) : pts, { color: active ? 'err' : 'meDim', width: active ? 2.5 : 1.5, alpha: alpha * (active ? 0.85 : 0.22) });
  }
  const x = r.x + r.w, y = r.y + r.h * 0.5;
  ctx.circle(r.x, y, 5, { fill: true, color: 'text', alpha });
  ctx.circle(x, y, 9, { color: 'err', width: 2, alpha });
  ctx.line(x - 6, y - 6, x + 6, y + 6, { color: 'err', width: 1.5, alpha });
  ctx.text('NO REPLY', x, y + r.h * 0.5 + 23, { size: 19, font: 'mono', color: 'sub', align: 'right', alpha });
}

/** Archive strip uses the original seven spatial stops, but only the current end has records. */
export function archiveStrip(ctx, art, scroll, gy, stops, { scale = 0.86, alpha = 1 } = {}) {
  const box = (cx, valid, index) => {
    const r = { x: cx - 158, y: gy - 332, w: 316, h: 310 };
    if (r.x > 1980 || r.x + r.w < -60) return;
    ctx.rrect(r.x, r.y, r.w, r.h, 10, { fill: 'panel', fillAlpha: 0.45, stroke: valid ? 'sub' : 'line', alpha, width: 2 });
    ctx.text(valid ? 'CURRENT ARCHIVE' : 'NO RECORD', cx, r.y + 34, { size: 21, font: 'mono', align: 'center', color: valid ? 'text' : 'sub', alpha });
    if (valid) {
      art.inks(ctx, 'f_bust', { x: cx - 77, y: r.y + 46, w: 154, h: 205 }, { alpha: alpha * 0.75, plates: [{ ink: 'all', role: 'meDim' }, { ink: 'black', role: 'panel', alpha: 1 }] });
      signalTrace(ctx, { x: r.x + 16, y: r.y + 256, w: r.w - 32, h: 34 }, 0, { color: 'text', alpha: alpha * 0.65, seed: index, running: false });
    } else {
      ctx.g.save(); ctx.g.setLineDash([9, 10]);
      ctx.line(r.x + 26, r.y + 164, r.x + r.w - 26, r.y + 164, { color: 'sub', width: 1.5, alpha: alpha * 0.5 });
      ctx.g.restore();
      ctx.text('outside saved memory', cx, r.y + 262, { size: 16, font: 'mono', align: 'center', color: 'mute', alpha });
    }
  };
  box(scroll + 90 * scale, true, 0);
  for (let i = 2; i < stops.length; i++) box(scroll + stops[i] * scale, false, i);
  const edge = scroll + stops[1] * scale;
  ctx.line(edge, gy - 362, edge, gy + 18, { color: 'me', width: 2, alpha });
  ctx.text('RECORD LIMIT', edge - 12, gy - 350, { size: 18, font: 'mono', color: 'sub', align: 'right', alpha });
}
