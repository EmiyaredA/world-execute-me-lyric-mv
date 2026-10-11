// Hand-drawn line art from the maker's Amadeus reference, not a font glyph.
// Coordinates share a 1000 x 650 sheet. No bitmap, texture or filled background.
export const MARK_CENTER = [510, 330];
export const MARK_SCALE = 0.76 / 470;
export const MARK_FULL_RADIUS = 64;

const FRAME = [
  'M70 455 L635 30 V340 L947 354 L899 468 H723 L544 627 V498 H350 V463 Z',
  'M151 430 L611 92 V346 M188 435 H262 M374 474 H568 V560 L671 470',
  'M323 333 L565 145 V305 H431 L392 333 Z',
];

// Squared lowercase m / a / d / e / u / s. The surrounding diagonal structure
// supplies the initial capital; the d shares its long upright with the structure.
const LETTERS = [
  'M0 90 V22 H58 Q84 22 84 48 V90 H67 V48 Q67 39 57 39 H51 V90 H34 V39 H17 V90 Z',
  'M0 22 H60 Q84 22 84 46 V90 H22 Q0 90 0 68 Q0 47 22 47 H67 V43 Q67 38 58 38 H0 Z M67 62 H24 Q17 62 17 69 Q17 76 24 76 H67 Z',
  'M67 -98 H84 V90 H23 Q0 90 0 68 V46 Q0 22 23 22 H67 Z M67 39 H24 Q17 39 17 47 V65 Q17 73 24 73 H67 Z',
  'M84 68 V90 H23 Q0 90 0 67 V45 Q0 22 23 22 H61 Q84 22 84 45 V61 H17 V67 Q17 73 25 73 H67 V68 Z M17 45 H67 V43 Q67 38 60 38 H24 Q17 38 17 43 Z',
  'M0 22 H17 V65 Q17 73 26 73 H67 V22 H84 V90 H24 Q0 90 0 66 Z',
  'M84 22 V39 H24 Q17 39 17 46 Q17 51 24 51 H60 Q84 51 84 71 Q84 90 60 90 H0 V73 H60 Q67 73 67 68 Q67 62 60 62 H24 Q0 62 0 44 Q0 22 24 22 Z',
];

export const FULL_MARK = [
  ...FRAME.map(d => ({ d, x: 0, y: 0 })),
  ...LETTERS.map((d, i) => ({ d, x: 282 + i * 100, y: 370 })),
];
export const COMPACT_MARK = [
  { d: 'M85 453 L633 46 V348 H930 L891 455 H714 L546 606 V482 H357 V453 Z', x: 0, y: 0 },
  { d: 'M286 331 L554 132 V310 H406 L378 331 Z', x: 0, y: 0 },
];

const cache = new Map();
const pathOf = d => {
  if (!cache.has(d)) cache.set(d, new Path2D(d));
  return cache.get(d);
};

/** The nominal radius chooses detail; grow scales that version without swapping it. */
export function amadeusMark(ctx, cx, cy, radius, { nominalRadius = radius, color = 'me', alpha = 1 } = {}) {
  if (alpha <= 0.003 || radius <= 0) return;
  const full = nominalRadius >= MARK_FULL_RADIUS, g = ctx.g, scale = radius * MARK_SCALE;
  g.save();
  g.translate(cx, cy); g.scale(scale, scale); g.translate(-MARK_CENTER[0], -MARK_CENTER[1]);
  g.lineJoin = 'miter'; g.miterLimit = 2; g.lineCap = 'butt';
  g.lineWidth = Math.max(full ? 7 : 15, (full ? 1 : 1.3) / scale);
  g.strokeStyle = ctx.col(color, alpha);
  for (const { d, x, y } of full ? FULL_MARK : COMPACT_MARK) {
    g.save(); g.translate(x, y); g.stroke(pathOf(d)); g.restore();
  }
  g.restore();
}

/** Standalone transparent SVGs use exactly the Canvas paths for inspection/export. */
export function markSvg({ compact = false, color = '#c64b52' } = {}) {
  const paths = compact ? COMPACT_MARK : FULL_MARK;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650"><g fill="none" stroke="${color}" stroke-width="${compact ? 15 : 7}" stroke-linejoin="miter" stroke-miterlimit="2">${paths.map(({ d, x, y }) => `<path d="${d}" transform="translate(${x} ${y})"/>`).join('')}</g></svg>\n`;
}
