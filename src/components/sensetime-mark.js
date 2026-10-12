// Original filled ribbon geometry, shared by SVG and live Canvas rendering.
import { MARK_DATA } from './sensetime-mark-data.js';
export const MARK_FULL_RADIUS = 64;
export const RIBBON = MARK_DATA.paths;
const COMPACT = ['a', 'c', 'g', 'p', 'r', 'v'];
const pathCache = new Map();
const pathOf = d => { if (!pathCache.has(d)) pathCache.set(d, new Path2D(d)); return pathCache.get(d); };
const roleOf = p => ['c', 'g', 'r'].includes(p.class) ? 'brandGold' : 'brandRed';
const rgb = hex => (hex.length === 4 ? [...hex.slice(1)].map(v => v + v).join('') : hex.slice(1)).match(/../g).map(v => parseInt(v, 16));

function gradient(ctx, id) {
  const { matrix: [a, b, , , x, y], stops } = MARK_DATA.gradients[id];
  const grad = ctx.g.createLinearGradient(x, y, x + a, y + b), sat = Math.max(0, Math.min(1, ctx.pal.sat));
  for (const [at, hex, opacity] of stops) {
    const source = rgb(hex), grey = source[0] * .2126 + source[1] * .7152 + source[2] * .0722;
    const c = source.map(v => Math.round(grey + (v - grey) * sat));
    grad.addColorStop(at, `rgba(${c.join(',')},${opacity})`);
  }
  return grad;
}

export function infinityRibbon(ctx, { color = null, alpha = 1, compact = false } = {}) {
  const g = ctx.g;
  g.save(); g.globalAlpha *= alpha;
  const mono = color ?? (ctx.pal.sat < 0.03 ? 'me' : null);
  for (const p of RIBBON) {
    if ((compact || mono) && !COMPACT.includes(p.class)) continue;
    const id = /url\(#(\w+)\)/.exec(p.fill)?.[1];
    g.fillStyle = mono ? ctx.col(mono) : compact ? ctx.col(roleOf(p)) : id ? gradient(ctx, id) : p.fill;
    g.fill(pathOf(p.d));
  }
  g.restore();
}

export function sensetimeMark(ctx, cx, cy, radius, { nominalRadius = radius, color = 'me', alpha = 1 } = {}) {
  if (alpha <= 0.003 || radius <= 0) return;
  const g = ctx.g;
  g.save(); g.translate(cx, cy); g.scale(radius * 1.4 / 1552, radius * 1.4 / 1552); g.translate(-776, -366);
  infinityRibbon(ctx, { alpha, compact: nominalRadius < MARK_FULL_RADIUS,
    color: color === 'me' || color === 'meHot' ? null : color });
  g.restore();
}

export function markSvg({ compact = false } = {}) {
  const defs = compact ? '' : `<defs>${Object.entries(MARK_DATA.gradients).map(([id, g]) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x2="1" gradientTransform="matrix(${g.matrix.join(',')})">${g.stops.map(([at, color, opacity]) => `<stop offset="${at}" stop-color="${color}" stop-opacity="${opacity}"/>`).join('')}</linearGradient>`).join('')}</defs>`;
  const paths = RIBBON.filter(p => !compact || COMPACT.includes(p.class)).map(p => `<path d="${p.d}" fill="${compact ? roleOf(p) === 'brandGold' ? '#fdd000' : '#e83820' : p.fill}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 1568 748">${defs}${paths}</svg>\n`;
}
