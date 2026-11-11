/**
 * Color helpers for the editor's color picker.
 * Pure module – no DOM access.
 */

const HEX_RE = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_RE = /^rgba?\(\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i;

function channel(v) {
  const n = v.endsWith("%") ? (parseFloat(v) / 100) * 255 : parseFloat(v);
  return Math.max(0, Math.min(255, Math.round(n)));
}

function alpha(v) {
  if (v === undefined) return 1;
  const n = v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 1;
}

/** Parse #rgb, #rgba, #rrggbb, #rrggbbaa, rgb() and rgba(). Returns {r,g,b,a} or null. */
export function parseColor(value) {
  if (typeof value !== "string") return null;
  const s = value.trim();
  const hex = HEX_RE.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? Math.round((parseInt(h.slice(6, 8), 16) / 255) * 1000) / 1000 : 1,
    };
  }
  const rgb = RGB_RE.exec(s);
  if (rgb) return { r: channel(rgb[1]), g: channel(rgb[2]), b: channel(rgb[3]), a: alpha(rgb[4]) };
  return null;
}

/** #rrggbb for the native color picker (alpha is dropped). */
export function toHex({ r, g, b }) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Value to store after a color was picked with the mouse. A previously
 * configured transparency (rgba / #rrggbbaa) is kept, otherwise #rrggbb.
 */
export function applyPickedColor(previous, pickedHex) {
  const picked = parseColor(pickedHex);
  if (!picked) return previous;
  const old = parseColor(previous);
  if (old && old.a < 1) return `rgba(${picked.r}, ${picked.g}, ${picked.b}, ${old.a})`;
  return toHex(picked);
}
