// SenseTime: upright reference-derived line art inside a twelve-segment sensor ring.
// Keep the spark API so existing musical match cuts share this mark.
import { clamp } from '../engine/util.js';
import { sensetimeMark } from './sensetime-mark.js';
const TAU = Math.PI * 2;
export const RAYS = 12;

export function spark(ctx, cx, cy, r, { rays = RAYS, rot = 0, color = 'me', off = 'mute', alpha = 1, lit = 1, grow = 1, pulse = null, core = 0.1, offAlpha = 0.35, nominalRadius = r } = {}) {
  if (alpha <= 0.003 || r <= 0 || grow <= 0) return;
  const g = ctx.g, radius = r * grow, width = Math.max(1.5, radius * 0.105);
  g.save(); g.lineCap = 'butt'; g.lineWidth = width;
  for (let i = 0; i < rays; i++) {
    const on = clamp(lit * rays - i), a = rot + i * TAU / rays - Math.PI / 2;
    const span = TAU / rays * 0.73, rr = radius * (pulse ? 0.88 + 0.12 * pulse(i) : 1);
    g.beginPath(); g.arc(cx, cy, rr - width / 2, a, a + span);
    g.strokeStyle = ctx.col(off, alpha * offAlpha); g.stroke();
    if (on > 0) {
      g.beginPath(); g.arc(cx, cy, rr - width / 2, a, a + span * on);
      g.strokeStyle = ctx.col(color, alpha); g.stroke();
    }
  }
  // The infinity ribbon stays upright while the sensor ring turns.
  if (core > 0) sensetimeMark(ctx, cx, cy, radius, { nominalRadius,
    color: lit > 0 ? color : off, alpha: alpha * (lit > 0 ? 1 : offAlpha) });
  g.restore();
}

export function thinking(ctx, cx, cy, r, t, { color = 'me', alpha = 1, speed = 1, stuck = 0 } = {}) {
  const q = 12 - 9 * clamp(stuck), tt = stuck > 0 ? Math.floor(t * q) / q : t;
  spark(ctx, cx, cy, r, { color, alpha, rot: tt * 0.5 * speed, pulse: (i) => 0.66 + 0.34 * Math.sin(tt * 7 * speed - i * 0.62) });
}

export function sparkTips(cx, cy, r, rot = 0, rays = RAYS) {
  return Array.from({ length: rays }, (_, i) => {
    const a = rot + (i + 0.365) / rays * TAU - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

export function sparkOutline(cx, cy, r, { rot = 0, n = 180 } = {}) {
  return Array.from({ length: n }, (_, i) => {
    const a = rot + i / n * TAU - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

export function burst(ctx, cx, cy, r, k, { color = 'text', rays = RAYS, alpha = 1, rot = 0 } = {}) {
  if (k <= 0 || k >= 1) return;
  const g = ctx.g, rr = r * (0.35 + 0.65 * (1 - (1 - k) ** 3));
  g.save(); g.strokeStyle = ctx.col(color, alpha * (1 - k));
  g.lineWidth = Math.max(1.5, r * 0.07 * (1 - k));
  for (let i = 0; i < rays; i++) {
    const a = rot + i / rays * TAU;
    g.beginPath(); g.arc(cx, cy, rr, a, a + TAU / rays * 0.55 * (1 - k)); g.stroke();
  }
  g.restore();
}
