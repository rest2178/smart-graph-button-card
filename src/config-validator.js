/**
 * Configuration validation and normalisation.
 * validateConfig() returns a fully populated config object or throws a
 * ConfigError that lists every problem in a human readable way.
 *
 * Pure module – no DOM access.
 */

import { parseNumber, toCssLength, toCssBoxLength, isSafeCssValue, isPlainObject, mergeDeep, deepClone, clamp } from "./utils.js";
import { DEFAULT_STATE_MAPPING, OPERATORS } from "./state-resolver.js";
import { GRAPH_TYPES } from "./graph-renderer.js";
import { AGGREGATIONS, FILL_MODES } from "./data-reducer.js";
import { ACTIONS, DEFAULT_HOLD_TIME, DEFAULT_DOUBLE_TAP_WINDOW, isToggleableDomain } from "./action-handler.js";
import { VALUE_TYPES, VALUE_FORMATS } from "./value-formatter.js";
import { MIN_UPDATE_INTERVAL } from "./history-provider.js";

export const GRAPH_POSITIONS = ["full", "left", "right", "bottom", "icon-area", "custom"];
export const COLOR_MODES = ["fixed", "state", "thresholds", "gradient", "sign"];
export const THRESHOLD_MODES = ["current", "per-point"];
export const ICON_SHAPES = ["circle", "rounded-square", "square", "none"];
export const ICON_POSITIONS = ["left", "right"];
export const ANIMATIONS = ["none", "pulse", "rotate", "blink"];
export const VALUE_LAYOUTS = ["inline", "stacked"];
export const COLOR_TARGETS = ["icon", "icon-background", "graph", "card-background", "name", "value-1", "value-2"];
export const NAME_OVERFLOW = ["ellipsis", "clip", "wrap"];
export const MAX_HOURS = 8760;

export class ConfigError extends Error {
  constructor(errors) {
    const list = Array.isArray(errors) ? errors : [String(errors)];
    super(list.length === 1 ? list[0] : `Ungültige Konfiguration:\n• ${list.join("\n• ")}`);
    this.name = "ConfigError";
    this.errors = list;
  }
}

const ENTITY_RE = /^[a-z0-9_]+\.[a-zA-Z0-9_]+$/;

export const DEFAULTS = Object.freeze({
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
export function validateConfig(raw) {
  const errors = [];
  const err = (msg) => errors.push(msg);

  if (!isPlainObject(raw)) throw new ConfigError("Die Konfiguration muss ein Objekt sein.");
  if (!raw.entity || typeof raw.entity !== "string") {
    throw new ConfigError("„entity“ fehlt. Bitte ein Haupt-Entity angeben, z. B. entity: switch.schreibtisch_1");
  }

  const c = mergeDeep(DEFAULTS, raw);
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
  c.graph = normalizeGraph(raw.graph, c, err);

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
export function fadeLength(value, path, err) {
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
  if (g.type === "smooth-area" && (!isPlainObject(rawGraph) || rawGraph.fill_opacity === undefined)) g.fill_opacity = 0.6;
  for (const k of ["show_points", "show_grid", "show_axis", "show_labels"]) g[k] = Boolean(g[k]);
  return g;
}
