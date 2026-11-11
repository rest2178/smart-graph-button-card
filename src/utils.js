/**
 * Small shared helpers without DOM dependencies.
 */

const NUMERIC_RE = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;

/**
 * Strictly parse a value to a finite number.
 * Returns null for null/undefined/booleans/objects, non-numeric strings,
 * "unavailable", "unknown", NaN and ±Infinity.
 */
export function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (s === "" || !NUMERIC_RE.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** True when a value can be shown to the user without leaking undefined/null/NaN/Infinity. */
export function isDisplayable(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "object") return false;
  const s = String(value).trim();
  if (s === "") return false;
  return !/^(undefined|null|nan|[-+]?infinity)$/i.test(s);
}

/** Escape text for safe use inside HTML/SVG markup (text and attribute values). */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CSS_LENGTH_RE = /^-?(\d+\.?\d*|\.\d+)(px|%|em|rem|vh|vw|vmin|vmax|ch|ex)?$/i;
const CSS_FUNC_RE = /^(var|calc|min|max|clamp)\(.*\)$/i;

/** Validate/normalise a CSS length. Numbers become px. Returns null when invalid. */
export function toCssLength(value) {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (CSS_LENGTH_RE.test(s)) return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? `${s}px` : s;
  if (CSS_FUNC_RE.test(s) && !/[;{}<>]/.test(s)) return s;
  return null;
}

/** Validate a CSS shorthand made of up to 4 lengths (e.g. padding "8px 12px"). */
export function toCssBoxLength(value) {
  if (typeof value === "number") return toCssLength(value);
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (CSS_FUNC_RE.test(s) && !/[;{}<>]/.test(s)) return s;
  const parts = s.split(/\s+/);
  if (parts.length < 1 || parts.length > 4) return null;
  const out = parts.map(toCssLength);
  return out.every(Boolean) ? out.join(" ") : null;
}

/**
 * Left/right part of a CSS padding shorthand ("8px 12px" -> right "12px",
 * left "12px"). Function values (var/calc) are returned unchanged.
 */
export function paddingSide(padding, side) {
  if (typeof padding !== "string" || padding.trim() === "") return "0px";
  const s = padding.trim();
  if (s.includes("(")) return s;
  const p = s.split(/\s+/);
  if (side === "left") return p[3] ?? p[1] ?? p[0];
  if (side === "top") return p[0];
  if (side === "bottom") return p[2] ?? p[0];
  return p[1] ?? p[0];
}

/** Parse a CSS length in px (only px or unitless). Returns null otherwise. */
export function cssLengthToPx(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const m = /^(-?\d+\.?\d*|-?\.\d+)(px)?$/i.exec(value.trim());
  return m ? Number(m[1]) : null;
}

/** Very small check that a value is usable as a CSS color/token (no injection characters). */
export function isSafeCssValue(value) {
  return typeof value === "string" && value.trim() !== "" && !/[;{}<>]/.test(value) && value.length < 300;
}

export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Deep clone of plain objects and arrays (other values are returned as-is). */
export function deepClone(value) {
  if (Array.isArray(value)) return value.map(deepClone);
  if (isPlainObject(value)) {
    const out = {};
    for (const key of Object.keys(value)) out[key] = deepClone(value[key]);
    return out;
  }
  return value;
}

/**
 * Deep merge for plain objects; arrays and primitives from `override` replace
 * `base`. Always returns a fresh structure (inputs are never mutated/shared).
 */
export function mergeDeep(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return deepClone(override === undefined ? base : override);
  const out = deepClone(base);
  for (const key of Object.keys(override)) {
    const v = override[key];
    if (v === undefined) continue;
    out[key] = isPlainObject(v) && isPlainObject(out[key]) ? mergeDeep(out[key], v) : deepClone(v);
  }
  return out;
}

/** Clamp a number into [min, max]. */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
