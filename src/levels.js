/**
 * Status levels ("Optimal", "Zu warm", "Erhöht" …) with colors, presets per
 * sensor type (device_class) and an overall rating for several sensors.
 * Pure module – no DOM access.
 */
import { parseNumber, isPlainObject, isSafeCssValue } from "./utils.js";

export const LEVEL_COLORS = Object.freeze({
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
});

/** Color per sensor type: icon, graph and tint of the info designs. */
export const TYPE_COLORS = Object.freeze({
  temperature: "#f59e0b",
  humidity: "#3b82f6",
  moisture: "#3b82f6",
  carbon_dioxide: "#22c55e",
  carbon_monoxide: "#ef4444",
  pm25: "#8b5cf6",
  pm10: "#a855f7",
  pm1: "#8b5cf6",
  volatile_organic_compounds: "#14b8a6",
  volatile_organic_compounds_parts: "#14b8a6",
  nitrogen_dioxide: "#f97316",
  ozone: "#06b6d4",
  aqi: "#22c55e",
  illuminance: "#eab308",
  pressure: "#06b6d4",
  atmospheric_pressure: "#06b6d4",
  power: "#f59e0b",
  energy: "#f59e0b",
  battery: "#22c55e",
});

export const TYPE_ICONS = Object.freeze({
  temperature: "mdi:thermometer",
  humidity: "mdi:water",
  moisture: "mdi:water",
  carbon_dioxide: "mdi:leaf",
  carbon_monoxide: "mdi:molecule-co",
  pm25: "mdi:blur",
  pm10: "mdi:blur",
  pm1: "mdi:blur",
  volatile_organic_compounds: "mdi:molecule",
  volatile_organic_compounds_parts: "mdi:molecule",
  nitrogen_dioxide: "mdi:molecule",
  ozone: "mdi:weather-windy",
  aqi: "mdi:air-filter",
  illuminance: "mdi:brightness-5",
  pressure: "mdi:gauge",
  atmospheric_pressure: "mdi:gauge",
  power: "mdi:flash",
  energy: "mdi:lightning-bolt",
  battery: "mdi:battery",
});

/** Short German names (overview card, missing friendly names). */
export const TYPE_NAMES = Object.freeze({
  temperature: "Temperatur",
  humidity: "Luftfeuchtigkeit",
  carbon_dioxide: "CO₂",
  pm25: "Feinstaub (PM2.5)",
  pm10: "Feinstaub (PM10)",
  pm1: "Feinstaub (PM1)",
  volatile_organic_compounds: "VOC",
  volatile_organic_compounds_parts: "VOC",
});

const { blue, green, amber, red } = LEVEL_COLORS;
// severity: 0 = good, 1 = moderate, 2 = bad (used for the overall rating)
const L = (value, label, color, severity, icon) => ({ value, label, color, severity, ...(icon ? { icon } : {}) });

/** Presets: each level applies from `value` upwards (first level: everything below). */
export const LEVEL_PRESETS = Object.freeze({
  // slight deviations ("Eher kühl") do not lower the overall air rating
  temperature: [
    L(null, "Zu kalt", blue, 1, "mdi:snowflake"),
    L(15, "Eher kühl", amber, 0),
    L(19, "Optimal", green, 0),
    L(24, "Eher warm", amber, 0),
    L(26, "Zu warm", red, 1),
  ],
  humidity: [
    L(null, "Zu trocken", red, 1),
    L(30, "Eher trocken", amber, 0),
    L(40, "Optimal", green, 0),
    L(60, "Eher feucht", amber, 0),
    L(70, "Zu feucht", red, 1),
  ],
  carbon_dioxide: [L(null, "Gut", green, 0), L(800, "Erhöht", amber, 1, "mdi:diamond"), L(1400, "Kritisch", red, 2)],
  pm25: [L(null, "Sehr gut", green, 0), L(5, "Gut", green, 0), L(15, "Erhöht", amber, 1), L(25, "Schlecht", red, 2), L(50, "Sehr schlecht", red, 2)],
  pm10: [L(null, "Sehr gut", green, 0), L(15, "Gut", green, 0), L(45, "Erhöht", amber, 1), L(75, "Schlecht", red, 2)],
  pm1: [L(null, "Sehr gut", green, 0), L(5, "Gut", green, 0), L(15, "Erhöht", amber, 1), L(25, "Schlecht", red, 2)],
  volatile_organic_compounds: [L(null, "Gut", green, 0), L(300, "Erhöht", amber, 1), L(1000, "Schlecht", red, 2)],
  volatile_organic_compounds_parts: [L(null, "Gut", green, 0), L(300, "Erhöht", amber, 1), L(1000, "Schlecht", red, 2)],
});

/** Range of the status ring per sensor type (value → ring fill). */
export const RING_RANGES = Object.freeze({
  temperature: [0, 40],
  humidity: [0, 100],
  moisture: [0, 100],
  carbon_dioxide: [400, 2000],
  pm25: [0, 75],
  pm10: [0, 150],
  pm1: [0, 75],
  volatile_organic_compounds: [0, 2000],
  battery: [0, 100],
  illuminance: [0, 1000],
});

/** Overall rating of several sensors by the worst severity. */
export const RATINGS = Object.freeze([
  { label: "Gut", text: "Angenehme Raumluft", color: green },
  { label: "Mäßig", text: "Lüften empfohlen", color: amber },
  { label: "Schlecht", text: "Bitte lüften", color: red },
]);

/**
 * Normalise a level list: [{ value?, label, color, severity?, icon? }].
 * `auto`/true → preset for the device class (or null), false → null.
 * Returns a list sorted by value (a level without value comes first) or null.
 */
export function resolveLevels(config, deviceClass) {
  if (config === false || config === null) return null;
  if (config === undefined || config === true || config === "auto") {
    return LEVEL_PRESETS[deviceClass] ? LEVEL_PRESETS[deviceClass].map((l) => ({ ...l })) : null;
  }
  if (typeof config === "string") return LEVEL_PRESETS[config] ? LEVEL_PRESETS[config].map((l) => ({ ...l })) : null;
  if (!Array.isArray(config)) return null;
  const list = config
    .filter(isPlainObject)
    .map((l) => {
      const v = l.value === undefined || l.value === null || l.value === "" ? null : parseNumber(l.value);
      const severity = parseNumber(l.severity);
      return {
        value: v,
        label: l.label === undefined || l.label === null ? "" : String(l.label),
        color: isSafeCssValue(l.color) ? l.color : green,
        severity: severity === null ? null : Math.max(0, Math.min(2, Math.round(severity))),
        ...(typeof l.icon === "string" && l.icon ? { icon: l.icon } : {}),
      };
    });
  list.sort((a, b) => (a.value === null ? -Infinity : a.value) - (b.value === null ? -Infinity : b.value));
  // severity not given: guess from the color (green good, red bad, else moderate)
  for (const l of list) {
    if (l.severity !== null) continue;
    const c = String(l.color).toLowerCase();
    l.severity = c === green || c.includes("green") || c === "#16a34a" ? 0 : c === red || c.includes("red") || c === "#dc2626" ? 2 : 1;
  }
  return list.length ? list : null;
}

/** Level for a value: the last level whose `value` is ≤ the value. */
export function findLevel(value, levels) {
  const v = parseNumber(value);
  if (v === null || !Array.isArray(levels) || !levels.length) return null;
  let found = null;
  for (const l of levels) {
    if (l.value === null || v >= l.value) found = l;
  }
  return found ?? levels[0];
}

/** Ring fill 0…1 for a value. */
export function ringFraction(value, deviceClass, range) {
  const v = parseNumber(value);
  if (v === null) return 0;
  const [lo, hi] = Array.isArray(range) && range.length === 2 ? range.map(Number) : RING_RANGES[deviceClass] || [0, 100];
  if (!(hi > lo)) return 0;
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
}

/** Overall rating for a list of levels (null entries are ignored). */
export function overallRating(levels, ratings = RATINGS) {
  const sev = levels.filter(Boolean).map((l) => l.severity ?? 0);
  if (!sev.length) return null;
  const worst = Math.max(...sev);
  return { severity: worst, ...ratings[Math.min(worst, ratings.length - 1)] };
}
