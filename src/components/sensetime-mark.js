// Reference-derived infinity ribbon. Canvas and export SVG share the same paths.
export const MARK_FULL_RADIUS = 64;
export const RIBBON = [
  { d: 'M0 0 C-14 -28 -48 -28 -48 0 C-48 28 -14 28 0 0', role: 'brandRed' },
  { d: 'M0 0 C14 -28 48 -28 48 0 C48 28 14 28 0 0', role: 'brandGold' },
];
let paths;

export function infinityRibbon(ctx, { color = null, alpha = 1, compact = false } = {}) {
  paths ??= RIBBON.map(p => new Path2D(p.d));
  const g = ctx.g;
  g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = compact ? 11 : 9;
  RIBBON.forEach((p, i) => { g.strokeStyle = ctx.col(color ?? p.role, alpha); g.stroke(paths[i]); });
}

export function sensetimeMark(ctx, cx, cy, radius, { nominalRadius = radius, color = 'me', alpha = 1 } = {}) {
  if (alpha <= 0.003 || radius <= 0) return;
  const g = ctx.g;
  g.save(); g.translate(cx, cy); g.scale(radius * 0.014, radius * 0.014);
  infinityRibbon(ctx, { alpha, compact: nominalRadius < MARK_FULL_RADIUS,
    color: color === 'me' || color === 'meHot' ? null : color });
  g.restore();
}

export function markSvg({ compact = false } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -40 120 80"><g fill="none" stroke-width="${compact ? 11 : 9}" stroke-linecap="round" stroke-linejoin="round">${RIBBON.map(p => `<path d="${p.d}" stroke="${p.role === 'brandRed' ? '#c92b21' : '#f5cb63'}"/>`).join('')}</g></svg>\n`;
}
