/**
 * State evaluation: state groups (on/off/unavailable), custom state rules,
 * threshold ranges and color resolution.
 *
 * Pure module – no DOM access, fully testable in Node.
 */

import { parseNumber } from "./utils.js";

export const DEFAULT_STATE_MAPPING = Object.freeze({
  on: ["on", "open", "opening", "playing", "home", "heating", "cooling", "unlocked", "active", "cleaning"],
  off: ["off", "closed", "closing", "idle", "not_home", "locked", "paused", "standby", "docked"],
  unavailable: ["unavailable", "unknown"],
});

export const STATE_GROUPS = ["on", "off", "unavailable", "other"];

export const OPERATORS = ["==", "!=", ">", ">=", "<", "<=", "contains", "regex"];

const regexCache = new Map();

/** Normalise any state value to a comparable string. */
export function normalizeState(value, caseSensitive = false) {
  if (value === null || value === undefined) return "";
  const s = String(value).trim();
  return caseSensitive ? s : s.toLowerCase();
}

/**
 * Determine the state group of a raw state.
 * Missing state (entity not found) => "unavailable".
 * States not contained in any group => "other".
 */
export function getStateGroup(state, mapping = DEFAULT_STATE_MAPPING, caseSensitive = false) {
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

export function isUnavailableState(state) {
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
export function compareState(operator, state, value, caseSensitive = false) {
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
export function matchCustomState(state, rules, { caseSensitive = false, resolveSource } = {}) {
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
export function normalizeThresholdRanges(input) {
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
export function findThresholdColor(value, ranges) {
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
export function resolveColor(map, group, customClass) {
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
