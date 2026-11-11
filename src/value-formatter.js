/**
 * Value formatting: numbers, dates, units, state mapping and a safe,
 * restricted template syntax. No eval(), no Function().
 *
 * Pure module – no DOM access.
 */

import { parseNumber, isDisplayable } from "./utils.js";
import { isUnavailableState, normalizeThresholdRanges, findThresholdColor, resolveColor, normalizeState } from "./state-resolver.js";

export const DEFAULT_FALLBACK = "–";

export const VALUE_TYPES = ["state", "attribute", "text", "name", "last_changed", "last_updated", "template"];
export const VALUE_FORMATS = ["number", "integer", "duration", "relative", "datetime", "date", "time"];

const numberFormatCache = new Map();

/**
 * Determine the locale used for number formatting from the hass object,
 * honouring the user's "number format" profile setting where possible.
 */
export function getNumberLocale(hass) {
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

export function getLanguage(hass) {
  return hass?.locale?.language || hass?.language || undefined;
}

/**
 * Format a number. Returns null when the value is not a finite number.
 * decimals: integer => fixed digits; undefined => up to 2 digits.
 */
export function formatNumber(value, { decimals, locale } = {}) {
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
export function formatDuration(seconds) {
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
export function formatRelative(value, locale, now = Date.now()) {
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
export function formatDate(value, kind, locale) {
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
export function renderTemplate(template, resolver) {
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
export function isTemplate(value) {
  if (typeof value !== "string") return false;
  TEMPLATE_RE.lastIndex = 0;
  const result = TEMPLATE_RE.test(value);
  TEMPLATE_RE.lastIndex = 0;
  return result;
}

/** Look up a state mapping case-insensitively. Returns undefined when absent. */
export function lookupStateMapping(mapping, raw, caseSensitive = false) {
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
export function resolveValue(cfg, hass, ctx = {}) {
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
