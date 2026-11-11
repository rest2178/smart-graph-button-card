/**
 * Text contrast helpers (WCAG 2.x relative luminance / contrast ratio).
 * Pure module – no DOM access. Colors are {r, g, b, a} with r/g/b 0–255, a 0–1.
 */
import { parseColor } from "./color-utils.js";

const SRGB_FN_RE = /^color\(\s*srgb\s+([-\d.e]+%?)\s+([-\d.e]+%?)\s+([-\d.e]+%?)\s*(?:\/\s*([\d.e]+%?)\s*)?\)$/i;

function unit(v) {
  const n = parseFloat(v);
  return v.endsWith("%") ? n / 100 : n;
}

/**
 * Parse a resolved CSS color as returned by getComputedStyle():
 * rgb()/rgba(), #hex and color(srgb r g b / a). Returns null for anything else
 * (the caller can fall back to a canvas for exotic formats like oklch()).
 */
export function parseCssColor(value) {
  if (typeof value !== "string") return null;
  const s = value.trim().toLowerCase();
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  const basic = parseColor(s);
  if (basic) return basic;
  const m = SRGB_FN_RE.exec(s);
  if (!m) return null;
  const ch = (v) => Math.max(0, Math.min(255, Math.round(unit(v) * 255)));
  const a = m[4] === undefined ? 1 : Math.max(0, Math.min(1, unit(m[4])));
  return { r: ch(m[1]), g: ch(m[2]), b: ch(m[3]), a };
}

/** Alpha-composite `top` over `bottom` (bottom is treated as opaque). */
export function composite(top, bottom) {
  const a = top.a ?? 1;
  const mixc = (t, b) => Math.round(t * a + b * (1 - a));
  return { r: mixc(top.r, bottom.r), g: mixc(top.g, bottom.g), b: mixc(top.b, bottom.b), a: 1 };
}

function lin(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance({ r, g, b }) {
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function isDark(color) {
  return luminance(color) < 0.18;
}

function toHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h / 6, s, l };
}

function fromHsl({ h, s, l }) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v, a: 1 };
  }
  const hue = (p, q, t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue(p, q, h + 1 / 3) * 255),
    g: Math.round(hue(p, q, h) * 255),
    b: Math.round(hue(p, q, h - 1 / 3) * 255),
    a: 1,
  };
}

/** Lowest contrast of `fg` against every background (fg alpha is composited onto each). */
export function minContrast(fg, backgrounds) {
  let min = Infinity;
  for (const bg of backgrounds) min = Math.min(min, contrastRatio(composite(fg, bg), bg));
  return min;
}

/**
 * Make `fg` readable on all `backgrounds` (opaque colors). Returns null when the
 * color already reaches `target`. Otherwise returns a color with the same hue
 * and saturation and a clearly readable lightness: the lightness closest to the
 * original that reaches `ideal` (comfortable reading), else the closest that
 * reaches `target`, else (e.g. text over a mid-tone graph) the most readable one.
 */
export function ensureContrast(fg, backgrounds, target = 4.5, ideal = target >= 4.5 ? 7 : 4.5) {
  if (!fg || !backgrounds.length) return null;
  if (minContrast(fg, backgrounds) >= target) return null;
  const hsl = toHsl(composite(fg, backgrounds[0]));
  let best = null;
  let bestRank = [-1, -Infinity];
  for (let i = 0; i <= 100; i++) {
    const cand = fromHsl({ ...hsl, l: i / 100 });
    const score = minContrast(cand, backgrounds);
    const dist = Math.abs(i / 100 - hsl.l);
    // rank: tier first (ideal > target > neither), then closeness / score
    const tier = score >= ideal ? 2 : score >= target ? 1 : 0;
    const rank = [tier, tier > 0 ? -dist : score];
    if (rank[0] > bestRank[0] || (rank[0] === bestRank[0] && rank[1] > bestRank[1])) {
      best = cand;
      bestRank = rank;
    }
  }
  return best;
}

export function rgbString({ r, g, b, a = 1 }) {
  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})` : `rgb(${r}, ${g}, ${b})`;
}

/** WCAG large text: ≥ 24px, or ≥ 18.66px bold. */
export function contrastTarget(fontSizePx, fontWeight) {
  const w = Number(fontWeight) || 400;
  return fontSizePx >= 24 || (fontSizePx >= 18.66 && w >= 700) ? 3 : 4.5;
}
