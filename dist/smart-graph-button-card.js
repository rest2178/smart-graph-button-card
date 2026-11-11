/*! Smart Graph Button Card v1.3.0 | MIT License | no external dependencies */

// ---- src/styles.js
const __m_styles_js = (() => {
/**
 * Card styles. Layer order (z-index):
 *   0  base background (ha-card background)
 *   1/2 state background / graph (swappable via layers.graph_above_state_background)
 *   3  readability overlay
 *   4  content (icon, name, values)
 *   5  focus / hover / pressed effects
 */
const CARD_STYLES = `
:host {
  display: block;
  min-width: 0;
}

ha-card.sgbc {
  position: relative;
  display: block;
  box-sizing: border-box;
  height: var(--sgbc-height, 64px);
  min-width: min(var(--sgbc-min-width, 180px), 100%);
  max-width: 100%;
  overflow: var(--sgbc-overflow, hidden);
  border-radius: var(--sgbc-border-radius, var(--ha-card-border-radius, 14px));
  border: var(--sgbc-border-width, 1px) solid var(--sgbc-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
  background: var(--sgbc-background, var(--ha-card-background, var(--card-background-color, #fff)));
  color: var(--primary-text-color);
  cursor: pointer;
  isolation: isolate;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: box-shadow 160ms ease;
}
ha-card.sgbc.no-action { cursor: default; }
ha-card.sgbc.auto-height { height: auto; min-height: 48px; }

.layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
}
.state-bg {
  z-index: var(--sgbc-z-state, 1);
  background: var(--sgbc-state-background, transparent);
  transition: background-color 240ms ease;
}
.graph {
  z-index: var(--sgbc-z-graph, 2);
  overflow: hidden;
  opacity: var(--sgbc-graph-opacity, 0.6);
  color: var(--secondary-text-color);
}
.graph svg, .icon-graph svg { display: block; width: 100%; height: 100%; overflow: hidden; }
.graph.pos-full { inset: 0; }
.graph.pos-left { inset: 0 auto 0 0; width: var(--sgbc-graph-width, 50%); border-radius: inherit; border-top-right-radius: 0; border-bottom-right-radius: 0; }
.graph.pos-after-icon {
  inset: 0 0 0 auto;
  left: calc(var(--sgbc-graph-pad, 12px) + var(--sgbc-icon-area-size, 42px) + var(--sgbc-graph-icon-offset, 0px));
  border-radius: inherit;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.graph.pos-after-icon.mirror {
  inset: 0 auto 0 0;
  left: 0;
  right: calc(var(--sgbc-graph-pad, 12px) + var(--sgbc-icon-area-size, 42px) + var(--sgbc-graph-icon-offset, 0px));
  border-radius: inherit;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.graph.pos-right { inset: 0 0 0 auto; width: var(--sgbc-graph-width, 50%); border-radius: inherit; border-top-left-radius: 0; border-bottom-left-radius: 0; }
.graph.pos-bottom { inset: auto 0 0 0; height: var(--sgbc-graph-height, 35%); border-top-left-radius: 0; border-top-right-radius: 0; }
.graph.pos-custom {
  inset: auto;
  left: var(--sgbc-graph-left, 0%);
  top: var(--sgbc-graph-top, 0%);
  width: var(--sgbc-graph-width, 100%);
  height: var(--sgbc-graph-height, 100%);
  border-radius: 0;
}
.graph.pos-icon-area, .graph.hidden { display: none; }
/* soft fade of the graph start (left) and end (right) into the background */
.graph.fade, .icon-graph.fade {
  --sgbc-fade-mask: linear-gradient(to right,
    transparent 0,
    rgba(0, 0, 0, 0.12) calc(var(--sgbc-fade-start, 0%) * 0.3),
    rgba(0, 0, 0, 0.5) calc(var(--sgbc-fade-start, 0%) * 0.6),
    #000 var(--sgbc-fade-start, 0%),
    #000 calc(100% - var(--sgbc-fade-end, 0%)),
    rgba(0, 0, 0, 0.5) calc(100% - var(--sgbc-fade-end, 0%) * 0.6),
    rgba(0, 0, 0, 0.12) calc(100% - var(--sgbc-fade-end, 0%) * 0.3),
    transparent 100%);
  -webkit-mask-image: var(--sgbc-fade-mask);
  mask-image: var(--sgbc-fade-mask);
}

.overlay { z-index: 3; background: var(--sgbc-overlay-color, transparent); }
.overlay.hidden { display: none; }

.content {
  position: relative;
  z-index: 4;
  box-sizing: border-box;
  height: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--sgbc-gap, 10px);
  padding: var(--sgbc-padding, 8px 12px);
  min-width: 0;
}
.content.icon-right { grid-template-columns: minmax(0, 1fr) auto; }
.content.icon-right .icon-wrap { order: 2; }
.content.no-icon { grid-template-columns: minmax(0, 1fr); }

.icon-wrap { position: relative; flex: none; line-height: 0; }
.icon-area {
  position: relative;
  box-sizing: border-box;
  width: var(--sgbc-icon-area-size, 42px);
  height: var(--sgbc-icon-area-size, 42px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: var(--sgbc-icon-background, transparent);
  color: var(--sgbc-icon-color, var(--state-icon-color, var(--secondary-text-color)));
  transition: background-color 240ms ease, color 240ms ease;
}
.icon-area.shape-rounded-square { border-radius: 28%; }
.icon-area.shape-square { border-radius: 0; }
.icon-area.shape-none { background: transparent; border-radius: 0; }
.icon-area .icon-graph { position: absolute; inset: 0; z-index: 0; opacity: var(--sgbc-graph-opacity, 0.6); }
.icon-area .icon-graph.hidden { display: none; }
.icon-area .glyph { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; line-height: 0; }
.icon-area ha-icon, .icon-area ha-state-icon {
  --mdc-icon-size: var(--sgbc-icon-size, 22px);
  width: var(--sgbc-icon-size, 22px);
  height: var(--sgbc-icon-size, 22px);
  color: var(--sgbc-icon-color, var(--state-icon-color, var(--secondary-text-color)));
  display: inline-flex;
}
.icon-area .svg-icon { width: var(--sgbc-icon-size, 22px); height: var(--sgbc-icon-size, 22px); color: var(--sgbc-icon-color, var(--state-icon-color, var(--secondary-text-color))); }
.icon-area .svg-icon svg { width: 100%; height: 100%; fill: currentColor; }
.icon-area img.picture { width: 100%; height: 100%; object-fit: cover; display: block; }
.icon-area.has-picture { background: transparent; }
.badge {
  position: absolute;
  right: -3px;
  bottom: -3px;
  z-index: 2;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  background: var(--sgbc-background, var(--ha-card-background, var(--card-background-color, #fff)));
  color: var(--error-color, #db4437);
  box-shadow: 0 0 0 1px var(--sgbc-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
  --mdc-icon-size: 14px;
}
.badge.visible { display: flex; }

.info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  overflow: hidden;
}
.name {
  min-width: 0;
  font-size: var(--sgbc-name-size, 14px);
  font-weight: var(--sgbc-name-weight, 600);
  line-height: 1.25;
  color: var(--sgbc-name-color, var(--primary-text-color));
  text-align: var(--sgbc-name-align, left);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
}
.name.overflow-clip { text-overflow: clip; }
.name.multiline {
  white-space: normal;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--sgbc-name-lines, 2);
  line-clamp: var(--sgbc-name-lines, 2);
}
.values {
  min-width: 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: var(--sgbc-values-gap, 4px);
  font-size: var(--sgbc-values-size, 12px);
  line-height: 1.3;
  color: var(--sgbc-value-color, var(--secondary-text-color));
  overflow: hidden;
  white-space: nowrap;
  text-align: var(--sgbc-name-align, left);
}
.values.stacked { flex-direction: column; align-items: flex-start; gap: 0; }
.values.hidden { display: none; }
.value { display: inline-flex; align-items: center; gap: 3px; min-width: 0; max-width: 100%; }
.value.hidden, .sep.hidden { display: none; }
.value .value-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.value ha-icon { --mdc-icon-size: 14px; width: 14px; height: 14px; flex: none; display: inline-flex; }
.value ha-icon.hidden { display: none; }
.value-1 { color: var(--sgbc-value-1-color, var(--sgbc-value-color, var(--secondary-text-color))); font-size: var(--sgbc-value-1-size, inherit); font-weight: var(--sgbc-value-1-weight, inherit); }
.value-2 { color: var(--sgbc-value-2-color, var(--sgbc-value-color, var(--secondary-text-color))); font-size: var(--sgbc-value-2-size, inherit); font-weight: var(--sgbc-value-2-weight, inherit); flex-shrink: 0; }
.sep { flex: none; white-space: pre; opacity: 0.8; }

.state-unavailable .info, .state-unavailable .glyph { opacity: 0.6; }

/* ---- info variant: [icon name] on top, large value + small unit below */
.value .unit { flex: none; font-size: 0.5em; margin-left: 3px; color: var(--secondary-text-color); font-weight: 400; }
.value .unit.hidden { display: none; }
/* font sizes follow the card width, so 4 cards side by side still fit */
ha-card.sgbc.variant-info { container-type: inline-size; }
.info-layout .name { font-size: var(--sgbc-name-size, clamp(11px, 11cqi, 13px)); }
.content.info-layout {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 0;
}
.info-layout .info { justify-content: flex-start; gap: 1px; }
.info-layout .value-1 .unit { margin-left: 0; }
.info-head { display: flex; align-items: center; gap: 6px; min-width: 0; }
.info-head .name { flex: 1; }
.info-layout .icon-area { overflow: visible; }
.info-layout .badge { width: 9px; height: 9px; right: -3px; bottom: -1px; --mdc-icon-size: 9px; box-shadow: none; }
.info-layout .values { align-items: baseline; overflow: hidden; }
.info-layout .value-1 {
  align-items: baseline;
  font-size: var(--sgbc-value-1-size, clamp(13px, 19cqi, 24px));
  font-weight: var(--sgbc-value-1-weight, 400);
  line-height: 1.15;
  color: var(--sgbc-value-1-color, var(--sgbc-value-color, var(--primary-text-color)));
}
.info-layout .value-2 { font-size: var(--sgbc-value-2-size, var(--sgbc-values-size, 12px)); }

.effects { z-index: 5; transition: background-color 120ms ease, box-shadow 120ms ease; }
@media (hover: hover) {
  ha-card.sgbc:not(.no-action):hover .effects { background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
}
ha-card.sgbc.pressed .effects { background: color-mix(in srgb, var(--primary-text-color) 11%, transparent); }
ha-card.sgbc:focus-visible .effects { box-shadow: inset 0 0 0 2px var(--primary-color, #03a9f4); }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.anim-pulse { animation: sgbc-pulse var(--sgbc-anim-duration, 1.5s) ease-in-out infinite; }
.anim-rotate { animation: sgbc-rotate var(--sgbc-anim-duration, 1.5s) linear infinite; }
.anim-blink { animation: sgbc-blink var(--sgbc-anim-duration, 1.5s) steps(2, start) infinite; }
@keyframes sgbc-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.86); opacity: 0.7; } }
@keyframes sgbc-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes sgbc-blink { to { visibility: hidden; } }

@media (prefers-reduced-motion: reduce) {
  .anim-pulse, .anim-rotate, .anim-blink { animation: none !important; }
  ha-card.sgbc, .state-bg, .icon-area, .effects { transition: none !important; }
}

ha-card.sgbc-error {
  display: block;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: var(--ha-card-border-radius, 12px);
  border: 1px solid var(--error-color, #db4437);
  background: color-mix(in srgb, var(--error-color, #db4437) 10%, var(--card-background-color, #fff));
  color: var(--primary-text-color);
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
ha-card.sgbc-error .title { font-weight: 600; color: var(--error-color, #db4437); margin-bottom: 4px; }
`;
return { CARD_STYLES };
})();

// ---- src/utils.js
const __m_utils_js = (() => {
/**
 * Small shared helpers without DOM dependencies.
 */

const NUMERIC_RE = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;

/**
 * Strictly parse a value to a finite number.
 * Returns null for null/undefined/booleans/objects, non-numeric strings,
 * "unavailable", "unknown", NaN and ±Infinity.
 */
function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (s === "" || !NUMERIC_RE.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** True when a value can be shown to the user without leaking undefined/null/NaN/Infinity. */
function isDisplayable(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "object") return false;
  const s = String(value).trim();
  if (s === "") return false;
  return !/^(undefined|null|nan|[-+]?infinity)$/i.test(s);
}

/** Escape text for safe use inside HTML/SVG markup (text and attribute values). */
function escapeHtml(value) {
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
function toCssLength(value) {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (CSS_LENGTH_RE.test(s)) return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? `${s}px` : s;
  if (CSS_FUNC_RE.test(s) && !/[;{}<>]/.test(s)) return s;
  return null;
}

/** Validate a CSS shorthand made of up to 4 lengths (e.g. padding "8px 12px"). */
function toCssBoxLength(value) {
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
function paddingSide(padding, side) {
  if (typeof padding !== "string" || padding.trim() === "") return "0px";
  const s = padding.trim();
  if (s.includes("(")) return s;
  const p = s.split(/\s+/);
  if (side === "left") return p[3] ?? p[1] ?? p[0];
  return p[1] ?? p[0];
}

/** Parse a CSS length in px (only px or unitless). Returns null otherwise. */
function cssLengthToPx(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const m = /^(-?\d+\.?\d*|-?\.\d+)(px)?$/i.exec(value.trim());
  return m ? Number(m[1]) : null;
}

/** Very small check that a value is usable as a CSS color/token (no injection characters). */
function isSafeCssValue(value) {
  return typeof value === "string" && value.trim() !== "" && !/[;{}<>]/.test(value) && value.length < 300;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Deep clone of plain objects and arrays (other values are returned as-is). */
function deepClone(value) {
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
function mergeDeep(base, override) {
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
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
return { parseNumber, isDisplayable, escapeHtml, toCssLength, toCssBoxLength, paddingSide, cssLengthToPx, isSafeCssValue, isPlainObject, deepClone, mergeDeep, clamp };
})();

// ---- src/state-resolver.js
const __m_state_resolver_js = (() => {
/**
 * State evaluation: state groups (on/off/unavailable), custom state rules,
 * threshold ranges and color resolution.
 *
 * Pure module – no DOM access, fully testable in Node.
 */
const { parseNumber } = __m_utils_js;

const DEFAULT_STATE_MAPPING = Object.freeze({
  on: ["on", "open", "opening", "playing", "home", "heating", "cooling", "unlocked", "active", "cleaning"],
  off: ["off", "closed", "closing", "idle", "not_home", "locked", "paused", "standby", "docked"],
  unavailable: ["unavailable", "unknown"],
});

const STATE_GROUPS = ["on", "off", "unavailable", "other"];

const OPERATORS = ["==", "!=", ">", ">=", "<", "<=", "contains", "regex"];

const regexCache = new Map();

/** Normalise any state value to a comparable string. */
function normalizeState(value, caseSensitive = false) {
  if (value === null || value === undefined) return "";
  const s = String(value).trim();
  return caseSensitive ? s : s.toLowerCase();
}

/**
 * Determine the state group of a raw state.
 * Missing state (entity not found) => "unavailable".
 * States not contained in any group => "other".
 */
function getStateGroup(state, mapping = DEFAULT_STATE_MAPPING, caseSensitive = false) {
  if (state === null || state === undefined) return "unavailable";
  const s = normalizeState(state, caseSensitive);
  const map = mapping || DEFAULT_STATE_MAPPING;
  for (const group of ["unavailable", "on", "off"]) {
    const list = Array.isArray(map[group]) ? map[group] : [];
    for (const entry of list) {
      if (normalizeState(entry, caseSensitive) === s) return group;
    }
  }
  return "other";
}

function isUnavailableState(state) {
  if (state === null || state === undefined) return true;
  const s = normalizeState(state);
  return s === "unavailable" || s === "unknown";
}

function getRegex(pattern, caseSensitive) {
  const key = `${caseSensitive ? "s" : "i"}:${pattern}`;
  if (regexCache.has(key)) return regexCache.get(key);
  let re = null;
  try {
    re = new RegExp(String(pattern), caseSensitive ? "" : "i");
  } catch (_err) {
    re = null;
  }
  if (regexCache.size > 200) regexCache.clear();
  regexCache.set(key, re);
  return re;
}

/**
 * Compare a state against a value with the given operator.
 * ==, != compare numerically when both sides are numeric, otherwise as strings.
 * >, >=, <, <= require both sides to be numeric (otherwise false).
 */
function compareState(operator, state, value, caseSensitive = false) {
  const a = parseNumber(state);
  const b = parseNumber(value);
  const bothNumeric = a !== null && b !== null;
  switch (operator) {
    case "==":
      return bothNumeric ? a === b : normalizeState(state, caseSensitive) === normalizeState(value, caseSensitive);
    case "!=":
      return bothNumeric ? a !== b : normalizeState(state, caseSensitive) !== normalizeState(value, caseSensitive);
    case ">":
      return bothNumeric && a > b;
    case ">=":
      return bothNumeric && a >= b;
    case "<":
      return bothNumeric && a < b;
    case "<=":
      return bothNumeric && a <= b;
    case "contains":
      return normalizeState(state, caseSensitive).includes(normalizeState(value, caseSensitive));
    case "regex": {
      if (state === null || state === undefined) return false;
      const re = getRegex(value, caseSensitive);
      return re ? re.test(String(state)) : false;
    }
    default:
      return false;
  }
}

/**
 * Return the first custom state rule that matches, or null.
 * Rule: { operator, value, class?, color?, attribute?, entity? }
 * `resolveSource(rule)` may return a different raw value (entity/attribute).
 */
function matchCustomState(state, rules, { caseSensitive = false, resolveSource } = {}) {
  if (!Array.isArray(rules)) return null;
  for (const rule of rules) {
    if (!rule) continue;
    const source = typeof resolveSource === "function" ? resolveSource(rule, state) : state;
    if (compareState(rule.operator || "==", source, rule.value, caseSensitive)) return rule;
  }
  return null;
}

/**
 * Normalise threshold definitions into ranges [{from, to, color}].
 * Accepted inputs:
 *   - [{ value, color }, ...]          (value list, sorted ascending; from = value, to = next value)
 *   - [{ from, to, color }, ...]       (explicit ranges)
 *   - { ranges: [...] }                (top-level `thresholds` block)
 * Semantics: `from` inclusive, `to` exclusive, missing `to` = open upwards,
 * missing `from` = open downwards. First matching range wins.
 */
function normalizeThresholdRanges(input) {
  const list = Array.isArray(input) ? input : Array.isArray(input?.ranges) ? input.ranges : [];
  if (list.length === 0) return [];
  const isValueList = list.every((t) => t && t.value !== undefined && t.from === undefined && t.to === undefined);
  if (isValueList) {
    const sorted = list
      .map((t) => ({ value: parseNumber(t.value), color: t.color }))
      .filter((t) => t.value !== null)
      .sort((x, y) => x.value - y.value);
    return sorted.map((t, i) => ({
      from: t.value,
      to: i < sorted.length - 1 ? sorted[i + 1].value : null,
      color: t.color,
    }));
  }
  return list
    .filter(Boolean)
    .map((t) => ({
      from: t.from === undefined || t.from === null ? null : parseNumber(t.from),
      to: t.to === undefined || t.to === null ? null : parseNumber(t.to),
      color: t.color,
    }));
}

/** Return the color of the first range containing `value`, or null. */
function findThresholdColor(value, ranges) {
  const n = parseNumber(value);
  if (n === null || !Array.isArray(ranges)) return null;
  for (const r of ranges) {
    const fromOk = r.from === null || r.from === undefined || n >= r.from;
    const toOk = r.to === null || r.to === undefined || n < r.to;
    if (fromOk && toOk) return r.color ?? null;
  }
  return null;
}

/**
 * Resolve a color from a map keyed by state group / custom class.
 * Lookup order: custom class -> group -> (other => default -> on) -> default.
 * A plain string is returned as-is.
 */
function resolveColor(map, group, customClass) {
  if (map === null || map === undefined) return null;
  if (typeof map === "string") return map;
  if (typeof map !== "object") return null;
  if (customClass && map[customClass] !== undefined) return map[customClass];
  if (group && map[group] !== undefined) return map[group];
  // YAML 1.1 turns unquoted on/off keys into true/false
  if (group === "on" && map.true !== undefined) return map.true;
  if (group === "off" && map.false !== undefined) return map.false;
  if (group === "other") return map.default ?? map.on ?? null;
  return map.default ?? null;
}
return { DEFAULT_STATE_MAPPING, STATE_GROUPS, OPERATORS, normalizeState, getStateGroup, isUnavailableState, compareState, matchCustomState, normalizeThresholdRanges, findThresholdColor, resolveColor };
})();

// ---- src/graph-renderer.js
const __m_graph_renderer_js = (() => {
/**
 * Native SVG graph renderer. Produces an SVG markup string from reduced data.
 * All dynamic values are numbers or escaped strings – no injection possible.
 *
 * Pure module – no DOM access.
 */
const { escapeHtml, isDisplayable } = __m_utils_js;

const GRAPH_TYPES = ["line", "area", "smooth-area", "bar", "column", "stepped", "line-bar", "smooth-line-bar"];

const r2 = (n) => Math.round(n * 100) / 100;
const r4 = (n) => Math.round(n * 10000) / 10000;

/**
 * Compute the y-axis range.
 * - manual min/max win (numbers), "auto" otherwise
 * - constant values get a symmetric padding
 * - bar-like graphs include the zero baseline when auto
 */
function computeScale(values, { min = "auto", max = "auto", includeZero = false } = {}) {
  const finite = values.filter((v) => Number.isFinite(v));
  const manualMin = typeof min === "number" && Number.isFinite(min);
  const manualMax = typeof max === "number" && Number.isFinite(max);
  let lo = manualMin ? min : finite.length ? Math.min(...finite) : 0;
  let hi = manualMax ? max : finite.length ? Math.max(...finite) : 1;
  if (includeZero) {
    if (!manualMin && lo > 0) lo = 0;
    if (!manualMax && hi < 0) hi = 0;
  }
  if (hi < lo) {
    if (manualMin && !manualMax) hi = lo;
    else if (manualMax && !manualMin) lo = hi;
    else [lo, hi] = [hi, lo];
  }
  if (hi === lo) {
    const pad = lo === 0 ? 1 : Math.abs(lo) * 0.1;
    if (manualMin && !manualMax) hi = lo + pad;
    else if (manualMax && !manualMin) lo = hi - pad;
    else if (!manualMin && !manualMax) {
      lo -= pad;
      hi += pad;
    } else hi = lo + 1;
  } else if (!manualMax) {
    hi += (hi - lo) * 0.05; // small headroom
  }
  return { min: lo, max: hi };
}

/** Split indices into runs of consecutive non-null values. */
function runsOf(values) {
  const runs = [];
  let cur = null;
  values.forEach((v, i) => {
    if (Number.isFinite(v)) {
      if (!cur) {
        cur = [];
        runs.push(cur);
      }
      cur.push(i);
    } else cur = null;
  });
  return runs;
}

/**
 * Smooth SVG path through the points using monotone cubic interpolation
 * (Fritsch–Carlson / Steffen). Peaks and valleys are rounded but the curve
 * never overshoots the real values, so it always stays inside the plot area.
 */
function smoothPath(pts) {
  const n = pts.length;
  const f = (p) => `${r2(p[0])},${r2(p[1])}`;
  if (n < 3) return pts.map((p, k) => `${k ? "L" : "M"}${f(p)}`).join("");
  const dx = [];
  const m = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0] || 1e-9;
    m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i];
  }
  const t = new Array(n);
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) t[i] = 0; // local peak/valley: flat tangent => rounded tip
    else t[i] = (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  }
  let d = `M${f(pts[0])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${f([pts[i][0] + h, pts[i][1] + t[i] * h])} ${f([pts[i + 1][0] - h, pts[i + 1][1] - t[i + 1] * h])} ${f(pts[i + 1])}`;
  }
  return d;
}

/**
 * Render the graph.
 *
 * @param {object} o
 * @param {Array<{v:number|null}>} o.data        reduced buckets
 * @param {number} o.width, o.height              pixel size of the drawing area
 * @param {string} o.type                         line|area|smooth-area|bar|column|stepped|line-bar|smooth-line-bar
 * @param {{above:string,below:string,at?:number}} [o.sign] one color above, one below a value (default 0)
 * @param {string} o.color                        base color (already resolved)
 * @param {(v:number)=>string|null} [o.pointColor] per-point color function (thresholds per-point)
 * @param {{from:string,to:string,direction:string}} [o.gradient]
 * @returns {string} SVG markup or "" when nothing can be drawn
 */
function renderGraphSVG(o) {
  const width = Math.max(0, Math.floor(o.width || 0));
  const height = Math.max(0, Math.floor(o.height || 0));
  const data = Array.isArray(o.data) ? o.data : [];
  const values = data.map((d) => (d && Number.isFinite(d.v) ? d.v : null));
  if (!width || !height || !values.some((v) => v !== null)) return "";

  const type = GRAPH_TYPES.includes(o.type) ? o.type : "line";
  const id = String(o.idPrefix || "sgbc").replace(/[^a-zA-Z0-9_-]/g, "");
  const lineWidth = Math.max(0, Number(o.lineWidth ?? 2));
  const lineBar = type === "line-bar" || type === "smooth-line-bar";
  const barish = type === "bar" || type === "column" || lineBar;
  const smoothArea = type === "smooth-area";
  const filled = type === "area" || smoothArea || type === "stepped" || barish;
  // baseline "bottom": areas/bars grow from the bottom edge and the scale is
  // fitted to the data (e.g. temperature 20–28 °C instead of 0–28 °C)
  const bottomBase = o.baseline === "bottom";
  const scale = computeScale(values, { min: o.min, max: o.max, includeZero: filled && !bottomBase });

  const padTop = type === "bar" || type === "column" ? 0 : Math.ceil(lineWidth / 2) + (o.showPoints ? 2 : 0);
  const padBottom = type === "bar" || type === "column" ? 0 : Math.ceil(lineWidth / 2);
  const plotH = Math.max(1, height - padTop - padBottom);
  const span = scale.max - scale.min || 1;
  const yOf = (v) => {
    const clamped = Math.min(scale.max, Math.max(scale.min, v));
    return padTop + ((scale.max - clamped) / span) * plotH;
  };
  const baseValue = Math.min(scale.max, Math.max(scale.min, 0));
  const yBase = bottomBase ? height : yOf(baseValue);
  const n = values.length;
  const bucketW = width / n;
  // line-bar types: line points sit on the bar centres
  const xLine = (i) => (lineBar ? (i + 0.5) * bucketW : n === 1 ? width / 2 : (i / (n - 1)) * width);

  const color = isDisplayable(o.color) ? String(o.color) : "var(--sgbc-graph-color, var(--primary-color, #03a9f4))";
  const defs = [];
  const body = [];
  let paint = escapeHtml(color);

  // Gradient color mode
  if (o.gradient && isDisplayable(o.gradient.from) && isDisplayable(o.gradient.to)) {
    const horizontal = o.gradient.direction === "horizontal";
    defs.push(
      `<linearGradient id="${id}-grad" gradientUnits="userSpaceOnUse" x1="0" y1="${horizontal ? 0 : height}" x2="${horizontal ? width : 0}" y2="0">` +
        `<stop offset="0" style="stop-color:${escapeHtml(o.gradient.from)}"/>` +
        `<stop offset="1" style="stop-color:${escapeHtml(o.gradient.to)}"/></linearGradient>`
    );
    paint = `url(#${id}-grad)`;
  }

  // Per-point colors for line-like paths: horizontal hard-stop gradient
  const perPoint = typeof o.pointColor === "function";
  const colorAt = (v) => {
    const c = perPoint && v !== null ? o.pointColor(v) : null;
    return isDisplayable(c) ? String(c) : color;
  };
  let linePaint = paint;
  if (perPoint && (!barish || lineBar)) {
    const stops = [];
    let prev = color;
    values.forEach((v, i) => {
      const c = v === null ? prev : colorAt(v);
      prev = c;
      let from;
      let to;
      if (type === "stepped" || lineBar) {
        from = i / n;
        to = (i + 1) / n;
      } else {
        from = n === 1 ? 0 : Math.max(0, (i - 0.5) / (n - 1));
        to = n === 1 ? 1 : Math.min(1, (i + 0.5) / (n - 1));
      }
      stops.push(`<stop offset="${r2(from)}" style="stop-color:${escapeHtml(c)}"/>`, `<stop offset="${r2(to)}" style="stop-color:${escapeHtml(c)}"/>`);
    });
    defs.push(`<linearGradient id="${id}-pp" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${width}" y2="0">${stops.join("")}</linearGradient>`);
    linePaint = `url(#${id}-pp)`;
  }

  // Sign mode: one color above and one below the split value (default 0).
  // A vertical hard-stop gradient switches exactly at the split line, even
  // in the middle of a line segment.
  let signInfo = null;
  if (o.sign && isDisplayable(o.sign.above) && isDisplayable(o.sign.below)) {
    const at = Number(o.sign.at);
    const split = Number.isFinite(at) ? at : 0;
    const f = Math.min(1, Math.max(0, yOf(split) / height));
    signInfo = { split, f, above: String(o.sign.above), below: String(o.sign.below) };
    const a = escapeHtml(signInfo.above);
    const b = escapeHtml(signInfo.below);
    defs.push(
      `<linearGradient id="${id}-sign" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${height}">` +
        `<stop offset="0" style="stop-color:${a}"/><stop offset="${r4(f)}" style="stop-color:${a}"/>` +
        `<stop offset="${r4(f)}" style="stop-color:${b}"/><stop offset="1" style="stop-color:${b}"/></linearGradient>`
    );
    paint = `url(#${id}-sign)`;
    linePaint = paint;
  }

  // Grid & axis
  if (o.showGrid) {
    for (const f of [0.25, 0.5, 0.75]) {
      const y = r2(padTop + plotH * f);
      body.push(`<line class="grid" x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" shape-rendering="crispEdges"/>`);
    }
  }

  const fillOpacity = Math.min(1, Math.max(0, Number(o.fillOpacity ?? 0.25)));

  // Bars
  if (barish) {
    const gap = type === "column" ? 0 : Math.max(0, Number(o.barGap ?? 2));
    const requested = Number(o.barWidth);
    const barW = Math.max(1, Number.isFinite(requested) && requested > 0 ? Math.min(requested, bucketW) : bucketW - gap);
    const radius = type === "column" ? 0 : Math.max(0, Math.min(Number(o.barRadius ?? 1), barW / 2));
    const barOpacity = lineBar ? Math.max(fillOpacity, 0.35) : 1;
    values.forEach((v, i) => {
      if (v === null) return;
      const y = yOf(v);
      let top = Math.min(y, yBase);
      let h = Math.abs(yBase - y);
      if (h < 1 && v !== baseValue) {
        h = 1;
        if (y < yBase) top = yBase - 1;
      }
      if (h <= 0) return;
      const x = i * bucketW + (bucketW - barW) / 2;
      const fill = perPoint ? escapeHtml(colorAt(v)) : signInfo ? escapeHtml(v >= signInfo.split ? signInfo.above : signInfo.below) : paint;
      body.push(
        `<rect class="bar" x="${r2(x)}" y="${r2(top)}" width="${r2(barW)}" height="${r2(h)}"${radius ? ` rx="${r2(radius)}"` : ""} style="fill:${fill}"${barOpacity < 1 ? ` fill-opacity="${r2(barOpacity)}"` : ""}/>`
      );
    });
  }

  // Lines / areas / steps
  // smooth-area: fill fades from full strength (far from zero) to almost
  // transparent at the zero line, in the line color(s).
  let areaFill = linePaint;
  let areaOpacity = fillOpacity;
  if (smoothArea && !perPoint && !(o.gradient && isDisplayable(o.gradient.from))) {
    const fBase = yBase / height;
    const minOp = 0.04;
    const op = (f) => {
      if (f <= fBase) return fBase <= 0 ? minOp : fillOpacity + (minOp - fillOpacity) * (f / fBase);
      return fBase >= 1 ? minOp : minOp + (fillOpacity - minOp) * ((f - fBase) / (1 - fBase));
    };
    const top = signInfo ? signInfo.above : color;
    const bottom = signInfo ? signInfo.below : color;
    const entries = [{ o: 0, r: 1 }, { o: fBase, r: 1 }, { o: 1, r: 1 }];
    if (signInfo) entries.push({ o: signInfo.f, r: 0 }, { o: signInfo.f, r: 2 });
    entries.sort((x, y) => x.o - y.o || x.r - y.r);
    const stops = entries.map((e) => {
      let c = top;
      if (signInfo) c = e.r === 0 ? top : e.r === 2 ? bottom : e.o < signInfo.f ? top : bottom;
      return `<stop offset="${r4(e.o)}" style="stop-color:${escapeHtml(c)};stop-opacity:${r2(op(e.o))}"/>`;
    });
    defs.push(`<linearGradient id="${id}-afill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${height}">${stops.join("")}</linearGradient>`);
    areaFill = `url(#${id}-afill)`;
    areaOpacity = 1;
  }

  if (type === "line" || type === "area" || smoothArea || type === "stepped" || lineBar) {
    const runs = runsOf(values);
    const linePaths = [];
    const areaPaths = [];
    const isolated = [];
    for (const run of runs) {
      if (type === "stepped") {
        let d = "";
        run.forEach((i, k) => {
          const x0 = r2(i * bucketW);
          const x1 = r2((i + 1) * bucketW);
          const y = r2(yOf(values[i]));
          d += k === 0 ? `M${x0},${y}H${x1}` : `V${y}H${x1}`;
        });
        linePaths.push(d);
        const first = r2(run[0] * bucketW);
        areaPaths.push(`${d}V${r2(yBase)}H${first}Z`);
        continue;
      }
      if (run.length === 1 && n > 1) {
        isolated.push(run[0]);
        continue;
      }
      const pts = n === 1 ? [[0, yOf(values[0])], [width, yOf(values[0])]] : run.map((i) => [xLine(i), yOf(values[i])]);
      const d = type === "smooth-line-bar" || smoothArea ? smoothPath(pts) : pts.map((p, k) => `${k ? "L" : "M"}${r2(p[0])},${r2(p[1])}`).join("");
      linePaths.push(d);
      areaPaths.push(`${d}L${r2(pts[pts.length - 1][0])},${r2(yBase)}L${r2(pts[0][0])},${r2(yBase)}Z`);
    }
    if (type === "area" || type === "stepped" || smoothArea) {
      for (const d of areaPaths) body.push(`<path class="area" d="${d}" style="fill:${areaFill}" fill-opacity="${r2(areaOpacity)}" stroke="none"/>`);
    }
    if (lineWidth > 0) {
      for (const d of linePaths) {
        body.push(`<path class="line" d="${d}" fill="none" style="stroke:${linePaint}" stroke-width="${r2(lineWidth)}" stroke-linejoin="round" stroke-linecap="round"/>`);
      }
    }
    for (const i of isolated) {
      body.push(`<circle class="point" cx="${r2(xLine(i))}" cy="${r2(yOf(values[i]))}" r="${r2(Math.max(1.5, lineWidth))}" style="fill:${perPoint ? escapeHtml(colorAt(values[i])) : paint}"/>`);
    }
    if (o.showPoints) {
      values.forEach((v, i) => {
        if (v === null) return;
        const cx = type === "stepped" ? (i + 0.5) * bucketW : xLine(i);
        body.push(`<circle class="point" cx="${r2(cx)}" cy="${r2(yOf(v))}" r="${r2(Math.max(1.5, lineWidth))}" style="fill:${perPoint ? escapeHtml(colorAt(v)) : paint}"/>`);
      });
    }
  }

  if (o.showAxis) {
    const y = r2(yBase);
    body.push(`<line class="axis" x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="currentColor" stroke-opacity="0.3" stroke-width="1" shape-rendering="crispEdges"/>`);
  }

  if (o.showLabels) {
    const fmt = typeof o.labelFormatter === "function" ? o.labelFormatter : (v) => String(Math.round(v * 100) / 100);
    const maxL = fmt(scale.max);
    const minL = fmt(scale.min);
    if (isDisplayable(maxL)) {
      body.push(`<text class="label" x="${width - 3}" y="10" text-anchor="end" font-size="9" fill="currentColor" fill-opacity="0.7">${escapeHtml(maxL)}</text>`);
    }
    if (isDisplayable(minL)) {
      body.push(`<text class="label" x="${width - 3}" y="${height - 3}" text-anchor="end" font-size="9" fill="currentColor" fill-opacity="0.7">${escapeHtml(minL)}</text>`);
    }
  }

  const opacity = Math.min(1, Math.max(0, Number(o.opacity ?? 1)));
  defs.push(`<clipPath id="${id}-clip"><rect x="0" y="0" width="${width}" height="${height}"/></clipPath>`);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true" focusable="false">` +
    `<defs>${defs.join("")}</defs>` +
    `<g clip-path="url(#${id}-clip)"${opacity < 1 ? ` opacity="${r2(opacity)}"` : ""}>${body.join("")}</g></svg>`
  );
}
return { GRAPH_TYPES, computeScale, smoothPath, renderGraphSVG };
})();

// ---- src/data-reducer.js
const __m_data_reducer_js = (() => {
/**
 * Data reduction for graph rendering: time-based buckets with
 * average / min / max / last / sum aggregation.
 *
 * Input points: sorted array of { t: epoch ms, v: number | null }.
 * A `null` value marks a gap (unavailable/unknown/non-numeric state).
 *
 * fill = "hold" (default): a sensor value is valid until the next change
 *        (step function, like Home Assistant history). `average` is
 *        time-weighted.
 * fill = "gap":  only samples inside a bucket count; empty buckets are gaps.
 *
 * Pure module – no DOM access.
 */

const AGGREGATIONS = ["average", "min", "max", "last", "sum"];
const FILL_MODES = ["hold", "gap"];

/**
 * @param {Array<{t:number,v:number|null}>} points sorted ascending by t
 * @param {{start:number,end:number,buckets:number,aggregation?:string,fill?:string}} opts
 * @returns {Array<{t:number,start:number,end:number,v:number|null}>}
 */
function reduceSeries(points, { start, end, buckets, aggregation = "average", fill = "hold" } = {}) {
  const n = Math.max(1, Math.floor(Number(buckets) || 0));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
  const list = Array.isArray(points) ? points : [];
  const size = (end - start) / n;
  const out = new Array(n);
  const hold = fill !== "gap";

  let idx = 0;
  let current = null; // value carried into the next bucket (hold mode)
  while (idx < list.length && list[idx].t < start) {
    current = list[idx].v;
    idx++;
  }

  for (let b = 0; b < n; b++) {
    const bs = start + b * size;
    const be = b === n - 1 ? end : bs + size;
    const isLast = b === n - 1;

    let wSum = 0;
    let wTotal = 0;
    let segMin = Infinity;
    let segMax = -Infinity;
    let sSum = 0;
    let sCount = 0;
    let sMin = Infinity;
    let sMax = -Infinity;
    let sLast = null;

    let cursor = bs;
    let segVal = current;

    const addSegment = (val, from, to) => {
      if (val === null || val === undefined || !(to > from)) return;
      wSum += val * (to - from);
      wTotal += to - from;
      if (val < segMin) segMin = val;
      if (val > segMax) segMax = val;
    };

    while (idx < list.length && (list[idx].t < be || (isLast && list[idx].t <= be))) {
      const p = list[idx];
      if (hold) addSegment(segVal, cursor, p.t);
      cursor = p.t;
      segVal = p.v;
      if (p.v !== null && p.v !== undefined) {
        sSum += p.v;
        sCount++;
        if (p.v < sMin) sMin = p.v;
        if (p.v > sMax) sMax = p.v;
        sLast = p.v;
      }
      idx++;
    }

    let v = null;
    if (hold) {
      addSegment(segVal, cursor, be);
      // A sample exactly at the bucket end still counts for min/max.
      if (sCount > 0) {
        if (sMin < segMin) segMin = sMin;
        if (sMax > segMax) segMax = sMax;
      }
      current = segVal;
      switch (aggregation) {
        case "min":
          v = segMin === Infinity ? null : segMin;
          break;
        case "max":
          v = segMax === -Infinity ? null : segMax;
          break;
        case "last":
          v = segVal ?? null;
          break;
        case "sum":
          v = sCount > 0 ? sSum : segVal === null || segVal === undefined ? null : 0;
          break;
        default:
          if (wTotal > 0) v = wSum / wTotal;
          else if (sCount > 0) v = sSum / sCount;
          else v = null;
      }
    } else {
      switch (aggregation) {
        case "min":
          v = sCount ? sMin : null;
          break;
        case "max":
          v = sCount ? sMax : null;
          break;
        case "last":
          v = sLast;
          break;
        case "sum":
          v = sCount ? sSum : null;
          break;
        default:
          v = sCount ? sSum / sCount : null;
      }
    }

    out[b] = { t: bs + (be - bs) / 2, start: bs, end: be, v: Number.isFinite(v) ? v : null };
  }
  return out;
}

/**
 * Append a live point to a sorted series (used between history refreshes).
 * Returns a new array; drops points older than `keepFrom` but keeps the last
 * point before it so that "hold" still knows the value at the window start.
 */
function appendPoint(points, point, keepFrom) {
  const list = Array.isArray(points) ? points.slice() : [];
  if (point && Number.isFinite(point.t)) {
    const last = list[list.length - 1];
    if (!last || point.t > last.t) list.push(point);
    else if (point.t === last.t) list[list.length - 1] = point;
  }
  if (Number.isFinite(keepFrom)) {
    let firstInside = list.findIndex((p) => p.t >= keepFrom);
    if (firstInside === -1) firstInside = list.length;
    const cut = Math.max(0, firstInside - 1);
    if (cut > 0) list.splice(0, cut);
  }
  return list;
}
return { AGGREGATIONS, FILL_MODES, reduceSeries, appendPoint };
})();

// ---- src/action-handler.js
const __m_action_handler_js = (() => {
/**
 * Gesture recognition (tap / hold / double-tap) and execution of
 * Home Assistant actions.
 *
 * GestureRecognizer is pure (injectable timers) and unit-tested.
 * bindActionHandler wires it to DOM pointer + keyboard events.
 * handleAction executes an action config using public hass APIs only.
 */

const ACTIONS = ["more-info", "toggle", "navigate", "url", "perform-action", "call-service", "assist", "fire-dom-event", "none"];

const DEFAULT_HOLD_TIME = 500;
const DEFAULT_DOUBLE_TAP_WINDOW = 250;
const MOVE_TOLERANCE = 12; // px – larger movement cancels (scrolling)

function hasAction(actionConfig) {
  return Boolean(actionConfig && actionConfig.action && actionConfig.action !== "none");
}

/**
 * Pure tap/hold/double-tap state machine.
 *  - hold fires once the hold time elapses while pressed; the following
 *    release does NOT trigger a tap
 *  - when a double-tap action exists, a single tap is delayed by the
 *    double-tap window; a second tap within the window fires only double_tap
 *  - without double-tap action, tap fires immediately on release
 */
class GestureRecognizer {
  constructor({
    holdTime = DEFAULT_HOLD_TIME,
    doubleTapWindow = DEFAULT_DOUBLE_TAP_WINDOW,
    hasHold = () => true,
    hasDoubleTap = () => false,
    onAction = () => {},
    onHoldStart = () => {},
    timers = { setTimeout: (...a) => setTimeout(...a), clearTimeout: (...a) => clearTimeout(...a) },
  } = {}) {
    this.holdTime = holdTime;
    this.doubleTapWindow = doubleTapWindow;
    this.hasHold = hasHold;
    this.hasDoubleTap = hasDoubleTap;
    this.onAction = onAction;
    this.onHoldStart = onHoldStart;
    this.timers = timers;
    this._pressed = false;
    this._held = false;
    this._holdTimer = null;
    this._tapTimer = null;
  }

  down() {
    this._pressed = true;
    this._held = false;
    this._clearHold();
    if (this.hasHold()) {
      this._holdTimer = this.timers.setTimeout(() => {
        this._holdTimer = null;
        if (!this._pressed) return;
        this._held = true;
        // a pending single tap is superseded by the hold
        this._clearTap();
        this.onHoldStart();
        this.onAction("hold");
      }, this.holdTime);
    }
  }

  up() {
    if (!this._pressed) return;
    this._pressed = false;
    this._clearHold();
    if (this._held) {
      this._held = false;
      return; // suppress tap after hold
    }
    if (this.hasDoubleTap()) {
      if (this._tapTimer !== null) {
        this._clearTap();
        this.onAction("double_tap");
      } else {
        this._tapTimer = this.timers.setTimeout(() => {
          this._tapTimer = null;
          this.onAction("tap");
        }, this.doubleTapWindow);
      }
    } else {
      this.onAction("tap");
    }
  }

  cancel() {
    this._pressed = false;
    this._held = false;
    this._clearHold();
  }

  /** Keyboard activation (Enter / Space) is always a direct tap. */
  key() {
    this.cancel();
    this._clearTap();
    this.onAction("tap");
  }

  destroy() {
    this.cancel();
    this._clearTap();
  }

  _clearHold() {
    if (this._holdTimer !== null) {
      this.timers.clearTimeout(this._holdTimer);
      this._holdTimer = null;
    }
  }

  _clearTap() {
    if (this._tapTimer !== null) {
      this.timers.clearTimeout(this._tapTimer);
      this._tapTimer = null;
    }
  }
}

/**
 * Bind pointer and keyboard events of `element` to a recognizer.
 * Returns an unbind function that removes every listener.
 */
function bindActionHandler(element, recognizer, { onPressChange = () => {} } = {}) {
  let startX = 0;
  let startY = 0;
  let activePointer = null;
  let spaceDown = false;

  const onPointerDown = (ev) => {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    if (activePointer !== null) return;
    activePointer = ev.pointerId;
    startX = ev.clientX;
    startY = ev.clientY;
    onPressChange(true);
    recognizer.down();
  };
  const onPointerUp = (ev) => {
    if (ev.pointerId !== activePointer) return;
    activePointer = null;
    onPressChange(false);
    recognizer.up();
  };
  const onPointerCancel = (ev) => {
    if (ev.pointerId !== activePointer) return;
    activePointer = null;
    onPressChange(false);
    recognizer.cancel();
  };
  const onPointerMove = (ev) => {
    if (ev.pointerId !== activePointer) return;
    if (Math.abs(ev.clientX - startX) > MOVE_TOLERANCE || Math.abs(ev.clientY - startY) > MOVE_TOLERANCE) {
      onPointerCancel(ev);
    }
  };
  const onContextMenu = (ev) => {
    // Prevent the long-press context menu on touch devices when hold is used.
    if (recognizer.hasHold()) ev.preventDefault();
  };
  const onKeyDown = (ev) => {
    if (ev.target !== element) return;
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (!ev.repeat) recognizer.key();
    } else if (ev.key === " " || ev.key === "Spacebar") {
      ev.preventDefault(); // no page scroll
      spaceDown = true;
      onPressChange(true);
    }
  };
  const onKeyUp = (ev) => {
    if (ev.key === " " || ev.key === "Spacebar") {
      if (!spaceDown) return;
      spaceDown = false;
      ev.preventDefault();
      onPressChange(false);
      recognizer.key();
    }
  };
  const onBlur = () => {
    spaceDown = false;
    onPressChange(false);
  };

  const listeners = [
    ["pointerdown", onPointerDown],
    ["pointerup", onPointerUp],
    ["pointercancel", onPointerCancel],
    ["pointerleave", onPointerCancel],
    ["pointermove", onPointerMove, { passive: true }],
    ["contextmenu", onContextMenu],
    ["keydown", onKeyDown],
    ["keyup", onKeyUp],
    ["blur", onBlur],
  ];
  for (const [type, fn, opts] of listeners) element.addEventListener(type, fn, opts);
  return () => {
    for (const [type, fn, opts] of listeners) element.removeEventListener(type, fn, opts);
    recognizer.destroy();
  };
}

function fireEvent(node, type, detail, target = node) {
  const ev = new CustomEvent(type, { bubbles: true, composed: true, cancelable: false, detail });
  target.dispatchEvent(ev);
  return ev;
}

function haptic(type = "light") {
  try {
    window.dispatchEvent(new CustomEvent("haptic", { detail: type }));
  } catch (_err) {
    /* ignore */
  }
}

const TOGGLE_DOMAINS = new Set([
  "automation", "climate", "cover", "fan", "group", "humidifier", "input_boolean", "light",
  "media_player", "remote", "siren", "switch", "valve", "water_heater",
]);

/** Domain specific toggle service (mirrors the behaviour of native HA cards). */
function getToggleService(entityId, stateObj) {
  const domain = String(entityId || "").split(".")[0];
  switch (domain) {
    case "lock":
      return ["lock", stateObj?.state === "locked" ? "unlock" : "lock"];
    case "button":
    case "input_button":
      return [domain, "press"];
    case "scene":
    case "script":
      return [domain, "turn_on"];
    default:
      return TOGGLE_DOMAINS.has(domain) ? [domain, "toggle"] : ["homeassistant", "toggle"];
  }
}

function isToggleableDomain(entityId) {
  const domain = String(entityId || "").split(".")[0];
  return TOGGLE_DOMAINS.has(domain) || ["lock", "button", "input_button", "scene", "script"].includes(domain);
}

function needsConfirmation(actionConfig, hass) {
  const c = actionConfig.confirmation;
  if (!c) return false;
  if (typeof c === "object" && Array.isArray(c.exemptions) && hass?.user?.id) {
    if (c.exemptions.some((e) => e && e.user === hass.user.id)) return false;
  }
  return true;
}

/**
 * Execute the action configured for `gesture` ("tap" | "hold" | "double_tap").
 * @param {HTMLElement} node  card element (event origin)
 * @param {object} hass
 * @param {object} config     full card config (entity + *_action)
 * @param {string} gesture
 */
async function handleAction(node, hass, config, gesture) {
  const actionConfig = config?.[`${gesture}_action`];
  if (!hasAction(actionConfig) || !hass) return;

  if (needsConfirmation(actionConfig, hass)) {
    const text =
      (typeof actionConfig.confirmation === "object" && actionConfig.confirmation.text) ||
      `Aktion „${actionConfig.action}“ wirklich ausführen?`;
    haptic("warning");
    // eslint-disable-next-line no-alert
    if (!window.confirm(text)) return;
  }

  const entityId = actionConfig.entity || config.entity;
  switch (actionConfig.action) {
    case "more-info": {
      if (!entityId) return;
      fireEvent(node, "hass-more-info", { entityId });
      break;
    }
    case "toggle": {
      if (!entityId) return;
      const [domain, service] = getToggleService(entityId, hass.states?.[entityId]);
      await callService(hass, domain, service, { entity_id: entityId });
      haptic("light");
      break;
    }
    case "navigate": {
      const path = actionConfig.navigation_path;
      if (!path) return;
      if (actionConfig.navigation_replace) window.history.replaceState(window.history.state, "", path);
      else window.history.pushState(null, "", path);
      fireEvent(window, "location-changed", { replace: Boolean(actionConfig.navigation_replace) }, window);
      haptic("light");
      break;
    }
    case "url": {
      const url = actionConfig.url_path;
      if (!url) return;
      window.open(url, actionConfig.new_tab === false ? "_self" : "_blank", "noopener");
      break;
    }
    case "perform-action":
    case "call-service": {
      const name = actionConfig.perform_action || actionConfig.service;
      if (typeof name !== "string" || !name.includes(".")) return;
      const [domain, service] = name.split(".", 2);
      const data = { ...(actionConfig.data || actionConfig.service_data || {}) };
      await callService(hass, domain, service, data, actionConfig.target);
      haptic("light");
      break;
    }
    case "assist": {
      // Version dependent: the native frontend handles the "hass-action" event
      // and opens the Assist dialog. Without a listener nothing happens.
      fireEvent(node, "hass-action", {
        config: { entity: entityId, tap_action: { ...actionConfig } },
        action: "tap",
      });
      break;
    }
    case "fire-dom-event": {
      fireEvent(node, "ll-custom", actionConfig);
      break;
    }
    default:
      break;
  }
}

async function callService(hass, domain, service, data, target) {
  try {
    if (target && typeof target === "object") await hass.callService(domain, service, data, target);
    else await hass.callService(domain, service, data);
  } catch (err) {
    haptic("failure");
    // eslint-disable-next-line no-console
    console.warn(`[smart-graph-button-card] ${domain}.${service} failed:`, err?.message || err);
  }
}
return { ACTIONS, DEFAULT_HOLD_TIME, DEFAULT_DOUBLE_TAP_WINDOW, hasAction, GestureRecognizer, bindActionHandler, getToggleService, isToggleableDomain, handleAction };
})();

// ---- src/value-formatter.js
const __m_value_formatter_js = (() => {
/**
 * Value formatting: numbers, dates, units, state mapping and a safe,
 * restricted template syntax. No eval(), no Function().
 *
 * Pure module – no DOM access.
 */
const { parseNumber, isDisplayable } = __m_utils_js;
const { isUnavailableState, normalizeThresholdRanges, findThresholdColor, resolveColor, normalizeState } = __m_state_resolver_js;

const DEFAULT_FALLBACK = "–";

const VALUE_TYPES = ["state", "attribute", "text", "name", "last_changed", "last_updated", "template"];
const VALUE_FORMATS = ["number", "integer", "duration", "relative", "datetime", "date", "time"];

const numberFormatCache = new Map();

/**
 * Determine the locale used for number formatting from the hass object,
 * honouring the user's "number format" profile setting where possible.
 */
function getNumberLocale(hass) {
  const language = hass?.locale?.language || hass?.language || undefined;
  switch (hass?.locale?.number_format) {
    case "comma_decimal":
      return "en-US";
    case "decimal_comma":
      return "de-DE";
    case "space_comma":
      return "fr-FR";
    case "system":
      return undefined;
    default:
      return language;
  }
}

function getLanguage(hass) {
  return hass?.locale?.language || hass?.language || undefined;
}

/**
 * Format a number. Returns null when the value is not a finite number.
 * decimals: integer => fixed digits; undefined => up to 2 digits.
 */
function formatNumber(value, { decimals, locale } = {}) {
  let n = parseNumber(value);
  if (n === null) return null;
  const fixed = Number.isInteger(decimals) && decimals >= 0 && decimals <= 20;
  const key = `${locale || ""}|${fixed ? decimals : "a"}`;
  let nf = numberFormatCache.get(key);
  if (!nf) {
    const opts = fixed
      ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
      : { maximumFractionDigits: 2 };
    try {
      nf = new Intl.NumberFormat(locale || undefined, opts);
    } catch (_err) {
      nf = new Intl.NumberFormat(undefined, opts);
    }
    numberFormatCache.set(key, nf);
  }
  // Avoid "-0" / "-0,00" after rounding.
  const digits = fixed ? decimals : 2;
  if (Number(n.toFixed(digits)) === 0) n = 0;
  const out = nf.format(n);
  return isDisplayable(out) ? out : null;
}

/** Format seconds as h:mm:ss (or m:ss below one hour). */
function formatDuration(seconds) {
  const n = parseNumber(seconds);
  if (n === null) return null;
  const neg = n < 0;
  let s = Math.round(Math.abs(n));
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  const pad = (x) => String(x).padStart(2, "0");
  const body = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  return neg ? `-${body}` : body;
}

function toDate(value) {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  if (typeof value !== "string" || value.trim() === "") return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? new Date(t) : null;
}

/** Relative time ("vor 5 Minuten"). */
function formatRelative(value, locale, now = Date.now()) {
  const d = toDate(value);
  if (!d) return null;
  const diff = (d.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  let rtf;
  try {
    rtf = new Intl.RelativeTimeFormat(locale || undefined, { numeric: "auto" });
  } catch (_err) {
    rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  }
  for (const [unit, secs] of units) {
    if (abs >= secs || unit === "second") {
      return rtf.format(Math.round(diff / secs), unit);
    }
  }
  return null;
}

/** Absolute date/time formatting. kind: datetime | date | time */
function formatDate(value, kind, locale) {
  const d = toDate(value);
  if (!d) return null;
  const opts =
    kind === "date"
      ? { dateStyle: "medium" }
      : kind === "time"
        ? { timeStyle: "short" }
        : { dateStyle: "medium", timeStyle: "short" };
  try {
    return new Intl.DateTimeFormat(locale || undefined, opts).format(d);
  } catch (_err) {
    return new Intl.DateTimeFormat(undefined, opts).format(d);
  }
}

const TEMPLATE_RE = /\{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*:\s*([^{}]*?))?\s*\}/g;

/**
 * Render a restricted template. Only `{variable}` and `{variable:argument}`
 * placeholders are replaced via the supplied resolver (object or function).
 * Unknown/empty placeholders become an empty string. No code execution.
 */
function renderTemplate(template, resolver) {
  if (typeof template !== "string") return "";
  return template.replace(TEMPLATE_RE, (_match, key, arg) => {
    const k = key.toLowerCase();
    let v;
    if (typeof resolver === "function") v = resolver(k, arg === undefined ? undefined : arg.trim());
    else if (resolver && Object.prototype.hasOwnProperty.call(resolver, k)) v = resolver[k];
    return isDisplayable(v) ? String(v) : "";
  });
}

/** True when a template string contains at least one placeholder. */
function isTemplate(value) {
  if (typeof value !== "string") return false;
  TEMPLATE_RE.lastIndex = 0;
  const result = TEMPLATE_RE.test(value);
  TEMPLATE_RE.lastIndex = 0;
  return result;
}

/** Look up a state mapping case-insensitively. Returns undefined when absent. */
function lookupStateMapping(mapping, raw, caseSensitive = false) {
  if (!mapping || typeof mapping !== "object" || raw === null || raw === undefined) return undefined;
  const key = normalizeState(raw, caseSensitive);
  for (const k of Object.keys(mapping)) {
    if (normalizeState(k, caseSensitive) === key) return mapping[k];
  }
  return undefined;
}

function joinUnit(text, unit) {
  if (!isDisplayable(unit)) return text;
  return `${text} ${unit}`;
}

function attributeToText(value) {
  if (Array.isArray(value)) {
    const parts = value.filter(isDisplayable).map(String);
    return parts.length ? parts.join(", ") : null;
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  return isDisplayable(value) ? String(value) : null;
}

function resolveUnit(cfg, stateObj) {
  const entityUnit = cfg.type === "attribute" ? undefined : stateObj?.attributes?.unit_of_measurement;
  if (cfg.use_entity_unit === true) return isDisplayable(entityUnit) ? entityUnit : cfg.unit;
  if (cfg.use_entity_unit === false) return cfg.unit;
  return cfg.unit !== undefined ? cfg.unit : entityUnit;
}

/**
 * Resolve a value definition (value_1 / value_2) to display data.
 *
 * @param {object} cfg    normalised value config
 * @param {object} hass   Home Assistant object
 * @param {object} ctx    { entityId, group, unavailableText, unknownText, now }
 * @returns {{hidden:boolean, text:string, color:string|null, numeric:number|null,
 *            unavailable:boolean, aria:string, entityId:string|undefined, isState:boolean}}
 */
function resolveValue(cfg, hass, ctx = {}) {
  const fallback = isDisplayable(cfg?.fallback) || cfg?.fallback === "" ? String(cfg.fallback) : DEFAULT_FALLBACK;
  const empty = (extra = {}) => ({
    hidden: false,
    text: fallback,
    color: null,
    numeric: null,
    unavailable: true,
    aria: cfg?.label ? `${cfg.label} ${fallback}` : fallback,
    entityId: undefined,
    isState: false,
    ...extra,
  });
  if (!cfg) return empty({ hidden: true });

  const type = cfg.type || "state";
  const entityId = cfg.entity || ctx.entityId;
  const stateObj = entityId ? hass?.states?.[entityId] : undefined;
  const locale = getNumberLocale(hass);
  const language = getLanguage(hass);
  const entityBased = type !== "text";
  const rawState = stateObj?.state;
  const unavailable = entityBased && (!stateObj || isUnavailableState(rawState));

  if (cfg.hide_if_unavailable && unavailable) return empty({ hidden: true, entityId });

  let raw;
  switch (type) {
    case "text":
      raw = cfg.text;
      break;
    case "name":
      raw = stateObj ? stateObj.attributes?.friendly_name ?? entityId : undefined;
      break;
    case "last_changed":
      raw = stateObj?.last_changed;
      break;
    case "last_updated":
      raw = stateObj?.last_updated;
      break;
    case "attribute":
      raw = stateObj?.attributes?.[cfg.attribute];
      break;
    case "template":
      raw = cfg.attribute ? stateObj?.attributes?.[cfg.attribute] : rawState;
      break;
    default:
      raw = rawState;
  }

  const numeric = parseNumber(raw);
  const unit = resolveUnit(cfg, stateObj);
  let valueText = null; // formatted value without unit
  let withUnit = null; // formatted value with unit (when applicable)

  const mapped = lookupStateMapping(cfg.state_mapping, raw);
  if (mapped !== undefined && isDisplayable(mapped)) {
    valueText = String(mapped);
    withUnit = valueText;
  } else if (type === "text") {
    valueText = isDisplayable(raw) ? String(raw) : null;
    withUnit = valueText;
  } else if (type === "name") {
    valueText = isDisplayable(raw) ? String(raw) : null;
    withUnit = valueText;
  } else if (type === "last_changed" || type === "last_updated" || ["relative", "datetime", "date", "time"].includes(cfg.format)) {
    const kind = cfg.format && cfg.format !== "number" && cfg.format !== "integer" && cfg.format !== "duration" ? cfg.format : "relative";
    valueText = kind === "relative" ? formatRelative(raw, language, ctx.now) : formatDate(raw, kind, language);
    withUnit = valueText;
  } else if (unavailable && (type === "state" || type === "template")) {
    const s = normalizeState(rawState);
    if (!stateObj) valueText = null;
    else if (s === "unknown" && isDisplayable(cfg.unknown_text ?? ctx.unknownText)) valueText = String(cfg.unknown_text ?? ctx.unknownText);
    else if (s === "unavailable" && isDisplayable(cfg.unavailable_text ?? ctx.unavailableText)) valueText = String(cfg.unavailable_text ?? ctx.unavailableText);
    else if (typeof hass?.formatEntityState === "function") valueText = safeCall(() => hass.formatEntityState(stateObj));
    else valueText = isDisplayable(rawState) ? String(rawState) : null;
    withUnit = valueText;
  } else if (numeric !== null) {
    if (cfg.format === "duration") {
      valueText = formatDuration(numeric);
      withUnit = valueText;
    } else {
      let decimals = cfg.format === "integer" ? 0 : cfg.decimals;
      if (decimals === undefined && type === "state") {
        const precision = hass?.entities?.[entityId]?.display_precision;
        if (Number.isInteger(precision)) decimals = precision;
      }
      valueText = formatNumber(numeric, { decimals, locale });
      withUnit = valueText === null ? null : joinUnit(valueText, unit);
    }
  } else if (type === "attribute") {
    if (raw !== undefined && typeof hass?.formatEntityAttributeValue === "function" && cfg.raw !== true) {
      valueText = safeCall(() => hass.formatEntityAttributeValue(stateObj, cfg.attribute));
    }
    if (!isDisplayable(valueText)) valueText = attributeToText(raw);
    withUnit = valueText === null ? null : joinUnit(valueText, cfg.unit);
  } else if (stateObj) {
    if (cfg.raw !== true && typeof hass?.formatEntityState === "function") {
      valueText = safeCall(() => hass.formatEntityState(stateObj));
    }
    if (!isDisplayable(valueText)) valueText = isDisplayable(raw) ? String(raw) : null;
    withUnit = valueText;
  }

  let text;
  if (cfg.template) {
    const vars = (key, arg) => {
      switch (key) {
        case "value":
          return valueText;
        case "unit":
          return unit;
        case "state": {
          const m = lookupStateMapping(cfg.state_mapping, rawState);
          if (m !== undefined) return m;
          if (stateObj && typeof hass?.formatEntityState === "function") return safeCall(() => hass.formatEntityState(stateObj));
          return rawState;
        }
        case "raw":
          return raw;
        case "name":
        case "friendly_name":
          return stateObj?.attributes?.friendly_name ?? entityId;
        case "entity_id":
          return entityId;
        case "attribute":
          return attributeToText(stateObj?.attributes?.[cfg.attribute]);
        case "attr":
          return arg ? attributeToText(stateObj?.attributes?.[arg]) : null;
        case "last_changed":
          return formatRelative(stateObj?.last_changed, language, ctx.now);
        case "last_updated":
          return formatRelative(stateObj?.last_updated, language, ctx.now);
        default:
          return null;
      }
    };
    const rendered = renderTemplate(cfg.template, vars).trim();
    text = rendered === "" ? null : rendered;
  } else {
    text = isDisplayable(withUnit) ? withUnit : null;
  }

  if (!isDisplayable(text)) return empty({ entityId, hidden: false, isState: type === "state" });

  const full = `${cfg.prefix ?? ""}${text}${cfg.suffix ?? ""}`;

  let color = null;
  if (cfg.thresholds) {
    color = findThresholdColor(numeric, normalizeThresholdRanges(cfg.thresholds));
  }
  if (!color && cfg.color) color = resolveColor(cfg.color, ctx.group, ctx.customClass);

  return {
    hidden: false,
    text: full,
    color,
    numeric,
    unavailable,
    aria: cfg.label ? `${cfg.label} ${full}` : full,
    entityId,
    isState: type === "state" && !cfg.template,
  };
}

function safeCall(fn) {
  try {
    const v = fn();
    return isDisplayable(v) ? String(v) : null;
  } catch (_err) {
    return null;
  }
}
return { DEFAULT_FALLBACK, VALUE_TYPES, VALUE_FORMATS, getNumberLocale, getLanguage, formatNumber, formatDuration, formatRelative, formatDate, renderTemplate, isTemplate, lookupStateMapping, resolveValue };
})();

// ---- src/history-provider.js
const __m_history_provider_js = (() => {
/**
 * History data access – the ONLY place that talks to Home Assistant's
 * history interfaces.
 *
 * Primary source (stable since HA 2022.x, used by HA's own frontend):
 *   WebSocket command "history/history_during_period"
 *   -> { [entity_id]: [ { s, a?, lu, lc? }, ... ] }   (compressed state format,
 *      lu / lc are epoch seconds; lc is omitted when equal to lu)
 *
 * Fallback (REST, documented in the HA REST API docs):
 *   GET /api/history/period/<start>?filter_entity_id=..&end_time=..
 *   -> [ [ { entity_id, state, attributes, last_changed, last_updated }, ... ] ]
 *
 * NOTE: The WebSocket command is used by the official frontend but is not part
 * of a formally versioned public API. Its response shape is therefore parsed
 * defensively, and any failure falls back to REST and finally to an empty
 * series – the card stays usable without a graph.
 *
 * Neither hass.callWS nor hass.callApi support AbortSignal. Stale responses
 * are therefore discarded by the caller (request token), identical requests
 * are de-duplicated (in-flight map) and results are cached.
 */
const { parseNumber, isPlainObject } = __m_utils_js;

const CACHE = new Map();
const INFLIGHT = new Map();
const MAX_CACHE_ENTRIES = 60;
let websocketUnsupported = false;

const MIN_UPDATE_INTERVAL = 10; // seconds

/** Cache key: entity, attribute, start, end, period (hours) and resolution. */
function buildCacheKey({ entityId, attribute, start, end, hours, resolution }) {
  return [entityId, attribute || "", start, end, hours, resolution || ""].join("|");
}

/**
 * Compute a request window aligned to the refresh granularity so that several
 * cards showing the same entity share one request and one cache entry.
 */
function computeWindow(hours, granularitySeconds, now = Date.now()) {
  const gran = Math.max(MIN_UPDATE_INTERVAL, Number(granularitySeconds) || MIN_UPDATE_INTERVAL) * 1000;
  const end = Math.ceil(now / gran) * gran;
  const start = end - hours * 3600 * 1000;
  return { start, end, ttl: gran };
}

function toMs(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value * 1000 : NaN;
  if (typeof value === "string") return Date.parse(value);
  return NaN;
}

function valueOf(state, attributes, attribute) {
  if (attribute) return parseNumber(attributes?.[attribute]);
  return parseNumber(state);
}

/**
 * Parse either response format into sorted points [{t, v}].
 * Non-numeric / unavailable / unknown / null values become v = null (gap marker).
 */
function parseHistoryResponse(raw, entityId, attribute) {
  const points = [];
  if (!raw) return points;

  if (isPlainObject(raw) && Array.isArray(raw[entityId])) {
    // WebSocket compressed format
    let lastAttrs;
    for (const e of raw[entityId]) {
      if (!e) continue;
      if (isPlainObject(e.a)) lastAttrs = e.a;
      const isCompressed = "s" in e || "lu" in e;
      const state = isCompressed ? e.s : e.state;
      const attrs = isCompressed ? (isPlainObject(e.a) ? e.a : lastAttrs) : e.attributes;
      let t;
      if (isCompressed) t = attribute ? toMs(e.lu) : toMs(e.lc ?? e.lu);
      else t = toMs(attribute ? e.last_updated ?? e.last_changed : e.last_changed ?? e.last_updated);
      if (!Number.isFinite(t)) continue;
      points.push({ t, v: valueOf(state, attrs, attribute) });
    }
  } else if (Array.isArray(raw)) {
    // REST format: array of arrays (one per entity)
    let series = raw.find((arr) => Array.isArray(arr) && arr.some((e) => e && e.entity_id === entityId));
    if (!series && raw.length === 1 && Array.isArray(raw[0])) series = raw[0];
    let lastAttrs;
    for (const e of series || []) {
      if (!e) continue;
      if (isPlainObject(e.attributes)) lastAttrs = e.attributes;
      const t = toMs(attribute ? e.last_updated ?? e.last_changed : e.last_changed ?? e.last_updated);
      if (!Number.isFinite(t)) continue;
      points.push({ t, v: valueOf(e.state, e.attributes ?? lastAttrs, attribute) });
    }
  }

  points.sort((a, b) => a.t - b.t);
  return points;
}

async function fetchViaWebsocket(hass, { entityId, attribute, start, end }) {
  const msg = {
    type: "history/history_during_period",
    start_time: new Date(start).toISOString(),
    end_time: new Date(end).toISOString(),
    entity_ids: [entityId],
    minimal_response: !attribute,
    no_attributes: !attribute,
    significant_changes_only: false,
  };
  const raw = await hass.callWS(msg);
  return parseHistoryResponse(raw, entityId, attribute);
}

async function fetchViaRest(hass, { entityId, attribute, start, end }) {
  const params = [
    `filter_entity_id=${encodeURIComponent(entityId)}`,
    `end_time=${encodeURIComponent(new Date(end).toISOString())}`,
    "significant_changes_only=0",
  ];
  if (!attribute) params.push("minimal_response", "no_attributes");
  const path = `history/period/${encodeURIComponent(new Date(start).toISOString())}?${params.join("&")}`;
  const raw = await hass.callApi("GET", path);
  return parseHistoryResponse(raw, entityId, attribute);
}

function isUnknownCommand(err) {
  const code = err?.code ?? err?.error?.code;
  return code === "unknown_command" || /unknown command/i.test(String(err?.message || ""));
}

function storeCache(key, entry) {
  CACHE.set(key, entry);
  while (CACHE.size > MAX_CACHE_ENTRIES) {
    const oldest = CACHE.keys().next().value;
    CACHE.delete(oldest);
  }
}

/**
 * Fetch history points for one entity.
 * Never throws: on failure resolves to { points: [], status: "error" }.
 *
 * @returns {Promise<{points:Array<{t:number,v:number|null}>, status:"ok"|"empty"|"error",
 *                    source:"websocket"|"rest"|"cache"|"none", start:number, end:number, error?:string}>}
 */
async function fetchHistory(hass, { entityId, attribute, hours, updateInterval, resolution, now } = {}) {
  const { start, end, ttl } = computeWindow(hours, updateInterval, now);
  const result = (points, status, source, error) => ({ points, status, source, start, end, error });

  if (!hass || !entityId || !(hours > 0)) return result([], "error", "none", "missing hass/entity");

  const key = buildCacheKey({ entityId, attribute, start, end, hours, resolution });
  const cached = CACHE.get(key);
  const nowMs = now ?? Date.now();
  if (cached && nowMs - cached.time < ttl) {
    return result(cached.points, cached.points.length ? "ok" : "empty", "cache");
  }
  if (INFLIGHT.has(key)) return INFLIGHT.get(key);

  const request = (async () => {
    let points = null;
    let source = "none";
    let lastError;
    if (!websocketUnsupported && typeof hass.callWS === "function") {
      try {
        points = await fetchViaWebsocket(hass, { entityId, attribute, start, end });
        source = "websocket";
      } catch (err) {
        lastError = err;
        if (isUnknownCommand(err)) websocketUnsupported = true;
      }
    }
    if (points === null && typeof hass.callApi === "function") {
      try {
        points = await fetchViaRest(hass, { entityId, attribute, start, end });
        source = "rest";
      } catch (err) {
        lastError = err;
      }
    }
    if (points === null) {
      return result([], "error", "none", String(lastError?.message || lastError || "history unavailable"));
    }
    storeCache(key, { time: Date.now(), points });
    return result(points, points.length ? "ok" : "empty", source);
  })();

  INFLIGHT.set(key, request);
  try {
    return await request;
  } finally {
    INFLIGHT.delete(key);
  }
}

/** Test/maintenance helper. */
function clearHistoryCache() {
  CACHE.clear();
  INFLIGHT.clear();
  websocketUnsupported = false;
}
return { MIN_UPDATE_INTERVAL, buildCacheKey, computeWindow, parseHistoryResponse, fetchHistory, clearHistoryCache };
})();

// ---- src/config-validator.js
const __m_config_validator_js = (() => {
/**
 * Configuration validation and normalisation.
 * validateConfig() returns a fully populated config object or throws a
 * ConfigError that lists every problem in a human readable way.
 *
 * Pure module – no DOM access.
 */
const { parseNumber, toCssLength, toCssBoxLength, isSafeCssValue, isPlainObject, mergeDeep, deepClone, clamp } = __m_utils_js;
const { DEFAULT_STATE_MAPPING, OPERATORS } = __m_state_resolver_js;
const { GRAPH_TYPES } = __m_graph_renderer_js;
const { AGGREGATIONS, FILL_MODES } = __m_data_reducer_js;
const { ACTIONS, DEFAULT_HOLD_TIME, DEFAULT_DOUBLE_TAP_WINDOW, isToggleableDomain } = __m_action_handler_js;
const { VALUE_TYPES, VALUE_FORMATS } = __m_value_formatter_js;
const { MIN_UPDATE_INTERVAL } = __m_history_provider_js;

const GRAPH_POSITIONS = ["full", "after-icon", "left", "right", "bottom", "icon-area", "custom"];
const COLOR_MODES = ["fixed", "state", "thresholds", "gradient", "sign"];
const THRESHOLD_MODES = ["current", "per-point"];
const ICON_SHAPES = ["circle", "rounded-square", "square", "none"];
const ICON_POSITIONS = ["left", "right"];
const ANIMATIONS = ["none", "pulse", "rotate", "blink"];
const VALUE_LAYOUTS = ["inline", "stacked"];
const COLOR_TARGETS = ["icon", "icon-background", "graph", "card-background", "name", "value-1", "value-2"];
const NAME_OVERFLOW = ["ellipsis", "clip", "wrap"];
const MAX_HOURS = 8760;
const VARIANTS = ["button", "info"];
const GRAPH_BASELINES = ["zero", "bottom"];

class ConfigError extends Error {
  constructor(errors) {
    const list = Array.isArray(errors) ? errors : [String(errors)];
    super(list.length === 1 ? list[0] : `Ungültige Konfiguration:\n• ${list.join("\n• ")}`);
    this.name = "ConfigError";
    this.errors = list;
  }
}

const ENTITY_RE = /^[a-z0-9_]+\.[a-zA-Z0-9_]+$/;

const DEFAULTS = Object.freeze({
  entity: undefined,
  state_entity: undefined,
  name: undefined,
  icon: undefined,
  picture: undefined,
  icon_svg: undefined,
  use_entity_picture: false,
  case_sensitive: false,
  state_mapping: DEFAULT_STATE_MAPPING,
  states: [],
  color_targets: ["icon", "icon-background"],
  unavailable_text: undefined,
  unknown_text: undefined,
  show_unavailable_badge: true,
  icon_area: {
    enabled: true,
    shape: "circle",
    size: "42px",
    icon_size: "22px",
    position: "left",
    color: {
      on: "var(--state-icon-active-color, var(--primary-color))",
      off: "var(--state-icon-color, var(--secondary-text-color))",
      unavailable: "var(--disabled-text-color, #6b7280)",
    },
    background: {
      on: "color-mix(in srgb, var(--sgbc-icon-color) 16%, transparent)",
      off: "color-mix(in srgb, var(--sgbc-icon-color) 12%, transparent)",
      unavailable: "color-mix(in srgb, var(--sgbc-icon-color) 10%, transparent)",
    },
    animation: { on: "none", off: "none", unavailable: "none", other: "none", duration: "1.5s" },
  },
  name_style: {
    font_size: "14px",
    font_weight: 600,
    color: "var(--primary-text-color)",
    overflow: "ellipsis",
    max_lines: 1,
    align: "left",
  },
  value_1: undefined,
  value_2: undefined,
  values: { layout: "inline", separator: " · ", gap: "4px", font_size: "12px" },
  graph: {
    enabled: false,
    entity: undefined,
    attribute: undefined,
    type: "line",
    position: "full",
    width: "50%",
    height: "35%",
    bounds: { left: "0%", top: "0%", width: "100%", height: "100%" },
    icon_offset: "0px",
    baseline: "zero",
    hours_to_show: 24,
    max_points: 60,
    aggregation: "average",
    fill: "hold",
    min: "auto",
    max: "auto",
    line_width: 2,
    bar_width: undefined,
    bar_gap: 2,
    bar_radius: 1,
    opacity: 0.6,
    fill_opacity: 0.25,
    show_points: false,
    show_grid: false,
    show_axis: false,
    show_labels: false,
    fade: undefined,
    fade_start: undefined,
    fade_end: undefined,
    color_mode: "state",
    color: "var(--sgbc-graph-color, var(--primary-color, #03a9f4))",
    colors: {
      on: "var(--state-icon-active-color, var(--primary-color))",
      off: "var(--secondary-text-color)",
      unavailable: "var(--disabled-text-color, #6b7280)",
    },
    thresholds: [],
    threshold_mode: "current",
    gradient: { from: "#22c55e", to: "#ef4444", direction: "vertical" },
    positive_color: "#a855f7",
    negative_color: "#22c55e",
    split_at: 0,
    update_interval: 300,
  },
  state_background: {
    enabled: false,
    colors: {
      on: "rgba(34, 197, 94, 0.14)",
      off: "transparent",
      unavailable: "rgba(107, 114, 128, 0.10)",
    },
  },
  layers: {
    graph_above_state_background: true,
    overlay: { enabled: false, color: "rgba(0, 0, 0, 0.04)" },
  },
  thresholds: undefined,
  layout: {
    height: "64px",
    min_width: "180px",
    padding: "8px 12px",
    gap: "10px",
    border_radius: "14px",
    border_width: "1px",
    border_color: "var(--divider-color)",
    overflow: "hidden",
    background: undefined,
  },
  tap_action: undefined,
  hold_action: { action: "more-info" },
  double_tap_action: { action: "none" },
  hold_time: DEFAULT_HOLD_TIME,
  double_tap_window: DEFAULT_DOUBLE_TAP_WINDOW,
});

/**
 * Defaults of the info variant (pure display card, e.g. temperature or
 * humidity): small icon + name on top, large value, graph at the bottom.
 * User values always win over these.
 */
const INFO_DEFAULTS = Object.freeze({
  icon_area: {
    shape: "none",
    size: "18px",
    icon_size: "16px",
    color: {
      on: "var(--secondary-text-color)",
      off: "var(--secondary-text-color)",
      other: "var(--secondary-text-color)",
      unavailable: "var(--disabled-text-color, #6b7280)",
    },
    background: { on: "transparent", off: "transparent", unavailable: "transparent" },
  },
  name_style: { font_weight: 500 },
  values: { font_size: "12px" },
  graph: {
    type: "smooth-area",
    position: "bottom",
    height: "40%",
    baseline: "bottom",
    color_mode: "fixed",
    color: "auto",
    line_width: 1.5,
    fill_opacity: 0.35,
    opacity: 1,
    max_points: 60,
  },
  layout: { padding: "8px 10px", min_width: "0px" },
  tap_action: { action: "more-info" },
  hold_action: { action: "none" },
});

const VALUE_DEFAULTS = Object.freeze({
  type: "state",
  prefix: "",
  suffix: "",
  fallback: "–",
  hide_if_unavailable: false,
});

/**
 * Validate and normalise a raw YAML config. Throws ConfigError.
 */
function validateConfig(raw) {
  const errors = [];
  const err = (msg) => errors.push(msg);

  if (!isPlainObject(raw)) throw new ConfigError("Die Konfiguration muss ein Objekt sein.");
  if (!raw.entity || typeof raw.entity !== "string") {
    throw new ConfigError("„entity“ fehlt. Bitte ein Haupt-Entity angeben, z. B. entity: switch.schreibtisch_1");
  }

  if (raw.variant !== undefined && !VARIANTS.includes(raw.variant)) {
    throw new ConfigError(`variant „${raw.variant}“ ist ungültig. Erlaubt: button, info.`);
  }
  const isInfo = raw.variant === "info";
  const c = mergeDeep(isInfo ? mergeDeep(DEFAULTS, INFO_DEFAULTS) : DEFAULTS, raw);
  c.variant = isInfo ? "info" : "button";
  // arrays / maps that must not be deep-merged with defaults
  const userMapping = isPlainObject(raw.state_mapping) ? { ...raw.state_mapping } : {};
  // YAML 1.1 turns unquoted on/off keys into true/false
  if (userMapping.true !== undefined && userMapping.on === undefined) userMapping.on = userMapping.true;
  if (userMapping.false !== undefined && userMapping.off === undefined) userMapping.off = userMapping.false;
  delete userMapping.true;
  delete userMapping.false;
  c.state_mapping = { ...DEFAULT_STATE_MAPPING, ...userMapping };

  // sections that must be objects
  for (const key of ["icon_area", "name_style", "values", "state_background", "layers", "layout"]) {
    if (!isPlainObject(c[key])) {
      if (key === "icon_area" && c[key] === false) c[key] = { ...deepClone(DEFAULTS.icon_area), enabled: false };
      else if (key === "state_background" && typeof c[key] === "boolean") c[key] = { ...deepClone(DEFAULTS.state_background), enabled: c[key] };
      else {
        err(`„${key}“ muss ein Objekt sein.`);
        c[key] = deepClone(DEFAULTS[key]);
      }
    }
  }
  if (!isPlainObject(c.layers.overlay)) c.layers.overlay = { ...deepClone(DEFAULTS.layers.overlay), enabled: Boolean(c.layers.overlay) };
  if (!isPlainObject(c.state_background.colors)) c.state_background.colors = deepClone(DEFAULTS.state_background.colors);

  checkEntity(c.entity, "entity", err);
  if (c.state_entity !== undefined) checkEntity(c.state_entity, "state_entity", err);

  for (const key of ["on", "off", "unavailable"]) {
    if (c.state_mapping[key] !== undefined && !Array.isArray(c.state_mapping[key])) {
      err(`state_mapping.${key} muss eine Liste von Zuständen sein.`);
    } else if (Array.isArray(c.state_mapping[key])) {
      c.state_mapping[key] = c.state_mapping[key].map((s) => String(s));
    }
  }

  // ---- name
  if (c.name !== undefined && typeof c.name !== "string") {
    if (!isPlainObject(c.name)) err("„name“ muss ein Text oder ein Objekt (entity/attribute/template) sein.");
    else if (c.name.entity !== undefined) checkEntity(c.name.entity, "name.entity", err);
  }
  if (!NAME_OVERFLOW.includes(c.name_style.overflow)) err(`name_style.overflow „${c.name_style.overflow}“ ist ungültig. Erlaubt: ${NAME_OVERFLOW.join(", ")}.`);
  c.name_style.max_lines = clamp(Math.floor(parseNumber(c.name_style.max_lines) ?? 1), 1, 5);
  c.name_style.font_size = cssLen(c.name_style.font_size, "name_style.font_size", err);
  if (!["left", "center", "right"].includes(c.name_style.align)) err("name_style.align muss left, center oder right sein.");

  // ---- custom states
  if (!Array.isArray(c.states)) err("„states“ muss eine Liste sein.");
  else {
    c.states.forEach((s, i) => {
      if (!isPlainObject(s)) return err(`states[${i}] muss ein Objekt sein.`);
      const op = s.operator ?? "==";
      if (!OPERATORS.includes(op)) err(`states[${i}].operator „${op}“ ist ungültig. Erlaubt: ${OPERATORS.join(", ")}.`);
      if (s.value === undefined) err(`states[${i}].value fehlt.`);
      if ([">", ">=", "<", "<="].includes(op) && parseNumber(s.value) === null) err(`states[${i}].value muss für „${op}“ eine Zahl sein.`);
      if (op === "regex") {
        try {
          new RegExp(String(s.value));
        } catch (_e) {
          err(`states[${i}].value ist kein gültiger regulärer Ausdruck.`);
        }
      }
      if (s.entity !== undefined) checkEntity(s.entity, `states[${i}].entity`, err);
      if (s.class !== undefined && !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(String(s.class))) err(`states[${i}].class darf nur Buchstaben, Ziffern, - und _ enthalten.`);
      if (s.color !== undefined && !isSafeCssValue(s.color)) err(`states[${i}].color ist keine gültige Farbe.`);
    });
  }

  // ---- color targets
  if (!Array.isArray(c.color_targets)) err("color_targets muss eine Liste sein.");
  else c.color_targets.forEach((t) => !COLOR_TARGETS.includes(t) && err(`color_targets: „${t}“ ist unbekannt. Erlaubt: ${COLOR_TARGETS.join(", ")}.`));

  // ---- icon area
  const ia = c.icon_area;
  if (!ICON_SHAPES.includes(ia.shape)) err(`icon_area.shape „${ia.shape}“ ist ungültig. Erlaubt: ${ICON_SHAPES.join(", ")}.`);
  if (!ICON_POSITIONS.includes(ia.position)) err(`icon_area.position „${ia.position}“ ist ungültig. Erlaubt: left, right.`);
  ia.size = cssLen(ia.size, "icon_area.size", err);
  ia.icon_size = cssLen(ia.icon_size, "icon_area.icon_size", err);
  if (isPlainObject(ia.animation)) {
    for (const [k, v] of Object.entries(ia.animation)) {
      if (k === "duration") continue;
      if (!ANIMATIONS.includes(v)) err(`icon_area.animation.${k} „${v}“ ist ungültig. Erlaubt: ${ANIMATIONS.join(", ")}.`);
    }
    if (!/^\d*\.?\d+m?s$/.test(String(ia.animation.duration))) err("icon_area.animation.duration muss z. B. „1.5s“ oder „800ms“ sein.");
  } else if (ia.animation !== undefined) {
    err("icon_area.animation muss ein Objekt sein (z. B. on: pulse).");
  }
  if (c.icon_svg !== undefined && (typeof c.icon_svg !== "string" || !/^\s*<svg[\s>]/i.test(c.icon_svg))) {
    err("icon_svg muss mit <svg beginnen.");
  }

  // ---- values
  for (const key of ["value_1", "value_2"]) {
    if (isInfo && key === "value_1" && raw[key] === undefined) {
      c[key] = normalizeValue({ type: "state" }, key, err); // info card shows the main state
      continue;
    }
    if (raw[key] === undefined || raw[key] === null || raw[key] === false) {
      c[key] = undefined;
      continue;
    }
    c[key] = normalizeValue(raw[key], key, err);
  }
  if (!VALUE_LAYOUTS.includes(c.values.layout)) err(`values.layout „${c.values.layout}“ ist ungültig. Erlaubt: inline, stacked.`);
  c.values.gap = cssLen(c.values.gap, "values.gap", err);
  c.values.font_size = cssLen(c.values.font_size, "values.font_size", err);
  if (typeof c.values.separator !== "string") c.values.separator = String(c.values.separator ?? "");
  checkColor(raw.name_style?.color, "name_style.color", err);
  checkColor(raw.values?.color, "values.color", err);
  for (const key of ["value_1", "value_2"]) if (isPlainObject(raw[key])) checkColor(raw[key].color, `${key}.color`, err);

  // ---- graph
  c.graph = normalizeGraph(isInfo && raw.graph === undefined ? {} : raw.graph, c, err);

  // ---- state background / layers
  c.state_background.enabled = Boolean(c.state_background.enabled);
  c.layers.graph_above_state_background = c.layers.graph_above_state_background !== false;
  c.layers.overlay.enabled = Boolean(c.layers.overlay.enabled);

  // ---- top-level thresholds
  if (raw.thresholds !== undefined) c.thresholds = normalizeTopThresholds(raw.thresholds, err);

  // ---- layout
  const l = c.layout;
  l.height = l.height === "auto" ? "auto" : cssLen(l.height, "layout.height", err);
  l.min_width = cssLen(l.min_width, "layout.min_width", err);
  l.gap = cssLen(l.gap, "layout.gap", err);
  l.border_radius = cssLen(l.border_radius, "layout.border_radius", err);
  l.border_width = cssLen(l.border_width, "layout.border_width", err);
  const pad = toCssBoxLength(l.padding);
  if (!pad) err(`layout.padding „${l.padding}“ ist ungültig (z. B. „8px 12px“).`);
  else l.padding = pad;
  if (!["hidden", "visible", "clip"].includes(l.overflow)) err("layout.overflow muss hidden, visible oder clip sein.");

  // ---- actions
  if (!c.tap_action) c.tap_action = { action: isToggleableDomain(c.entity) ? "toggle" : "more-info" };
  for (const key of ["tap_action", "hold_action", "double_tap_action"]) {
    const a = c[key];
    if (!isPlainObject(a)) {
      err(`${key} muss ein Objekt mit „action“ sein.`);
      continue;
    }
    if (!ACTIONS.includes(a.action)) err(`${key}.action „${a.action}“ ist ungültig. Erlaubt: ${ACTIONS.join(", ")}.`);
    if (a.action === "navigate" && !a.navigation_path) err(`${key}: navigation_path fehlt.`);
    if (a.action === "url" && !a.url_path) err(`${key}: url_path fehlt.`);
    if ((a.action === "perform-action" || a.action === "call-service") && !/^[a-z0-9_]+\.[a-z0-9_]+$/.test(String(a.perform_action || a.service || ""))) {
      err(`${key}: perform_action muss im Format „domain.aktion“ angegeben werden.`);
    }
    if (a.entity !== undefined) checkEntity(a.entity, `${key}.entity`, err);
  }
  c.hold_time = clamp(parseNumber(c.hold_time) ?? DEFAULT_HOLD_TIME, 200, 5000);
  c.double_tap_window = clamp(parseNumber(c.double_tap_window) ?? DEFAULT_DOUBLE_TAP_WINDOW, 100, 1000);

  if (errors.length) throw new ConfigError(errors);
  return c;
}

/** A text color: CSS color string, or a map per state/class ({on, off, …}). */
function checkColor(value, path, err) {
  if (value === undefined || value === null) return;
  if (typeof value === "string") {
    if (!isSafeCssValue(value)) err(`${path} „${value}“ ist keine gültige Farbe.`);
    return;
  }
  if (!isPlainObject(value)) return err(`${path} muss eine Farbe oder eine Zuordnung je Zustand sein (z. B. "on": "#22c55e").`);
  for (const [k, v] of Object.entries(value)) {
    if (!isSafeCssValue(String(v))) err(`${path}.${k} „${v}“ ist keine gültige Farbe.`);
  }
  return undefined;
}

function checkEntity(value, path, err) {
  if (typeof value !== "string" || !ENTITY_RE.test(value)) err(`${path} „${value}“ ist keine gültige Entity-ID (Format: domain.objekt_id).`);
}

function cssLen(value, path, err) {
  const v = toCssLength(value);
  if (v === null) {
    err(`${path} „${value}“ ist keine gültige CSS-Länge (z. B. 42px, 50%).`);
    return undefined;
  }
  return v;
}

function normalizeValue(input, key, err) {
  let v;
  if (typeof input === "string") v = { ...VALUE_DEFAULTS, type: "text", text: input };
  else if (isPlainObject(input)) v = { ...VALUE_DEFAULTS, ...input };
  else {
    err(`${key} muss ein Objekt oder Text sein.`);
    return undefined;
  }
  if (input.type === undefined) {
    if (typeof input === "object" && input.text !== undefined && input.entity === undefined) v.type = "text";
    else if (typeof input === "object" && input.attribute !== undefined && !input.template) v.type = "attribute";
  }
  if (!VALUE_TYPES.includes(v.type)) err(`${key}.type „${v.type}“ ist ungültig. Erlaubt: ${VALUE_TYPES.join(", ")}.`);
  if (v.entity !== undefined) checkEntity(v.entity, `${key}.entity`, err);
  if (v.type === "attribute" && !v.attribute) err(`${key}.attribute fehlt (type: attribute).`);
  if (v.type === "text" && v.text === undefined) err(`${key}.text fehlt (type: text).`);
  if (v.type === "template" && typeof v.template !== "string") err(`${key}.template fehlt (type: template).`);
  if (v.template !== undefined && typeof v.template !== "string") err(`${key}.template muss ein Text sein.`);
  if (v.decimals !== undefined) {
    const d = parseNumber(v.decimals);
    if (d === null || !Number.isInteger(d) || d < 0 || d > 10) err(`${key}.decimals muss eine ganze Zahl von 0 bis 10 sein.`);
    else v.decimals = d;
  }
  if (v.format !== undefined && !VALUE_FORMATS.includes(v.format)) err(`${key}.format „${v.format}“ ist ungültig. Erlaubt: ${VALUE_FORMATS.join(", ")}.`);
  if (v.state_mapping !== undefined && !isPlainObject(v.state_mapping)) err(`${key}.state_mapping muss ein Objekt sein (z. B. "on": Ein).`);
  if (v.thresholds !== undefined) checkThresholdList(v.thresholds, `${key}.thresholds`, err);
  if (v.font_size !== undefined) v.font_size = cssLen(v.font_size, `${key}.font_size`, err);
  if (v.unit !== undefined && v.unit !== null) v.unit = String(v.unit);
  if (v.fallback === null || v.fallback === undefined) v.fallback = "–";
  else v.fallback = String(v.fallback);
  v.prefix = v.prefix === null || v.prefix === undefined ? "" : String(v.prefix);
  v.suffix = v.suffix === null || v.suffix === undefined ? "" : String(v.suffix);
  return v;
}

function checkThresholdList(list, path, err) {
  if (!Array.isArray(list)) return err(`${path} muss eine Liste sein.`);
  list.forEach((t, i) => {
    if (!isPlainObject(t)) return err(`${path}[${i}] muss ein Objekt sein.`);
    if (!isSafeCssValue(t.color)) err(`${path}[${i}].color fehlt oder ist ungültig.`);
    const hasValue = t.value !== undefined;
    const hasRange = t.from !== undefined || t.to !== undefined;
    if (!hasValue && !hasRange) err(`${path}[${i}] benötigt „value“ oder „from“/„to“.`);
    if (hasValue && parseNumber(t.value) === null) err(`${path}[${i}].value muss eine Zahl sein.`);
    if (t.from !== undefined && parseNumber(t.from) === null) err(`${path}[${i}].from muss eine Zahl sein.`);
    if (t.to !== undefined && parseNumber(t.to) === null) err(`${path}[${i}].to muss eine Zahl sein.`);
    if (t.from !== undefined && t.to !== undefined && parseNumber(t.from) !== null && parseNumber(t.to) !== null && parseNumber(t.from) >= parseNumber(t.to)) {
      err(`${path}[${i}]: „from“ (${t.from}) muss kleiner als „to“ (${t.to}) sein.`);
    }
  });
  return undefined;
}

function normalizeTopThresholds(input, err) {
  if (!isPlainObject(input)) {
    err("thresholds muss ein Objekt mit „ranges“ sein.");
    return undefined;
  }
  const t = { entity: undefined, attribute: undefined, ranges: [], apply_to: ["icon", "graph"], ...input };
  if (t.entity !== undefined) checkEntity(t.entity, "thresholds.entity", err);
  checkThresholdList(t.ranges, "thresholds.ranges", err);
  if (!Array.isArray(t.apply_to)) err("thresholds.apply_to muss eine Liste sein.");
  else t.apply_to.forEach((x) => !COLOR_TARGETS.includes(x) && err(`thresholds.apply_to: „${x}“ ist unbekannt. Erlaubt: ${COLOR_TARGETS.join(", ")}.`));
  return t;
}

/**
 * Width of the soft fade at the start/end of the graph.
 * Number = percent of the graph width (0–50), or a string like "15%" / "40px".
 */
function fadeLength(value, path, err) {
  if (value === undefined || value === null || value === false) return "0%";
  const s = String(value).trim();
  const m = /^(\d*\.?\d+)(%|px)?$/.exec(s);
  if (!m) {
    err(`${path} „${value}“ ist ungültig (z. B. 15, 15% oder 40px).`);
    return "0%";
  }
  const n = Number(m[1]);
  const unit = m[2] || "%";
  if (unit === "%" && n > 50) {
    err(`${path} darf höchstens 50 (%) sein.`);
    return "0%";
  }
  return `${n}${unit}`;
}

function normalizeGraph(rawGraph, c, err) {
  const g = isPlainObject(c.graph) ? c.graph : deepClone(DEFAULTS.graph);
  if (rawGraph === undefined || rawGraph === null || rawGraph === false) {
    g.enabled = false;
    return g;
  }
  if (rawGraph === true) {
    g.enabled = true;
  } else if (!isPlainObject(rawGraph)) {
    err("graph muss ein Objekt sein.");
    return g;
  } else {
    g.enabled = rawGraph.enabled === undefined ? true : Boolean(rawGraph.enabled);
    g.thresholds = Array.isArray(rawGraph.thresholds) ? rawGraph.thresholds : [];
    if (isPlainObject(rawGraph.colors)) g.colors = { ...DEFAULTS.graph.colors, ...rawGraph.colors };
  }
  if (!g.entity) g.entity = c.entity;
  checkEntity(g.entity, "graph.entity", err);
  if (!GRAPH_TYPES.includes(g.type)) err(`graph.type „${g.type}“ ist ungültig. Erlaubt: ${GRAPH_TYPES.join(", ")}.`);
  if (!GRAPH_POSITIONS.includes(g.position)) err(`graph.position „${g.position}“ ist unbekannt. Erlaubt: ${GRAPH_POSITIONS.join(", ")}.`);
  if (!AGGREGATIONS.includes(g.aggregation)) err(`graph.aggregation „${g.aggregation}“ ist ungültig. Erlaubt: ${AGGREGATIONS.join(", ")}.`);
  if (!FILL_MODES.includes(g.fill)) err(`graph.fill „${g.fill}“ ist ungültig. Erlaubt: ${FILL_MODES.join(", ")}.`);
  if (!COLOR_MODES.includes(g.color_mode)) err(`graph.color_mode „${g.color_mode}“ ist ungültig. Erlaubt: ${COLOR_MODES.join(", ")}.`);
  if (!THRESHOLD_MODES.includes(g.threshold_mode)) err(`graph.threshold_mode „${g.threshold_mode}“ ist ungültig. Erlaubt: current, per-point.`);

  const hours = parseNumber(g.hours_to_show);
  if (hours === null || hours <= 0) err("graph.hours_to_show muss größer als 0 sein.");
  else if (hours > MAX_HOURS) err(`graph.hours_to_show darf höchstens ${MAX_HOURS} (1 Jahr) sein.`);
  else g.hours_to_show = hours;

  const points = parseNumber(g.max_points);
  if (points === null || !Number.isInteger(points) || points < 2 || points > 1000) err("graph.max_points muss eine ganze Zahl von 2 bis 1000 sein.");
  else g.max_points = points;

  const interval = parseNumber(g.update_interval);
  if (interval === null || interval <= 0) err("graph.update_interval muss eine positive Zahl (Sekunden) sein.");
  else g.update_interval = Math.max(MIN_UPDATE_INTERVAL, interval);

  for (const key of ["min", "max"]) {
    if (g[key] === "auto" || g[key] === undefined || g[key] === null) g[key] = "auto";
    else {
      const n = parseNumber(g[key]);
      if (n === null) err(`graph.${key} muss eine Zahl oder „auto“ sein.`);
      else g[key] = n;
    }
  }
  if (typeof g.min === "number" && typeof g.max === "number" && g.min >= g.max) err(`Ungültiger Zahlenbereich: graph.min (${g.min}) muss kleiner als graph.max (${g.max}) sein.`);

  for (const [key, lo, hi] of [["line_width", 0, 20], ["bar_gap", 0, 50], ["bar_radius", 0, 50], ["opacity", 0, 1], ["fill_opacity", 0, 1]]) {
    const n = parseNumber(g[key]);
    if (n === null || n < lo || n > hi) err(`graph.${key} muss eine Zahl von ${lo} bis ${hi} sein.`);
    else g[key] = n;
  }
  if (g.bar_width !== undefined && g.bar_width !== null) {
    const n = parseNumber(g.bar_width);
    if (n === null || n <= 0) err("graph.bar_width muss eine positive Zahl (px) sein.");
    else g.bar_width = n;
  }

  g.fade_start = fadeLength(g.fade_start ?? g.fade, "graph.fade_start", err);
  g.fade_end = fadeLength(g.fade_end ?? g.fade, "graph.fade_end", err);
  g.width = cssLen(g.width, "graph.width", err);
  g.height = cssLen(g.height, "graph.height", err);
  g.icon_offset = cssLen(g.icon_offset, "graph.icon_offset", err);
  if (g.position === "custom") {
    if (!isPlainObject(g.bounds)) err("graph.bounds muss bei position: custom angegeben werden (left, top, width, height).");
    else for (const k of ["left", "top", "width", "height"]) g.bounds[k] = cssLen(g.bounds[k], `graph.bounds.${k}`, err);
  }

  if (g.color_mode === "thresholds") {
    if (!Array.isArray(g.thresholds) || g.thresholds.length === 0) err("graph.thresholds wird für color_mode: thresholds benötigt.");
    else checkThresholdList(g.thresholds, "graph.thresholds", err);
  }
  if (g.color_mode === "gradient") {
    if (!isPlainObject(g.gradient) || !isSafeCssValue(g.gradient.from) || !isSafeCssValue(g.gradient.to)) err("graph.gradient benötigt „from“ und „to“ (Farben).");
    else if (!["vertical", "horizontal"].includes(g.gradient.direction)) err("graph.gradient.direction muss vertical oder horizontal sein.");
  }
  if (g.color_mode === "fixed" && !isSafeCssValue(g.color)) err("graph.color ist ungültig.");
  if (g.color_mode === "sign") {
    if (!isSafeCssValue(g.positive_color)) err("graph.positive_color ist keine gültige Farbe.");
    if (!isSafeCssValue(g.negative_color)) err("graph.negative_color ist keine gültige Farbe.");
    const at = parseNumber(g.split_at);
    if (at === null) err("graph.split_at muss eine Zahl sein.");
    else g.split_at = at;
  }
  // the faded smooth-area looks best with a stronger fill
  if (g.type === "smooth-area" && c.variant !== "info" && (!isPlainObject(rawGraph) || rawGraph.fill_opacity === undefined)) g.fill_opacity = 0.6;
  if (!GRAPH_BASELINES.includes(g.baseline)) err(`graph.baseline „${g.baseline}“ ist ungültig. Erlaubt: zero, bottom.`);
  for (const k of ["show_points", "show_grid", "show_axis", "show_labels"]) g[k] = Boolean(g[k]);
  return g;
}
return { GRAPH_POSITIONS, COLOR_MODES, THRESHOLD_MODES, ICON_SHAPES, ICON_POSITIONS, ANIMATIONS, VALUE_LAYOUTS, COLOR_TARGETS, NAME_OVERFLOW, MAX_HOURS, VARIANTS, GRAPH_BASELINES, ConfigError, DEFAULTS, INFO_DEFAULTS, validateConfig, fadeLength };
})();

// ---- src/color-utils.js
const __m_color_utils_js = (() => {
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
function parseColor(value) {
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
function toHex({ r, g, b }) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Value to store after a color was picked with the mouse. A previously
 * configured transparency (rgba / #rrggbbaa) is kept, otherwise #rrggbb.
 */
function applyPickedColor(previous, pickedHex) {
  const picked = parseColor(pickedHex);
  if (!picked) return previous;
  const old = parseColor(previous);
  if (old && old.a < 1) return `rgba(${picked.r}, ${picked.g}, ${picked.b}, ${old.a})`;
  return toHex(picked);
}
return { parseColor, toHex, applyPickedColor };
})();

// ---- src/smart-graph-button-card-editor.js
const __m_smart_graph_button_card_editor_js = (() => {
/**
 * Visual Lovelace editor for the Smart Graph Button Card.
 *
 * Uses Home Assistant's native <ha-form> for standard fields (built into the
 * HA frontend, not a custom card) plus own controls for colors (text field +
 * mouse color picker) and the graph threshold list. Every key the editor does
 * not manage is preserved.
 */
const { parseColor, toHex, applyPickedColor } = __m_color_utils_js;

const EDITOR_TAG = "smart-graph-button-card-editor";

const VARIANTS = [
  ["button", "Button (schaltbar)"],
  ["info", "Info-Karte (nur Anzeige)"],
];

const GRAPH_TYPES = [
  ["line", "Linie"],
  ["area", "Fläche"],
  ["smooth-area", "Abgerundete Fläche (bis Null)"],
  ["bar", "Balken"],
  ["column", "Säulen"],
  ["stepped", "Stufen"],
  ["line-bar", "Linie + Balken"],
  ["smooth-line-bar", "Abgerundete Linie + Balken"],
];
const GRAPH_POSITIONS = [
  ["full", "Ganze Karte"],
  ["after-icon", "Nach dem Symbol"],
  ["left", "Links"],
  ["right", "Rechts"],
  ["bottom", "Unten"],
  ["icon-area", "Hinter dem Symbol"],
  ["custom", "Benutzerdefiniert"],
];
const COLOR_MODES = [
  ["state", "Nach Zustand (Ein/Aus)"],
  ["thresholds", "Nach Grenzwerten"],
  ["fixed", "Feste Farbe"],
  ["gradient", "Farbverlauf"],
  ["sign", "Über/Unter Null (z. B. Bezug/Einspeisung)"],
];
const THRESHOLD_MODES = [
  ["per-point", "Jeder Wert in eigener Farbe"],
  ["current", "Ganzer Graph nach aktuellem Wert"],
];
const GRADIENT_DIRECTIONS = [
  ["vertical", "Vertikal (unten → oben)"],
  ["horizontal", "Horizontal (links → rechts)"],
];

/** Pre-filled threshold list when "Nach Grenzwerten" is chosen in the editor. */
const DEFAULT_THRESHOLDS = [
  { value: 10, color: "#22c55e" },
  { value: 50, color: "#eab308" },
  { value: 100, color: "#f97316" },
  { value: 200, color: "#ef4444" },
];
const PALETTE = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#dc2626", "#a855f7", "#3b82f6"];

const LABELS = {
  entity: "Entity",
  variant: "Darstellung",
  name: "Name",
  icon: "Symbol",
  value_1_entity: "Wert 1 – Entity (leer = Haupt-Entity)",
  value_1_attribute: "Wert 1 – Attribut (optional)",
  value_1_enabled: "Wert 1 anzeigen",
  value_2_enabled: "Wert 2 anzeigen",
  value_2_entity: "Wert 2 – Entity",
  value_2_decimals: "Wert 2 – Dezimalstellen",
  value_2_unit: "Wert 2 – Einheit",
  graph_enabled: "Graph aktivieren",
  graph_entity: "Graph-Entity",
  graph_type: "Graph-Typ",
  graph_position: "Graph-Position",
  graph_hours_to_show: "Zeitraum (Stunden)",
  graph_fade_start: "Weicher Übergang am Beginn (links)",
  graph_fade_end: "Weicher Übergang am Ende (rechts)",
  graph_color_mode: "Farbmodus",
  graph_threshold_mode: "Anwendung",
  graph_gradient_direction: "Richtung",
  state_background_enabled: "Statushintergrund aktivieren",
  tap_action: "Tap-Aktion",
  hold_action: "Hold-Aktion",
  double_tap_action: "Double-Tap-Aktion",
};

const options = (list) => list.map(([value, label]) => ({ value, label }));

function mainSchema(cfg) {
  // the info card element always uses variant "info"
  const variant = cfg?.type === "custom:smart-graph-info-card"
    ? []
    : [{ name: "variant", selector: { select: { mode: "dropdown", options: options(VARIANTS) } } }];
  return [
    { name: "entity", required: true, selector: { entity: {} } },
    ...variant,
    {
      type: "grid",
      name: "",
      schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ],
    },
    {
      type: "expandable",
      name: "values_section",
      flatten: true,
      title: "Werte",
      icon: "mdi:numeric",
      schema: [
        { name: "value_1_enabled", selector: { boolean: {} } },
        { name: "value_1_entity", selector: { entity: {} } },
        { name: "value_1_attribute", selector: { text: {} } },
        { name: "value_2_enabled", selector: { boolean: {} } },
        { name: "value_2_entity", selector: { entity: {} } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "value_2_decimals", selector: { number: { min: 0, max: 6, mode: "box" } } },
            { name: "value_2_unit", selector: { text: {} } },
          ],
        },
      ],
    },
    {
      type: "expandable",
      name: "graph_section",
      flatten: true,
      title: "Graph",
      icon: "mdi:chart-bar",
      schema: [
        { name: "graph_enabled", selector: { boolean: {} } },
        { name: "graph_entity", selector: { entity: {} } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "graph_type", selector: { select: { mode: "dropdown", options: options(GRAPH_TYPES) } } },
            { name: "graph_position", selector: { select: { mode: "dropdown", options: options(GRAPH_POSITIONS) } } },
          ],
        },
        { name: "graph_hours_to_show", selector: { number: { min: 1, max: 168, step: 1, mode: "box", unit_of_measurement: "h" } } },
        { name: "graph_fade_start", selector: { number: { min: 0, max: 50, step: 1, mode: "slider", unit_of_measurement: "%" } } },
        { name: "graph_fade_end", selector: { number: { min: 0, max: 50, step: 1, mode: "slider", unit_of_measurement: "%" } } },
      ],
    },
  ];
}

function graphColorSchema(mode) {
  const extra = [];
  if (mode === "thresholds") extra.push({ name: "graph_threshold_mode", selector: { select: { mode: "dropdown", options: options(THRESHOLD_MODES) } } });
  if (mode === "gradient") extra.push({ name: "graph_gradient_direction", selector: { select: { mode: "dropdown", options: options(GRADIENT_DIRECTIONS) } } });
  return [{ type: "grid", name: "", schema: [{ name: "graph_color_mode", selector: { select: { mode: "dropdown", options: options(COLOR_MODES) } } }, ...extra] }];
}

const stateBackgroundSchema = () => [{ name: "state_background_enabled", selector: { boolean: {} } }];

const actionsSchema = () => [
  {
    type: "expandable",
    name: "actions_section",
    flatten: true,
    title: "Interaktionen",
    icon: "mdi:gesture-tap",
    schema: [
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ],
  },
];

const get = (obj, path) => path.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), obj);

function setPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]] || typeof cur[keys[i]] !== "object" || Array.isArray(cur[keys[i]])) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  const last = keys[keys.length - 1];
  if (value === undefined || value === "" || value === null) delete cur[last];
  else cur[last] = value;
}

function pruneEmpty(obj, path) {
  const keys = path.split(".");
  for (let depth = keys.length - 1; depth >= 1; depth--) {
    const parentPath = keys.slice(0, depth).join(".");
    const parent = get(obj, parentPath);
    if (parent && typeof parent === "object" && !Array.isArray(parent) && Object.keys(parent).length === 0) {
      setPath(obj, parentPath, undefined);
    }
  }
}

const clone = (v) => JSON.parse(JSON.stringify(v ?? {}));

/** Info cards have the graph enabled by default and other graph defaults. */
const isInfoConfig = (c) => c?.variant === "info" || c?.type === "custom:smart-graph-info-card";
const defaultColorMode = (c) => (isInfoConfig(c) ? "fixed" : "state");

/** Fade value as percent number for the slider (px values are left to YAML). */
function fadePercent(value) {
  if (value === undefined || value === null || value === false) return 0;
  const m = /^(\d*\.?\d+)%?$/.exec(String(value).trim());
  return m ? Number(m[1]) : undefined;
}

/** Map a (YAML) config to the flat data object used by ha-form. */
function configToForm(config) {
  const c = config || {};
  return {
    entity: c.entity,
    variant: c.variant || "button",
    name: typeof c.name === "string" ? c.name : undefined,
    icon: typeof c.icon === "string" ? c.icon : undefined,
    value_1_enabled: Boolean(c.value_1),
    value_1_entity: get(c, "value_1.entity"),
    value_1_attribute: get(c, "value_1.attribute"),
    value_2_enabled: Boolean(c.value_2),
    value_2_entity: get(c, "value_2.entity"),
    value_2_decimals: get(c, "value_2.decimals"),
    value_2_unit: get(c, "value_2.unit"),
    graph_enabled: c.graph ? get(c, "graph.enabled") !== false : isInfoConfig(c),
    graph_entity: get(c, "graph.entity"),
    graph_type: get(c, "graph.type") || (isInfoConfig(c) ? "smooth-area" : "line"),
    graph_position: get(c, "graph.position") || (isInfoConfig(c) ? "bottom" : "full"),
    graph_hours_to_show: get(c, "graph.hours_to_show") ?? 24,
    graph_fade_start: fadePercent(get(c, "graph.fade_start") ?? get(c, "graph.fade")),
    graph_fade_end: fadePercent(get(c, "graph.fade_end") ?? get(c, "graph.fade")),
    graph_color_mode: get(c, "graph.color_mode") || defaultColorMode(c),
    graph_threshold_mode: get(c, "graph.threshold_mode") || "current",
    graph_gradient_direction: get(c, "graph.gradient.direction") || "vertical",
    state_background_enabled: Boolean(get(c, "state_background.enabled")),
    tap_action: c.tap_action,
    hold_action: c.hold_action,
    double_tap_action: c.double_tap_action,
  };
}

/** Apply flat ha-form data back onto a copy of the config, keeping unknown keys. */
function formToConfig(config, form) {
  const out = clone(config);
  const d = form || {};
  setPath(out, "entity", d.entity);
  if (d.variant && out.type !== "custom:smart-graph-info-card") setPath(out, "variant", d.variant === "button" ? undefined : d.variant);
  if (d.name !== undefined || typeof out.name === "string") setPath(out, "name", d.name);
  if (d.icon !== undefined || typeof out.icon === "string") setPath(out, "icon", d.icon);

  if (d.value_1_enabled) {
    if (!out.value_1 || typeof out.value_1 !== "object") out.value_1 = { type: "state" };
    setPath(out, "value_1.entity", d.value_1_entity);
    setPath(out, "value_1.attribute", d.value_1_attribute);
    if (d.value_1_attribute && (!out.value_1.type || out.value_1.type === "state")) out.value_1.type = "attribute";
    if (!d.value_1_attribute && out.value_1.type === "attribute") out.value_1.type = "state";
  } else delete out.value_1;

  if (d.value_2_enabled) {
    if (!out.value_2 || typeof out.value_2 !== "object") out.value_2 = { type: "state" };
    setPath(out, "value_2.entity", d.value_2_entity);
    setPath(out, "value_2.decimals", typeof d.value_2_decimals === "number" ? d.value_2_decimals : undefined);
    setPath(out, "value_2.unit", d.value_2_unit);
  } else delete out.value_2;

  if (d.graph_enabled || out.graph || isInfoConfig(out)) {
    if (!out.graph || typeof out.graph !== "object") out.graph = {};
    if (d.graph_enabled) {
      setPath(out, "graph.entity", d.graph_entity);
      setPath(out, "graph.type", d.graph_type);
      setPath(out, "graph.position", d.graph_position);
      setPath(out, "graph.hours_to_show", typeof d.graph_hours_to_show === "number" ? d.graph_hours_to_show : undefined);
      for (const [field, key] of [["graph_fade_start", "fade_start"], ["graph_fade_end", "fade_end"]]) {
        const current = fadePercent(get(config, `graph.${key}`) ?? get(config, "graph.fade"));
        if (typeof d[field] === "number" && d[field] !== current) out.graph[key] = d[field];
      }
    }
    const mode = d.graph_color_mode;
    if (mode && (mode !== defaultColorMode(out) || out.graph.color_mode)) out.graph.color_mode = mode;
    if (mode === "thresholds") {
      const hadMode = Boolean(get(config, "graph.threshold_mode"));
      if (d.graph_threshold_mode && (d.graph_threshold_mode !== "current" || hadMode)) out.graph.threshold_mode = d.graph_threshold_mode;
      if (!Array.isArray(out.graph.thresholds) || out.graph.thresholds.length === 0) {
        out.graph.thresholds = clone(DEFAULT_THRESHOLDS);
        if (!out.graph.threshold_mode) out.graph.threshold_mode = "per-point";
      }
    }
    if (mode === "gradient") {
      if (!out.graph.gradient || typeof out.graph.gradient !== "object") out.graph.gradient = { from: "#22c55e", to: "#ef4444" };
      out.graph.gradient.direction = d.graph_gradient_direction || "vertical";
    }
    out.graph.enabled = Boolean(d.graph_enabled);
  }

  if (d.state_background_enabled) setPath(out, "state_background.enabled", true);
  else if (out.state_background) setPath(out, "state_background.enabled", false);

  for (const key of ["tap_action", "hold_action", "double_tap_action"]) setPath(out, key, d[key]);
  return out;
}

const EDITOR_STYLES = `
.sgbc-ed-panel { display: block; margin-top: 8px; }
.sgbc-ed-panel > details { border: 1px solid var(--divider-color); border-radius: 12px; }
.sgbc-ed-panel summary { cursor: pointer; padding: 12px 16px; font-weight: 500; }
.sgbc-ed-body { display: flex; flex-direction: column; gap: 12px; padding: 4px 4px 12px; }
.sgbc-ed-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.sgbc-ed-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.sgbc-ed-field > label { font-size: 12px; color: var(--secondary-text-color); }
.sgbc-ed-input {
  display: flex; align-items: center; gap: 8px; min-width: 0;
  border: 1px solid var(--divider-color); border-radius: 8px; padding: 4px 8px;
  background: var(--input-fill-color, var(--secondary-background-color, transparent));
}
.sgbc-ed-input:focus-within { border-color: var(--primary-color); }
.sgbc-ed-input.invalid { border-color: var(--error-color, #db4437); }
.sgbc-ed-input input[type="text"], .sgbc-ed-input input[type="number"] {
  flex: 1; min-width: 0; border: 0; outline: 0; background: transparent;
  color: var(--primary-text-color); font: inherit; font-size: 14px; padding: 6px 0;
}
.sgbc-ed-unit { color: var(--secondary-text-color); font-size: 13px; }
.sgbc-ed-chip {
  position: relative; flex: none; width: 28px; height: 28px; border-radius: 50%;
  border: 1px solid var(--divider-color); cursor: pointer; overflow: hidden;
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%),
    linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%);
  background-size: 8px 8px; background-position: 0 0, 4px 4px; background-color: #fff;
}
.sgbc-ed-chip .fill { position: absolute; inset: 0; border-radius: 50%; }
.sgbc-ed-chip input[type="color"] {
  position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: 0; padding: 0;
}
.sgbc-ed-threshold { display: grid; grid-template-columns: minmax(90px, 0.8fr) minmax(150px, 1.4fr) auto; gap: 8px; align-items: end; }
.sgbc-ed-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border: 1px solid var(--divider-color); border-radius: 8px; background: transparent;
  color: var(--primary-text-color); font: inherit; font-size: 14px; padding: 8px 12px; cursor: pointer;
}
.sgbc-ed-button:hover:not(:disabled) { background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); }
.sgbc-ed-button:disabled { opacity: 0.4; cursor: default; }
.sgbc-ed-button.icon { width: 40px; height: 40px; padding: 0; }
.sgbc-ed-button.add { align-self: flex-start; color: var(--primary-color); }
.sgbc-ed-button ha-icon { --mdc-icon-size: 20px; }
.sgbc-ed-note { margin: 0; font-size: 13px; color: var(--secondary-text-color); }
.sgbc-ed-subtitle { margin-top: 4px; font-size: 14px; font-weight: 500; color: var(--primary-text-color); }
.sgbc-ed-hint { margin: 12px 0 0; font-size: 12px; color: var(--secondary-text-color); }
`;

let colorCanvas = null;
/** Parse any CSS color the browser understands (names, hsl, …); null for var()/color-mix(). */
function cssColorToRgba(value) {
  const direct = parseColor(value);
  if (direct) return direct;
  if (typeof value !== "string" || !value.trim() || /var\(|color-mix|calc\(/i.test(value)) return null;
  try {
    colorCanvas = colorCanvas || document.createElement("canvas").getContext("2d");
    colorCanvas.fillStyle = "#010203";
    colorCanvas.fillStyle = value.trim();
    const out = colorCanvas.fillStyle;
    if (out === "#010203" && value.trim().toLowerCase() !== "#010203") return null;
    return parseColor(out);
  } catch (_err) {
    return null;
  }
}

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Color field: text input (any CSS color, e.g. #22c55e, rgba(...), var(...))
 * plus a round chip that opens the native color picker for mouse selection.
 */
function colorField(label, value, onChange, placeholder = "#22c55e") {
  const field = h("div", "sgbc-ed-field");
  const lab = h("label", "", label);
  const box = h("div", "sgbc-ed-input");
  const chip = h("span", "sgbc-ed-chip");
  const fill = h("span", "fill");
  const picker = document.createElement("input");
  picker.type = "color";
  picker.title = "Farbe mit der Maus auswählen";
  picker.setAttribute("aria-label", `${label} – Farbauswahl`);
  chip.append(fill, picker);
  const text = document.createElement("input");
  text.type = "text";
  text.spellcheck = false;
  text.autocomplete = "off";
  text.placeholder = placeholder;
  text.value = value ?? "";
  text.setAttribute("aria-label", label);
  box.append(chip, text);
  field.append(lab, box);

  const sync = () => {
    const v = text.value.trim();
    fill.style.background = v || "transparent";
    const rgba = cssColorToRgba(v);
    picker.value = rgba ? toHex(rgba) : "#888888";
  };
  picker.addEventListener("input", () => {
    text.value = applyPickedColor(text.value.trim(), picker.value);
    fill.style.background = text.value;
  });
  picker.addEventListener("change", () => onChange(text.value.trim()));
  text.addEventListener("input", sync);
  text.addEventListener("change", () => onChange(text.value.trim()));
  sync();
  return field;
}

// Guard allows importing the pure mapping helpers in Node-based tests.
const EditorBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {};

class SmartGraphButtonCardEditor extends EditorBase {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._forms = [];
    this._panels = null;
    this._ready = false;
    this._lastEmitted = null;
    this._onFormChanged = this._onFormChanged.bind(this);
  }

  set hass(hass) {
    this._hass = hass;
    for (const f of this._forms) f.hass = hass;
  }

  setConfig(config) {
    this._config = config || {};
    const echo = this._lastEmitted !== null && JSON.stringify(this._config) === this._lastEmitted;
    this._syncForms();
    if (!echo) this._renderPanels();
  }

  connectedCallback() {
    if (!this._ready) {
      this._ready = true;
      this._ensureComponents().then(() => this._render());
    }
  }

  disconnectedCallback() {
    for (const f of this._forms) f.removeEventListener("value-changed", this._onFormChanged);
    this._forms = [];
    this._panels = null;
    this._ready = false;
    this.replaceChildren();
  }

  async _ensureComponents() {
    if (customElements.get("ha-form") && customElements.get("ha-entity-picker")) return;
    // Standard technique: instantiate a built-in card editor so that HA loads
    // its own form components (no third-party code involved).
    try {
      const helpers = await window.loadCardHelpers?.();
      const card = await helpers?.createCardElement?.({ type: "entities", entities: [] });
      await card?.constructor?.getConfigElement?.();
    } catch (_err) {
      /* fall through */
    }
    await Promise.race([customElements.whenDefined("ha-form"), new Promise((r) => setTimeout(r, 3000))]);
  }

  _makeForm(schemaFn) {
    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form._sgbcSchema = schemaFn;
    form.schema = schemaFn(this._config);
    form._sgbcSchemaJson = JSON.stringify(form.schema);
    form.data = configToForm(this._config);
    form.computeLabel = (s) => LABELS[s.name] ?? s.title ?? s.name;
    form.addEventListener("value-changed", this._onFormChanged);
    this._forms.push(form);
    return form;
  }

  _makePanel(title) {
    const wrap = h("div", "sgbc-ed-panel");
    const body = h("div", "sgbc-ed-body");
    if (customElements.get("ha-expansion-panel")) {
      const panel = document.createElement("ha-expansion-panel");
      panel.header = title;
      panel.outlined = true;
      panel.append(body);
      wrap.append(panel);
    } else {
      const details = h("details");
      details.append(h("summary", "", title), body);
      wrap.append(details);
    }
    return { wrap, body };
  }

  _render() {
    this.replaceChildren();
    this._forms = [];
    if (!customElements.get("ha-form")) {
      const msg = h("p", "", "Der visuelle Editor ist in dieser Home-Assistant-Version nicht verfügbar. Bitte den YAML-Modus verwenden.");
      msg.style.cssText = "margin:0;padding:8px;color:var(--secondary-text-color)";
      this.append(msg);
      return;
    }
    const style = h("style");
    style.textContent = EDITOR_STYLES;
    const graphColors = this._makePanel("Graph-Farben");
    const colors = this._makePanel("Farben & Hintergrund");
    this._panels = { graphColors, colors };
    this.append(style, this._makeForm(mainSchema), graphColors.wrap, colors.wrap, this._makeForm(actionsSchema));
    this.append(h("p", "sgbc-ed-hint", "Eigene Zustände, Ebenen, Layout und Grenzwertfarben für Symbol und Hintergrund lassen sich im YAML-Modus konfigurieren."));
    this._renderPanels();
  }

  _syncForms() {
    const data = configToForm(this._config);
    for (const f of this._forms) {
      const schema = f._sgbcSchema(this._config);
      const json = JSON.stringify(schema);
      if (json !== f._sgbcSchemaJson) {
        f._sgbcSchemaJson = json;
        f.schema = schema;
      }
      f.data = data;
    }
  }

  _renderPanels() {
    if (!this._panels) return;
    this._forms = this._forms.filter((f) => f.isConnected && !f._sgbcPanelForm);
    this._renderGraphColors(this._panels.graphColors.body);
    this._renderColors(this._panels.colors.body);
  }

  _panelForm(schemaFn) {
    const form = this._makeForm(schemaFn);
    form._sgbcPanelForm = true;
    return form;
  }

  _renderGraphColors(body) {
    body.replaceChildren();
    const c = this._config;
    const mode = get(c, "graph.color_mode") || defaultColorMode(c);
    body.append(this._panelForm((cfg) => graphColorSchema(get(cfg, "graph.color_mode") || defaultColorMode(cfg))));
    if (c.graph && c.graph.enabled === false) body.append(h("p", "sgbc-ed-note", "Der Graph ist deaktiviert. Die Farben gelten, sobald er aktiviert wird."));

    if (mode === "fixed") {
      body.append(colorField("Graph-Farbe", get(c, "graph.color"), (v) => this._set("graph.color", v), isInfoConfig(c) ? "auto (nach Sensortyp)" : "#06b6d4"));
    } else if (mode === "state") {
      const grid = h("div", "sgbc-ed-grid");
      grid.append(
        colorField("Graph „Ein“", get(c, "graph.colors.on"), (v) => this._set("graph.colors.on", v)),
        colorField("Graph „Aus“", get(c, "graph.colors.off"), (v) => this._set("graph.colors.off", v), "#94a3b8")
      );
      body.append(grid);
    } else if (mode === "gradient") {
      const grid = h("div", "sgbc-ed-grid");
      grid.append(
        colorField("Von", get(c, "graph.gradient.from"), (v) => this._set("graph.gradient.from", v || "#22c55e")),
        colorField("Bis", get(c, "graph.gradient.to"), (v) => this._set("graph.gradient.to", v || "#ef4444"), "#ef4444")
      );
      body.append(grid);
    } else if (mode === "sign") {
      const grid = h("div", "sgbc-ed-grid");
      grid.append(
        colorField("Über Null", get(c, "graph.positive_color"), (v) => this._set("graph.positive_color", v), "#a855f7"),
        colorField("Unter Null", get(c, "graph.negative_color"), (v) => this._set("graph.negative_color", v), "#22c55e")
      );
      body.append(grid);
    } else if (mode === "thresholds") {
      this._renderThresholds(body);
    }
  }

  _renderThresholds(body) {
    const c = this._config;
    const list = Array.isArray(get(c, "graph.thresholds")) ? get(c, "graph.thresholds") : [];
    const graphEntity = get(c, "graph.entity") || c.entity;
    const unit = this._hass?.states?.[graphEntity]?.attributes?.unit_of_measurement || "";

    list.forEach((t, idx) => {
      const row = h("div", "sgbc-ed-threshold");

      const valueField = h("div", "sgbc-ed-field");
      const valueBox = h("div", "sgbc-ed-input");
      const input = document.createElement("input");
      input.type = "number";
      input.step = "any";
      input.value = t?.value ?? "";
      input.setAttribute("aria-label", `Grenzwert ${idx + 1} – ab Wert`);
      valueBox.append(input);
      if (unit) valueBox.append(h("span", "sgbc-ed-unit", unit));
      valueField.append(h("label", "", "Ab Wert"), valueBox);
      input.addEventListener("change", () => {
        const n = input.value.trim() === "" ? NaN : Number(input.value);
        valueBox.classList.toggle("invalid", !Number.isFinite(n));
        if (!Number.isFinite(n)) return;
        this._updateThreshold(idx, { value: n });
      });

      const colorEl = colorField("Farbe", t?.color, (v) => {
        if (v) this._updateThreshold(idx, { color: v });
      });

      const del = h("button", "sgbc-ed-button icon");
      del.type = "button";
      del.title = "Grenzwert entfernen";
      del.setAttribute("aria-label", `Grenzwert ${idx + 1} entfernen`);
      const delIcon = document.createElement("ha-icon");
      delIcon.icon = "mdi:delete-outline";
      del.append(delIcon);
      if (!customElements.get("ha-icon")) del.textContent = "✕";
      del.disabled = list.length <= 1;
      del.addEventListener("click", () => {
        const next = this._thresholdList().filter((_, i) => i !== idx);
        this._set("graph.thresholds", next, true);
      });

      row.append(valueField, colorEl, del);
      body.append(row);
    });

    const add = h("button", "sgbc-ed-button add");
    add.type = "button";
    const addIcon = document.createElement("ha-icon");
    addIcon.icon = "mdi:plus";
    add.append(addIcon, document.createTextNode("Grenzwert hinzufügen"));
    add.addEventListener("click", () => {
      const list = this._thresholdList();
      const values = list.map((t) => Number(t?.value)).filter(Number.isFinite);
      const max = values.length ? Math.max(...values) : -50;
      const next = [...list, { value: max + 50, color: PALETTE[list.length % PALETTE.length] }];
      this._set("graph.thresholds", next, true);
    });
    body.append(add);
  }

  _renderColors(body) {
    body.replaceChildren();
    const c = this._config;
    const icons = h("div", "sgbc-ed-grid");
    icons.append(
      colorField("Symbol „Ein“", get(c, "icon_area.color.on"), (v) => this._set("icon_area.color.on", v)),
      colorField("Symbol „Aus“", get(c, "icon_area.color.off"), (v) => this._set("icon_area.color.off", v), "#94a3b8")
    );
    const backgrounds = h("div", "sgbc-ed-grid");
    backgrounds.append(
      colorField("Hintergrund „Ein“", get(c, "state_background.colors.on"), (v) => this._set("state_background.colors.on", v), "rgba(34, 197, 94, 0.15)"),
      colorField("Hintergrund „Aus“", get(c, "state_background.colors.off"), (v) => this._set("state_background.colors.off", v), "rgba(148, 163, 184, 0.08)")
    );
    body.append(icons, this._panelForm(stateBackgroundSchema), backgrounds, h("div", "sgbc-ed-subtitle", "Schrift"), this._textColors());
  }

  /** Font colors. Maps per state (YAML) are kept and only shown as a note. */
  _textColors() {
    const c = this._config;
    const grid = h("div", "sgbc-ed-grid");
    const field = (label, path, placeholder) => {
      const value = get(c, path);
      if (value && typeof value === "object") {
        const note = h("div", "sgbc-ed-field");
        note.append(h("label", "", label), h("p", "sgbc-ed-note", "Je Zustand im YAML-Modus festgelegt"));
        return note;
      }
      return colorField(label, value, (v) => this._set(path, v), placeholder);
    };
    grid.append(field("Name", "name_style.color", "#ffffff"), field("Werte (beide)", "values.color", "#9ca3af"));
    if (c.value_1) grid.append(field("Wert 1", "value_1.color", "#9ca3af"));
    if (c.value_2) grid.append(field("Wert 2", "value_2.color", "#9ca3af"));
    return grid;
  }

  /** Current threshold list (always read fresh – never from a render closure). */
  _thresholdList() {
    const list = get(this._config, "graph.thresholds");
    return Array.isArray(list) ? clone(list) : [];
  }

  _updateThreshold(idx, patch) {
    const list = this._thresholdList();
    list[idx] = { ...(list[idx] || {}), ...patch };
    this._set("graph.thresholds", list, false);
  }

  /** Set a nested value from a custom control; `rerender` rebuilds the panels. */
  _set(path, value, rerender = false) {
    const config = clone(this._config);
    setPath(config, path, value);
    pruneEmpty(config, path);
    this._emit(config);
    if (rerender) this._renderPanels();
  }

  _onFormChanged(ev) {
    ev.stopPropagation();
    const before = this._config;
    const config = formToConfig(before, { ...configToForm(before), ...(ev.detail?.value || {}) });
    const structural =
      get(before, "graph.color_mode") !== get(config, "graph.color_mode") ||
      get(before, "graph.threshold_mode") !== get(config, "graph.threshold_mode") ||
      get(before, "graph.entity") !== get(config, "graph.entity") ||
      get(before, "graph.enabled") !== get(config, "graph.enabled") ||
      Boolean(before.value_1) !== Boolean(config.value_1) ||
      Boolean(before.value_2) !== Boolean(config.value_2);
    this._emit(config);
    this._syncForms();
    if (structural) this._renderPanels();
  }

  _emit(config) {
    if (!config.type) config.type = "custom:smart-graph-button-card";
    this._config = config;
    this._lastEmitted = JSON.stringify(config);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
}

if (typeof customElements !== "undefined" && !customElements.get(EDITOR_TAG)) {
  customElements.define(EDITOR_TAG, SmartGraphButtonCardEditor);
}
return { EDITOR_TAG, DEFAULT_THRESHOLDS, setPath, pruneEmpty, configToForm, formToConfig };
})();

// ---- src/smart-graph-button-card.js
const __m_smart_graph_button_card_js = (() => {
/**
 * Smart Graph Button Card – a self-contained Home Assistant Lovelace card.
 * No dependencies on other custom cards, no external resources.
 *
 * type: custom:smart-graph-button-card
 */
const { CARD_STYLES } = __m_styles_js;
const { validateConfig, ConfigError } = __m_config_validator_js;
const { getStateGroup, matchCustomState, normalizeThresholdRanges, findThresholdColor, resolveColor } = __m_state_resolver_js;
const { resolveValue, isTemplate, formatNumber, getNumberLocale } = __m_value_formatter_js;
const { fetchHistory } = __m_history_provider_js;
const { reduceSeries, appendPoint } = __m_data_reducer_js;
const { renderGraphSVG } = __m_graph_renderer_js;
const { GestureRecognizer, bindActionHandler, handleAction, hasAction } = __m_action_handler_js;
const { parseNumber, isDisplayable, isSafeCssValue, cssLengthToPx, paddingSide } = __m_utils_js;
const { EDITOR_TAG } = __m_smart_graph_button_card_editor_js;

const CARD_TAG = "smart-graph-button-card";
const INFO_CARD_TAG = "smart-graph-info-card";
const CARD_VERSION = "1.3.0";

let instanceCounter = 0;

const DOMAIN_ICONS = {
  switch: "mdi:toggle-switch-variant",
  light: "mdi:lightbulb",
  fan: "mdi:fan",
  sensor: "mdi:eye",
  binary_sensor: "mdi:checkbox-blank-circle-outline",
  climate: "mdi:thermostat",
  cover: "mdi:window-shutter",
  lock: "mdi:lock",
  media_player: "mdi:cast",
  input_boolean: "mdi:toggle-switch-outline",
  person: "mdi:account",
  script: "mdi:script-text",
  scene: "mdi:palette",
  automation: "mdi:robot",
  button: "mdi:gesture-tap-button",
};

function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** True when `path` (dot separated) is explicitly present in the raw YAML config. */
function userSet(raw, path) {
  let cur = raw;
  for (const key of path.split(".")) {
    if (cur === null || typeof cur !== "object" || !(key in cur)) return false;
    cur = cur[key];
  }
  return cur !== undefined && cur !== null;
}

function mix(color, percent) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/**
 * Sanitise inline SVG markup: removes scripts, foreign content, event handler
 * attributes and external references. Returns an SVG element or null.
 */
function sanitizeSvg(markup) {
  try {
    const doc = new DOMParser().parseFromString(String(markup), "image/svg+xml");
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== "svg" || doc.getElementsByTagName("parsererror").length) return null;
    svg.querySelectorAll("script, foreignObject, iframe, object, embed, style, image, a").forEach((n) => n.remove());
    const walk = (node) => {
      for (const attr of Array.from(node.attributes)) {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();
        if (
          name.startsWith("on") ||
          ((name === "href" || name === "xlink:href" || name === "src") && !value.startsWith("#")) ||
          (name === "style" && /url\s*\(|expression|javascript:/.test(value))
        ) {
          node.removeAttribute(attr.name);
        }
      }
      Array.from(node.children).forEach(walk);
    };
    walk(svg);
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    return document.importNode(svg, true);
  } catch (_err) {
    return null;
  }
}

/** Graph color for `color: auto`, chosen by the sensor's device class. */
const AUTO_COLORS = {
  temperature: "#ef4444",
  humidity: "#22c55e",
  moisture: "#22c55e",
  power: "#f59e0b",
  energy: "#f59e0b",
  battery: "#22c55e",
  illuminance: "#eab308",
  carbon_dioxide: "#a855f7",
  pressure: "#06b6d4",
  atmospheric_pressure: "#06b6d4",
  wind_speed: "#06b6d4",
  precipitation: "#3b82f6",
};

function graphKey(g) {
  return JSON.stringify([g.enabled, g.entity, g.attribute, g.hours_to_show, g.update_interval]);
}

class SmartGraphButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uid = `sgbc${++instanceCounter}`;
    this._config = null;
    this._rawConfig = null;
    this._hass = null;
    this._error = null;
    this._els = null;
    this._watched = [];
    this._prevStates = new Map();
    this._connected = false;
    this._raf = 0;
    this._graphRaf = 0;
    this._timer = null;
    this._ro = null;
    this._unbindActions = null;
    this._points = [];
    this._graphToken = 0;
    this._graphKey = "";
    this._graphLoaded = false;
    this._graphSize = { w: 0, h: 0 };
    this._lastSvg = null;
    this._lastGraphState = null;
    this._failedPictures = new Set();
    this._ranges = { top: [], graph: [] };
    this._colorState = { group: "unavailable", customClass: undefined, graphOverride: null };
  }

  // ------------------------------------------------------------------ HA API

  static getConfigElement() {
    return document.createElement(EDITOR_TAG);
  }

  static getStubConfig(hass) {
    const states = hass?.states || {};
    const ids = Object.keys(states);
    const entity = ids.find((id) => /^(switch|light|input_boolean|fan)\./.test(id)) || ids[0] || "switch.example";
    const power = ids.find((id) => id.startsWith("sensor.") && states[id]?.attributes?.device_class === "power");
    const config = { entity, value_1: { type: "state" } };
    if (power) {
      config.value_2 = { entity: power, decimals: 1 };
      config.graph = { entity: power, type: "bar", position: "left", width: "55%", hours_to_show: 6 };
    }
    return config;
  }

  setConfig(config) {
    let normalized;
    try {
      normalized = validateConfig(config);
    } catch (err) {
      this._config = null;
      this._error = err instanceof ConfigError ? err.message : `Unerwarteter Fehler: ${err?.message || err}`;
      this._teardown();
      this._renderError();
      return;
    }
    this._error = null;
    this._rawConfig = config;
    this._config = normalized;
    this._watched = this._collectEntities(normalized);
    this._prevStates.clear();
    this._ranges = {
      top: normalized.thresholds ? normalizeThresholdRanges(normalized.thresholds.ranges) : [],
      graph: normalizeThresholdRanges(normalized.graph.thresholds),
    };
    const gk = graphKey(normalized.graph);
    if (gk !== this._graphKey) {
      this._graphKey = gk;
      this._points = [];
      this._graphLoaded = false;
      this._graphToken++;
      this._lastGraphState = null;
    }
    this._lastSvg = null;
    this._teardown();
    this._build();
    if (this._connected) this._attach();
    this._scheduleUpdate();
  }

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    if (!this._config || !hass) return;
    let changed = !old || old.locale !== hass.locale || old.language !== hass.language || old.themes !== hass.themes;
    for (const id of this._watched) {
      const s = hass.states?.[id];
      if (this._prevStates.get(id) !== s) {
        this._prevStates.set(id, s);
        changed = true;
      }
    }
    const g = this._config.graph;
    if (g.enabled) {
      const s = hass.states?.[g.entity];
      if (s && s !== this._lastGraphState) {
        this._lastGraphState = s;
        this._appendLive(s);
      }
      if (!this._graphLoaded && this._connected && !this._fetching) this._fetchGraph();
    }
    if (changed) this._scheduleUpdate();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    const px = cssLengthToPx(this._config?.layout?.height) ?? 64;
    return Math.max(1, Math.ceil(px / 50));
  }

  getGridOptions() {
    const px = cssLengthToPx(this._config?.layout?.height);
    const info = this._config?.variant === "info";
    return {
      columns: info ? 3 : 6,
      rows: px !== null && px <= 56 ? 1 : "auto",
      min_columns: info ? 2 : 3,
      min_rows: 1,
    };
  }

  connectedCallback() {
    this._connected = true;
    if (this._config) {
      if (!this._els) this._build();
      this._attach();
      this._scheduleUpdate();
    }
  }

  disconnectedCallback() {
    this._connected = false;
    this._teardown();
  }

  // ------------------------------------------------------------ lifecycle

  _collectEntities(c) {
    const ids = new Set([c.entity]);
    if (c.state_entity) ids.add(c.state_entity);
    if (c.name && typeof c.name === "object" && c.name.entity) ids.add(c.name.entity);
    for (const v of [c.value_1, c.value_2]) if (v && v.entity) ids.add(v.entity);
    if (c.graph.enabled) ids.add(c.graph.entity);
    if (c.thresholds?.entity) ids.add(c.thresholds.entity);
    for (const s of c.states) if (s.entity) ids.add(s.entity);
    return Array.from(ids);
  }

  /** Attach listeners, observers and timers (only while connected). */
  _attach() {
    if (!this._els || !this._config) return;
    this._detach();
    const c = this._config;
    const card = this._els.card;

    const recognizer = new GestureRecognizer({
      holdTime: c.hold_time,
      doubleTapWindow: c.double_tap_window,
      hasHold: () => hasAction(this._config?.hold_action),
      hasDoubleTap: () => hasAction(this._config?.double_tap_action),
      onAction: (gesture) => {
        if (this._config && this._hass) handleAction(this, this._hass, this._config, gesture);
      },
    });
    this._unbindActions = bindActionHandler(card, recognizer, {
      onPressChange: (pressed) => card.classList.toggle("pressed", pressed),
    });

    if (c.graph.enabled && typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver((entries) => {
        const rect = entries[entries.length - 1]?.contentRect;
        if (!rect) return;
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        if (w !== this._graphSize.w || h !== this._graphSize.h) {
          this._graphSize = { w, h };
          this._scheduleGraph();
        }
      });
      this._ro.observe(this._graphTarget());
    }

    if (c.graph.enabled) {
      this._timer = setInterval(() => this._fetchGraph(), c.graph.update_interval * 1000);
      if (this._hass) this._fetchGraph();
    }
  }

  _detach() {
    if (this._unbindActions) {
      this._unbindActions();
      this._unbindActions = null;
    }
    if (this._ro) {
      this._ro.disconnect();
      this._ro = null;
    }
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _teardown() {
    this._detach();
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._graphRaf) cancelAnimationFrame(this._graphRaf);
    this._raf = 0;
    this._graphRaf = 0;
    this._graphToken++; // discard pending history responses
    this._fetching = false;
  }

  _scheduleUpdate() {
    if (this._raf || !this._config) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = 0;
      this._update();
    });
  }

  _scheduleGraph() {
    if (this._graphRaf || !this._config) return;
    this._graphRaf = requestAnimationFrame(() => {
      this._graphRaf = 0;
      this._renderGraph();
    });
  }

  // ------------------------------------------------------------ rendering

  _renderError() {
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = el("style");
    style.textContent = CARD_STYLES;
    const card = el("ha-card", "sgbc-error", { role: "alert" });
    const title = el("div", "title");
    title.textContent = "Smart Graph Button Card – Konfigurationsfehler";
    const msg = el("div", "msg");
    msg.textContent = this._error || "Unbekannter Fehler";
    card.append(title, msg);
    root.append(style, card);
    this._els = null;
  }

  _build() {
    const c = this._config;
    const raw = this._rawConfig || {};
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = el("style");
    style.textContent = CARD_STYLES;

    const card = el("ha-card", "sgbc", { tabindex: "0", role: "button" });
    const stateBg = el("div", "layer state-bg");
    // "after-icon" without an icon area is the same as "full"
    const graphPos = c.graph.position === "after-icon" && !c.icon_area.enabled ? "full" : c.graph.position;
    const graph = el("div", `layer graph pos-${graphPos}${c.icon_area.position === "right" ? " mirror" : ""}${c.graph.enabled ? "" : " hidden"}`);
    const overlay = el("div", `layer overlay${c.layers.overlay.enabled ? "" : " hidden"}`);
    const content = el("div", "content");
    const effects = el("div", "layer effects");

    // icon area
    let iconWrap = null;
    let iconArea = null;
    let iconGraph = null;
    let glyph = null;
    let badge = null;
    if (c.icon_area.enabled) {
      iconWrap = el("div", "icon-wrap");
      iconArea = el("div", `icon-area shape-${c.icon_area.shape}`);
      iconGraph = el("div", `icon-graph${c.graph.enabled && c.graph.position === "icon-area" ? "" : " hidden"}`);
      glyph = el("div", "glyph");
      iconArea.append(iconGraph, glyph);
      badge = el("ha-icon", "badge", { icon: "mdi:alert-circle", "aria-hidden": "true" });
      badge.icon = "mdi:alert-circle";
      iconWrap.append(iconArea, badge);
      if (c.icon_svg) {
        const svg = sanitizeSvg(c.icon_svg);
        if (svg) {
          const span = el("span", "svg-icon");
          span.append(svg);
          glyph.append(span);
        }
      }
    }
    if (!iconWrap) content.classList.add("no-icon");
    if (c.icon_area.position === "right") content.classList.add("icon-right");

    const isInfo = c.variant === "info";
    if (isInfo) {
      card.classList.add("variant-info");
      content.classList.add("info-layout");
    }
    const info = el("div", "info");
    const name = el("div", "name");
    if (c.name_style.overflow === "wrap" || c.name_style.max_lines > 1) name.classList.add("multiline");
    if (c.name_style.overflow === "clip") name.classList.add("overflow-clip");
    const values = el("div", `values${c.values.layout === "stacked" ? " stacked" : ""}`);
    const makeValue = (i) => {
      const wrap = el("span", `value value-${i}`);
      const icon = el("ha-icon", "hidden", { "aria-hidden": "true" });
      const text = el("span", "value-text");
      const unit = el("span", "unit hidden");
      wrap.append(icon, text, unit);
      return { wrap, icon, text, unit };
    };
    const v1 = makeValue(1);
    const sep = el("span", "sep", { "aria-hidden": "true" });
    sep.textContent = c.values.separator;
    const v2 = makeValue(2);
    values.append(v1.wrap, sep, v2.wrap);
    if (isInfo) {
      // info layout: [icon name] on top, large value below
      const head = el("div", "info-head");
      if (iconWrap) head.append(iconWrap);
      head.append(name);
      info.append(head, values);
      content.append(info);
    } else {
      info.append(name, values);
      if (iconWrap) content.append(iconWrap);
      content.append(info);
    }

    card.append(stateBg, graph, overlay, content, effects);
    root.append(style, card);

    // static CSS variables – layout values are only set when configured so
    // that themes can provide --sgbc-* defaults.
    const setVar = (name, value) => {
      if (isDisplayable(value) && isSafeCssValue(String(value))) card.style.setProperty(name, String(value));
    };
    const layoutMap = {
      height: "--sgbc-height",
      min_width: "--sgbc-min-width",
      padding: "--sgbc-padding",
      gap: "--sgbc-gap",
      border_radius: "--sgbc-border-radius",
      border_width: "--sgbc-border-width",
      border_color: "--sgbc-border-color",
      overflow: "--sgbc-overflow",
      background: "--sgbc-background",
    };
    for (const [key, cssVar] of Object.entries(layoutMap)) {
      if (userSet(raw, `layout.${key}`) && c.layout[key] !== "auto") setVar(cssVar, c.layout[key]);
    }
    if (c.layout.height === "auto") card.classList.add("auto-height");
    setVar("--sgbc-icon-area-size", c.icon_area.size);
    setVar("--sgbc-icon-size", c.icon_area.icon_size);
    setVar("--sgbc-anim-duration", c.icon_area.animation?.duration);
    // info cards scale the name with the card width unless a size is configured
    if (!isInfo || userSet(raw, "name_style.font_size")) setVar("--sgbc-name-size", c.name_style.font_size);
    setVar("--sgbc-name-weight", c.name_style.font_weight);
    setVar("--sgbc-name-align", c.name_style.align);
    setVar("--sgbc-name-lines", c.name_style.overflow === "wrap" && c.name_style.max_lines === 1 ? 2 : c.name_style.max_lines);
    setVar("--sgbc-values-gap", c.values.gap);
    setVar("--sgbc-values-size", c.values.font_size);
    for (const i of [1, 2]) {
      const v = c[`value_${i}`];
      if (!v) continue;
      setVar(`--sgbc-value-${i}-size`, v.font_size);
      setVar(`--sgbc-value-${i}-weight`, v.font_weight);
    }
    if (userSet(raw, "graph.opacity")) setVar("--sgbc-graph-opacity", c.graph.opacity);
    if (c.graph.position === "left" || c.graph.position === "right") setVar("--sgbc-graph-width", c.graph.width);
    if (c.graph.position === "bottom") setVar("--sgbc-graph-height", c.graph.height);
    if (graphPos === "after-icon") {
      // graph starts where the icon area ends: padding + icon size + offset
      const side = c.icon_area.position === "right" ? "right" : "left";
      setVar("--sgbc-graph-pad", paddingSide(c.layout.padding, side));
      setVar("--sgbc-graph-icon-offset", c.graph.icon_offset);
    }
    if (parseFloat(c.graph.fade_start) > 0 || parseFloat(c.graph.fade_end) > 0) {
      graph.classList.add("fade");
      if (iconGraph) iconGraph.classList.add("fade");
      setVar("--sgbc-fade-start", c.graph.fade_start);
      setVar("--sgbc-fade-end", c.graph.fade_end);
    }
    if (c.graph.position === "custom") {
      setVar("--sgbc-graph-left", c.graph.bounds.left);
      setVar("--sgbc-graph-top", c.graph.bounds.top);
      setVar("--sgbc-graph-width", c.graph.bounds.width);
      setVar("--sgbc-graph-height", c.graph.bounds.height);
    }
    card.style.setProperty("--sgbc-z-state", c.layers.graph_above_state_background ? "1" : "2");
    card.style.setProperty("--sgbc-z-graph", c.layers.graph_above_state_background ? "2" : "1");
    if (c.layers.overlay.enabled) setVar("--sgbc-overlay-color", c.layers.overlay.color);
    if (!hasAction(c.tap_action) && !hasAction(c.hold_action) && !hasAction(c.double_tap_action)) {
      card.classList.add("no-action");
    }

    this._els = { card, stateBg, graph, overlay, content, iconWrap, iconArea, iconGraph, glyph, badge, name, values, v1, v2, sep };
    this._graphSize = { w: 0, h: 0 };
    this._lastSvg = null;
    this._glyphKey = null;
  }

  _graphTarget() {
    return this._config.graph.position === "icon-area" && this._els.iconGraph ? this._els.iconGraph : this._els.graph;
  }

  _update() {
    if (!this._config || !this._els) return;
    try {
      this._updateContent();
      this._renderGraph();
    } catch (err) {
      // never let a rendering problem break the dashboard
      // eslint-disable-next-line no-console
      console.error("[smart-graph-button-card] render error:", err);
    }
  }

  _updateContent() {
    const c = this._config;
    const hass = this._hass;
    const els = this._els;
    const card = els.card;
    const states = hass?.states || {};
    const mainObj = states[c.entity];
    const stateId = c.state_entity || c.entity;
    const stateObj = states[stateId];
    const state = stateObj?.state;

    const group = getStateGroup(state, c.state_mapping, c.case_sensitive);
    const custom = matchCustomState(state, c.states, {
      caseSensitive: c.case_sensitive,
      resolveSource: (rule) => {
        if (!rule.entity && !rule.attribute) return state;
        const src = rule.entity ? states[rule.entity] : stateObj;
        return rule.attribute ? src?.attributes?.[rule.attribute] : src?.state;
      },
    });
    const customClass = custom?.class;

    let thrColor = null;
    if (c.thresholds) {
      const srcId = c.thresholds.entity || (c.graph.enabled ? c.graph.entity : c.entity);
      const src = states[srcId];
      const v = c.thresholds.attribute ? src?.attributes?.[c.thresholds.attribute] : src?.state;
      thrColor = findThresholdColor(v, this._ranges.top);
    }
    const override = (target) => {
      if (thrColor && c.thresholds.apply_to.includes(target)) return thrColor;
      if (custom?.color && c.color_targets.includes(target)) return custom.color;
      return null;
    };
    this._colorState = { group, customClass, graphOverride: override("graph") };

    const setVar = (name, value) => {
      if (isDisplayable(value) && isSafeCssValue(String(value))) card.style.setProperty(name, String(value));
      else card.style.removeProperty(name);
    };

    // state classes
    for (const cls of Array.from(card.classList)) {
      if (cls.startsWith("state-") || cls.startsWith("custom-")) card.classList.remove(cls);
    }
    card.classList.add(`state-${group}`);
    if (customClass) card.classList.add(`custom-${customClass}`);

    // colors
    setVar("--sgbc-icon-color", override("icon") ?? resolveColor(c.icon_area.color, group, customClass));
    const ib = override("icon-background");
    setVar("--sgbc-icon-background", ib ? mix(ib, 18) : resolveColor(c.icon_area.background, group, customClass));
    const cb = override("card-background");
    setVar("--sgbc-state-background", cb ? mix(cb, 16) : c.state_background.enabled ? resolveColor(c.state_background.colors, group, customClass) : null);
    const nameColor = override("name") ?? (userSet(this._rawConfig, "name_style.color") ? resolveColor(c.name_style.color, group, customClass) : null);
    setVar("--sgbc-name-color", nameColor);
    setVar("--sgbc-value-color", resolveColor(c.values.color, group, customClass));

    // icon
    this._updateIcon(mainObj, group, customClass);

    // name
    const name = this._resolveName(mainObj);
    if (els.name.textContent !== name) els.name.textContent = name;
    els.name.title = name;

    // values
    const ctx = { entityId: c.entity, group, customClass, unavailableText: c.unavailable_text, unknownText: c.unknown_text };
    const results = [];
    let visibleCount = 0;
    for (const i of [1, 2]) {
      const cfg = c[`value_${i}`];
      const ref = els[`v${i}`];
      // info card: the main value is shown large with a separate, small unit
      const splitUnit = c.variant === "info" && i === 1 && cfg && cfg.type !== "text" && !cfg.template;
      let r = null;
      let unitText = "";
      if (cfg && splitUnit) {
        r = resolveValue({ ...cfg, unit: "", use_entity_unit: false }, hass, ctx);
        if (!r.hidden && !r.unavailable && r.numeric !== null) {
          const src = hass?.states?.[cfg.entity || c.entity];
          const entityUnit = cfg.type === "attribute" ? undefined : src?.attributes?.unit_of_measurement;
          const u = cfg.use_entity_unit === false ? cfg.unit : cfg.use_entity_unit === true ? entityUnit ?? cfg.unit : cfg.unit ?? entityUnit;
          unitText = isDisplayable(u) ? String(u) : "";
          if (unitText) r = { ...r, aria: `${r.aria} ${unitText}` };
        }
      } else if (cfg) {
        r = resolveValue(cfg, hass, ctx);
      }
      results.push(r);
      const visible = Boolean(r && !r.hidden);
      ref.wrap.classList.toggle("hidden", !visible);
      if (!visible) continue;
      visibleCount++;
      if (ref.text.textContent !== r.text) ref.text.textContent = r.text;
      if (ref.unit.textContent !== unitText) ref.unit.textContent = unitText;
      ref.unit.classList.toggle("hidden", !unitText);
      if (cfg.icon) {
        ref.icon.icon = cfg.icon;
        ref.icon.setAttribute("icon", cfg.icon);
        ref.icon.classList.remove("hidden");
      } else ref.icon.classList.add("hidden");
      setVar(`--sgbc-value-${i}-color`, override(`value-${i}`) ?? r.color);
    }
    const bothInline = results[0] && !results[0].hidden && results[1] && !results[1].hidden && c.values.layout === "inline" && c.values.separator !== "";
    els.sep.classList.toggle("hidden", !bothInline);
    els.values.classList.toggle("hidden", visibleCount === 0);

    // unavailable badge (state not conveyed by color only)
    const unavailable = group === "unavailable";
    if (els.badge) {
      els.badge.classList.toggle("visible", unavailable && c.show_unavailable_badge);
      els.badge.title = this._stateText(stateObj);
    }

    // accessibility label
    const parts = [name];
    const stateShown = results.some((r) => r && !r.hidden && r.isState && r.entityId === stateId);
    if (!stateShown) parts.push(this._stateText(stateObj));
    for (const r of results) if (r && !r.hidden) parts.push(r.aria);
    card.setAttribute("aria-label", parts.filter(isDisplayable).join(", "));
  }

  _stateText(stateObj) {
    const c = this._config;
    if (!stateObj) return "Entity nicht gefunden";
    const s = String(stateObj.state).toLowerCase();
    if (s === "unavailable" && c.unavailable_text) return c.unavailable_text;
    if (s === "unknown" && c.unknown_text) return c.unknown_text;
    try {
      const formatted = this._hass?.formatEntityState?.(stateObj);
      if (isDisplayable(formatted)) return String(formatted);
    } catch (_err) {
      /* ignore */
    }
    if (s === "unavailable") return "Nicht verfügbar";
    if (s === "unknown") return "Unbekannt";
    return isDisplayable(stateObj.state) ? String(stateObj.state) : "";
  }

  _resolveName(mainObj) {
    const c = this._config;
    const hass = this._hass;
    const fallbackName = mainObj?.attributes?.friendly_name ?? c.entity;
    const n = c.name;
    let out;
    if (typeof n === "string") {
      out = isTemplate(n) ? resolveValue({ type: "template", template: n, fallback: c.entity }, hass, { entityId: c.entity }).text : n;
    } else if (n && typeof n === "object") {
      const id = n.entity || c.entity;
      const src = hass?.states?.[id];
      if (n.template) out = resolveValue({ type: "template", template: n.template, entity: id, fallback: c.entity }, hass, { entityId: id }).text;
      else if (n.attribute) out = src?.attributes?.[n.attribute];
      else if (n.text !== undefined) out = n.text;
      else out = src?.attributes?.friendly_name ?? id;
    } else {
      out = fallbackName;
    }
    return isDisplayable(out) ? String(out) : String(fallbackName);
  }

  _updateIcon(mainObj, group, customClass) {
    const c = this._config;
    const els = this._els;
    if (!els.glyph) return;

    const anim = c.icon_area.animation ? c.icon_area.animation[customClass] ?? c.icon_area.animation[group] ?? "none" : "none";
    els.glyph.className = `glyph${anim && anim !== "none" ? ` anim-${anim}` : ""}`;

    if (c.icon_svg && els.glyph.querySelector(".svg-icon")) return;

    const picture = c.use_entity_picture ? mainObj?.attributes?.entity_picture : c.picture;
    const iconCfg = resolveColor(c.icon, group, customClass); // icon may be a per-state map
    let mode;
    if (picture && !this._failedPictures.has(picture)) mode = "picture";
    else if (iconCfg === "none") mode = "none";
    else if (iconCfg) mode = "icon";
    else if (mainObj && customElements.get("ha-state-icon")) mode = "state-icon";
    else mode = "icon";

    if (mode !== this._glyphKey) {
      els.glyph.replaceChildren();
      this._glyphNode = null;
      if (mode === "picture") {
        const img = el("img", "picture", { alt: "", draggable: "false" });
        img.addEventListener("error", () => {
          this._failedPictures.add(img.getAttribute("src"));
          this._glyphKey = null;
          this._scheduleUpdate();
        });
        this._glyphNode = img;
      } else if (mode === "icon") {
        this._glyphNode = el("ha-icon");
      } else if (mode === "state-icon") {
        this._glyphNode = el("ha-state-icon");
      }
      if (this._glyphNode) els.glyph.append(this._glyphNode);
      this._glyphKey = mode;
      els.iconArea.classList.toggle("has-picture", mode === "picture");
    }

    const node = this._glyphNode;
    if (!node) return;
    if (mode === "picture") {
      if (node.getAttribute("src") !== picture) node.setAttribute("src", picture);
    } else if (mode === "icon") {
      const domain = c.entity.split(".")[0];
      const icon = iconCfg || mainObj?.attributes?.icon || DOMAIN_ICONS[domain] || "mdi:bookmark";
      if (node.icon !== icon) {
        node.icon = icon;
        node.setAttribute("icon", icon);
      }
    } else if (mode === "state-icon") {
      node.hass = this._hass;
      node.stateObj = mainObj;
    }
  }

  // ------------------------------------------------------------ graph

  _appendLive(stateObj) {
    if (!this._graphLoaded) return;
    const g = this._config.graph;
    const v = g.attribute ? parseNumber(stateObj.attributes?.[g.attribute]) : parseNumber(stateObj.state);
    const t = Date.parse(g.attribute ? stateObj.last_updated : stateObj.last_changed || stateObj.last_updated);
    if (!Number.isFinite(t)) return;
    this._points = appendPoint(this._points, { t, v }, Date.now() - g.hours_to_show * 3600 * 1000);
    this._scheduleGraph();
  }

  async _fetchGraph() {
    const c = this._config;
    if (!c?.graph.enabled || !this._hass || !this._connected) return;
    const g = c.graph;
    const token = ++this._graphToken;
    this._fetching = true;
    const res = await fetchHistory(this._hass, {
      entityId: g.entity,
      attribute: g.attribute,
      hours: g.hours_to_show,
      updateInterval: g.update_interval,
      resolution: `${g.max_points}:${g.aggregation}:${g.fill}`,
    });
    if (token !== this._graphToken || !this._config) return;
    this._fetching = false;

    let points = res.points;
    if (res.status === "error" && this._points.length) points = this._points; // keep previous data
    else if (this._points.length && points.length) {
      const lastT = points[points.length - 1].t;
      const newer = this._points.filter((p) => p.t > lastT);
      if (newer.length) points = points.concat(newer);
    }
    // make sure the current state is part of the series
    const current = this._hass.states?.[g.entity];
    if (current) {
      const v = g.attribute ? parseNumber(current.attributes?.[g.attribute]) : parseNumber(current.state);
      const t = Date.parse(g.attribute ? current.last_updated : current.last_changed || current.last_updated);
      const last = points[points.length - 1];
      if (Number.isFinite(t) && (!last || t > last.t)) points = points.concat([{ t, v }]);
    }
    this._points = points;
    this._graphLoaded = true;
    if (this._els) this._els.card.dataset.graphStatus = res.status;
    this._scheduleGraph();
  }

  _graphColors(data) {
    const g = this._config.graph;
    const { group, customClass, graphOverride } = this._colorState;
    const fallback = "var(--sgbc-graph-color, var(--primary-color, #03a9f4))";
    const deviceClass = this._hass?.states?.[g.entity]?.attributes?.device_class;
    const base = g.color === "auto" ? AUTO_COLORS[deviceClass] || fallback : isSafeCssValue(g.color) ? g.color : fallback;
    let color = base;
    let pointColor = null;
    let gradient = null;
    switch (g.color_mode) {
      case "fixed":
        color = base;
        break;
      case "state":
        color = resolveColor(g.colors, group, customClass) || base;
        break;
      case "thresholds":
        if (g.threshold_mode === "per-point") {
          const ranges = this._ranges.graph;
          pointColor = (v) => findThresholdColor(v, ranges);
        } else {
          let current = null;
          for (let i = data.length - 1; i >= 0 && current === null; i--) current = data[i].v;
          const live = this._hass?.states?.[g.entity];
          const liveValue = live ? (g.attribute ? parseNumber(live.attributes?.[g.attribute]) : parseNumber(live.state)) : null;
          color = findThresholdColor(liveValue ?? current, this._ranges.graph) || base;
        }
        break;
      case "sign":
        return {
          color: g.positive_color,
          pointColor: null,
          gradient: null,
          sign: { above: g.positive_color, below: g.negative_color, at: g.split_at },
        };
      case "gradient":
        gradient = g.gradient;
        break;
      default:
        break;
    }
    const overridable = g.color_mode === "fixed" || g.color_mode === "state" || (g.color_mode === "thresholds" && g.threshold_mode === "current");
    if (graphOverride && overridable) color = graphOverride;
    return { color, pointColor, gradient };
  }

  _renderGraph() {
    const c = this._config;
    if (!c || !this._els || !c.graph.enabled) return;
    const g = c.graph;
    const target = this._graphTarget();
    let { w, h } = this._graphSize;
    if ((!w || !h) && typeof ResizeObserver === "undefined") {
      w = target.clientWidth;
      h = target.clientHeight;
    }
    if (!w || !h) return;
    const now = Date.now();
    const data = reduceSeries(this._points, {
      start: now - g.hours_to_show * 3600 * 1000,
      end: now,
      buckets: g.max_points,
      aggregation: g.aggregation,
      fill: g.fill,
    });
    const { color, pointColor, gradient, sign } = this._graphColors(data);
    const locale = getNumberLocale(this._hass);
    const svg = renderGraphSVG({
      data,
      width: w,
      height: h,
      type: g.type,
      color,
      pointColor,
      gradient,
      sign,
      baseline: g.baseline,
      min: g.min,
      max: g.max,
      lineWidth: g.line_width,
      barGap: g.bar_gap,
      barWidth: g.bar_width,
      barRadius: g.bar_radius,
      opacity: 1, // layer opacity is applied via CSS (--sgbc-graph-opacity)
      fillOpacity: g.fill_opacity,
      showPoints: g.show_points,
      showGrid: g.show_grid,
      showAxis: g.show_axis,
      showLabels: g.show_labels,
      idPrefix: this._uid,
      labelFormatter: (v) => formatNumber(v, { locale, decimals: Math.abs(v) >= 100 ? 0 : 1 }),
    });
    if (svg !== this._lastSvg) {
      target.innerHTML = svg;
      this._lastSvg = svg;
    }
  }
}

/**
 * Pure info card (e.g. temperature, humidity): same engine, info layout.
 * type: custom:smart-graph-info-card
 */
class SmartGraphInfoCard extends SmartGraphButtonCard {
  setConfig(config) {
    super.setConfig({ ...(config || {}), variant: "info" });
  }

  static getStubConfig(hass) {
    const states = hass?.states || {};
    const ids = Object.keys(states);
    const byClass = (dc) => ids.find((id) => id.startsWith("sensor.") && states[id]?.attributes?.device_class === dc);
    const entity = byClass("temperature") || byClass("humidity") || ids.find((id) => id.startsWith("sensor.")) || "sensor.example";
    return { entity };
  }
}

if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, SmartGraphButtonCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: CARD_TAG,
    name: "Smart Graph Button Card",
    description: "Kompakte Button-Karte mit Symbol, Name, zwei Werten und integriertem Verlaufsgraphen – ohne Abhängigkeiten.",
    preview: true,
    documentationURL: "https://github.com/rest2178/smart-graph-button-card",
  });
  customElements.define(INFO_CARD_TAG, SmartGraphInfoCard);
  window.customCards.push({
    type: INFO_CARD_TAG,
    name: "Smart Graph Info Card",
    description: "Reine Info-Karte für Messwerte wie Temperatur oder Luftfeuchtigkeit: Symbol, Name, großer Wert und Verlaufsgraph.",
    preview: true,
    documentationURL: "https://github.com/rest2178/smart-graph-button-card",
  });
  // eslint-disable-next-line no-console
  console.info(`%c SMART-GRAPH-BUTTON-CARD %c v${CARD_VERSION} `, "color:#fff;background:#0ea5e9;font-weight:700;border-radius:3px 0 0 3px", "color:#0ea5e9;background:#e0f2fe;border-radius:0 3px 3px 0");
}
return { CARD_TAG, INFO_CARD_TAG, CARD_VERSION, SmartGraphButtonCard, SmartGraphInfoCard };
})();
