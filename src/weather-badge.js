/**
 * Smart Graph Weather Badge – weather in badge height (36 px), in the style of
 * the info card designs: tinted icon circle, temperature, condition and a soft
 * forecast graph in the background.
 *
 * type: custom:smart-graph-weather-badge   (dashboard badges)
 */
import { renderGraphSVG } from "./graph-renderer.js";
import { formatNumber, getNumberLocale } from "./value-formatter.js";
import { isPlainObject, parseNumber } from "./utils.js";
import { TYPE_ICONS } from "./levels.js";
import { fetchHistory } from "./history-provider.js";
import { reduceSeries } from "./data-reducer.js";

export const WEATHER_TAG = "smart-graph-weather-badge";
export const WEATHER_EDITOR_TAG = "smart-graph-weather-badge-editor";

const Base = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
const WEATHER_RE = /^weather\.[a-z0-9_]+$/;

/** Icon, accent color and German name per weather condition. */
export const CONDITIONS = Object.freeze({
  "clear-night": { icon: "mdi:weather-night", color: "#6366f1", label: "Klar" },
  cloudy: { icon: "mdi:weather-cloudy", color: "#64748b", label: "Bewölkt" },
  exceptional: { icon: "mdi:alert-circle-outline", color: "#ef4444", label: "Unwetter" },
  fog: { icon: "mdi:weather-fog", color: "#94a3b8", label: "Nebel" },
  hail: { icon: "mdi:weather-hail", color: "#06b6d4", label: "Hagel" },
  lightning: { icon: "mdi:weather-lightning", color: "#8b5cf6", label: "Gewitter" },
  "lightning-rainy": { icon: "mdi:weather-lightning-rainy", color: "#8b5cf6", label: "Gewitter, Regen" },
  partlycloudy: { icon: "mdi:weather-partly-cloudy", color: "#f59e0b", label: "Teilweise bewölkt" },
  pouring: { icon: "mdi:weather-pouring", color: "#2563eb", label: "Starkregen" },
  rainy: { icon: "mdi:weather-rainy", color: "#3b82f6", label: "Regen" },
  snowy: { icon: "mdi:weather-snowy", color: "#0ea5e9", label: "Schnee" },
  "snowy-rainy": { icon: "mdi:weather-snowy-rainy", color: "#0ea5e9", label: "Schneeregen" },
  sunny: { icon: "mdi:weather-sunny", color: "#f59e0b", label: "Sonnig" },
  windy: { icon: "mdi:weather-windy", color: "#14b8a6", label: "Windig" },
  "windy-variant": { icon: "mdi:weather-windy-variant", color: "#14b8a6", label: "Windig, bewölkt" },
});
const UNKNOWN = { icon: "mdi:weather-cloudy-alert", color: "#9ca3af", label: "" };

export function conditionInfo(condition) {
  return CONDITIONS[condition] || UNKNOWN;
}

export const INFO_MODES = ["condition", "humidity", "wind", "high_low", "none"];

/** Extra values next to the temperature: key → icon, German name, source. */
export const EXTRAS = Object.freeze({
  humidity: { icon: "mdi:water-percent", label: "Luftfeuchtigkeit" },
  precipitation: { icon: "mdi:weather-pouring", label: "Regenmenge heute", forecast: true },
  precipitation_probability: { icon: "mdi:umbrella-outline", label: "Regenwahrscheinlichkeit", forecast: true },
  wind: { icon: "mdi:weather-windy", label: "Wind" },
  wind_gust: { icon: "mdi:weather-windy-variant", label: "Windböen" },
  pressure: { icon: "mdi:gauge", label: "Luftdruck" },
  uv_index: { icon: "mdi:white-balance-sunny", label: "UV-Index" },
  apparent_temperature: { icon: "mdi:thermometer", label: "Gefühlt" },
  dew_point: { icon: "mdi:thermometer-water", label: "Taupunkt" },
  cloud_coverage: { icon: "mdi:cloud-percent", label: "Bewölkung" },
  visibility: { icon: "mdi:eye-outline", label: "Sichtweite" },
  high_low: { icon: "mdi:thermometer-lines", label: "Höchst- / Tiefstwert", forecast: true },
});
const ENTITY_RE = /^[a-z_]+\.[a-z0-9_]+$/;

function normalizeExtra(e, i, errors) {
  if (typeof e === "string") {
    if (!EXTRAS[e]) errors.push(`extras[${i}] „${e}“ ist unbekannt. Erlaubt: ${Object.keys(EXTRAS).join(", ")} oder { entity: sensor.… }.`);
    return EXTRAS[e] ? { key: e } : null;
  }
  if (isPlainObject(e) && typeof e.entity === "string") {
    if (!ENTITY_RE.test(e.entity)) {
      errors.push(`extras[${i}].entity „${e.entity}“ ist keine gültige Entity-ID.`);
      return null;
    }
    const d = e.decimals === undefined ? undefined : parseNumber(e.decimals);
    if (d !== undefined && (d === null || d < 0 || d > 3 || !Number.isInteger(d))) errors.push(`extras[${i}].decimals muss 0 bis 3 sein.`);
    return { entity: e.entity, attribute: typeof e.attribute === "string" ? e.attribute : undefined, icon: typeof e.icon === "string" ? e.icon : undefined, unit: e.unit === undefined ? undefined : String(e.unit), name: typeof e.name === "string" ? e.name : undefined, decimals: d ?? undefined };
  }
  errors.push(`extras[${i}] muss ein Name (z. B. humidity) oder { entity: … } sein.`);
  return null;
}

const fmt = (v, decimals, locale) => formatNumber(v, { decimals, locale });

/** Today's expected precipitation (daily forecast, else the next 24 hourly entries). */
function precipitationToday(daily, hourly, now) {
  const d = Number(daily?.[0]?.precipitation);
  if (Number.isFinite(d)) return d;
  if (!Array.isArray(hourly)) return null;
  const next = hourly.filter((f) => !f?.datetime || Date.parse(f.datetime) >= now - 3600e3).slice(0, 24);
  const vals = next.map((f) => Number(f?.precipitation)).filter(Number.isFinite);
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
}

function precipitationChance(daily, hourly, now) {
  const d = Number(daily?.[0]?.precipitation_probability);
  if (Number.isFinite(d)) return d;
  if (!Array.isArray(hourly)) return null;
  const vals = hourly
    .filter((f) => !f?.datetime || Date.parse(f.datetime) >= now - 3600e3)
    .slice(0, 12)
    .map((f) => Number(f?.precipitation_probability))
    .filter(Number.isFinite);
  return vals.length ? Math.max(...vals) : null;
}

/**
 * Value of one extra: { icon, text, label } or null when not available.
 * ctx: { states, daily, hourly, locale, now }
 */
export function extraValue(extra, stateObj, ctx = {}) {
  const { locale, daily, hourly, now = Date.now() } = ctx;
  if (extra.entity) {
    const s = ctx.states?.[extra.entity];
    if (!s) return null;
    const raw = extra.attribute ? s.attributes?.[extra.attribute] : s.state;
    if (raw === undefined || raw === null || raw === "" || raw === "unavailable" || raw === "unknown") return null;
    const n = parseNumber(raw);
    const unit = extra.unit ?? (extra.attribute ? "" : s.attributes?.unit_of_measurement || "");
    const text = n === null ? String(raw) : `${fmt(n, extra.decimals ?? (Math.abs(n) < 10 && !Number.isInteger(n) ? 1 : 0), locale)}${unit ? (unit === "%" ? " %" : ` ${unit}`) : ""}`;
    const dc = s.attributes?.device_class;
    const icon = extra.icon || s.attributes?.icon || (dc === "precipitation" || dc === "precipitation_intensity" ? "mdi:weather-pouring" : TYPE_ICONS[dc]) || "mdi:gauge";
    return { icon, text, label: extra.name || s.attributes?.friendly_name || extra.entity };
  }
  const def = EXTRAS[extra.key];
  if (!def) return null;
  const a = stateObj?.attributes || {};
  const num = (v) => (v === undefined || v === null || v === "" ? null : parseNumber(v));
  let text = null;
  switch (extra.key) {
    case "humidity":
    case "cloud_coverage": {
      const v = num(a[extra.key]);
      if (v !== null) text = `${fmt(v, 0, locale)} %`;
      break;
    }
    case "wind":
    case "wind_gust": {
      const v = num(extra.key === "wind" ? a.wind_speed : a.wind_gust_speed);
      if (v !== null) text = `${fmt(v, 0, locale)} ${a.wind_speed_unit || "km/h"}`;
      break;
    }
    case "pressure": {
      const v = num(a.pressure);
      if (v !== null) text = `${fmt(v, 0, locale)} ${a.pressure_unit || "hPa"}`;
      break;
    }
    case "uv_index": {
      const v = num(a.uv_index);
      if (v !== null) text = `UV ${fmt(v, Number.isInteger(v) ? 0 : 1, locale)}`;
      break;
    }
    case "apparent_temperature":
    case "dew_point": {
      const v = num(a[extra.key]);
      if (v !== null) text = `${fmt(v, 0, locale)}°`;
      break;
    }
    case "visibility": {
      const v = num(a.visibility);
      if (v !== null) text = `${fmt(v, v < 10 ? 1 : 0, locale)} ${a.visibility_unit || "km"}`;
      break;
    }
    case "precipitation": {
      const v = precipitationToday(daily, hourly, now);
      if (v !== null) text = `${fmt(v, v > 0 && v < 10 && Math.round(v * 10) % 10 !== 0 ? 1 : 0, locale)} ${a.precipitation_unit || "mm"}`;
      break;
    }
    case "precipitation_probability": {
      const v = precipitationChance(daily, hourly, now);
      if (v !== null) text = `${fmt(v, 0, locale)} %`;
      break;
    }
    case "high_low":
      text = infoText("high_low", stateObj, { daily, locale }) || null;
      break;
    default:
      break;
  }
  return text === null ? null : { icon: def.icon, text, label: def.label };
}
/** Background graph: forecast (auto/hourly/daily), temperature history of the last hours, or none. */
export const FORECAST_MODES = ["auto", "hourly", "daily", "history", "none"];

// weather entity supported_features
const FORECAST_DAILY = 1;
const FORECAST_HOURLY = 2;

export class WeatherConfigError extends Error {}

export function validateWeatherConfig(raw) {
  if (!isPlainObject(raw)) throw new WeatherConfigError("Die Konfiguration muss ein Objekt sein.");
  const errors = [];
  if (typeof raw.entity !== "string" || !WEATHER_RE.test(raw.entity)) errors.push(`entity „${raw.entity ?? ""}“ ist keine weather-Entity (z. B. weather.forecast_home).`);
  const info = raw.info === undefined ? "condition" : raw.info;
  if (!INFO_MODES.includes(info)) errors.push(`info „${raw.info}“ ist ungültig. Erlaubt: ${INFO_MODES.join(", ")}.`);
  const forecast = raw.forecast === undefined ? "auto" : raw.forecast === false ? "none" : raw.forecast;
  if (!FORECAST_MODES.includes(forecast)) errors.push(`forecast „${raw.forecast}“ ist ungültig. Erlaubt: ${FORECAST_MODES.join(", ")}.`);
  let decimals = raw.decimals === undefined ? 0 : parseNumber(raw.decimals);
  if (decimals === null || decimals < 0 || decimals > 2 || !Number.isInteger(decimals)) {
    errors.push("decimals muss 0, 1 oder 2 sein.");
    decimals = 0;
  }
  if (raw.history_entity !== undefined && raw.history_entity !== "" && (typeof raw.history_entity !== "string" || !/^[a-z_]+\.[a-z0-9_]+$/.test(raw.history_entity))) {
    errors.push(`history_entity „${raw.history_entity}“ ist keine gültige Entity-ID.`);
  }
  const hours = raw.hours_to_show === undefined ? 24 : parseNumber(raw.hours_to_show);
  if (hours === null || hours < 1 || hours > 168) errors.push("hours_to_show muss zwischen 1 und 168 liegen.");
  const extras = (Array.isArray(raw.extras) ? raw.extras : raw.extras === undefined ? [] : [raw.extras]).map((e, i) => normalizeExtra(e, i, errors)).filter(Boolean);
  if (errors.length) throw new WeatherConfigError(errors.join("\n"));
  return {
    type: raw.type,
    extras,
    history_entity: typeof raw.history_entity === "string" && raw.history_entity ? raw.history_entity : undefined,
    hours_to_show: hours,
    entity: raw.entity,
    name: typeof raw.name === "string" && raw.name ? raw.name : undefined,
    show_name: raw.show_name === true,
    show_icon: raw.show_icon !== false,
    info,
    forecast,
    decimals,
    color: typeof raw.color === "string" && raw.color ? raw.color : undefined,
  };
}

/** Which forecast to subscribe to (or null). */
export function forecastType(mode, supportedFeatures) {
  const f = Number(supportedFeatures) || 0;
  if (mode === "none" || mode === "history") return null;
  if (mode === "hourly") return f & FORECAST_HOURLY ? "hourly" : null;
  if (mode === "daily") return f & FORECAST_DAILY ? "daily" : null;
  return f & FORECAST_HOURLY ? "hourly" : f & FORECAST_DAILY ? "daily" : null;
}

/** Graph points from forecast entries: next 24 h (hourly) or up to 7 days. */
export function forecastPoints(forecast, type, now = Date.now()) {
  if (!Array.isArray(forecast)) return [];
  const future = forecast.filter((f) => f && Number.isFinite(Number(f.temperature)) && (!f.datetime || Date.parse(f.datetime) >= now - 3600e3));
  return future.slice(0, type === "hourly" ? 24 : 7).map((f) => ({ v: Number(f.temperature) }));
}

/** Second text after the temperature ("Sonnig", "62 %", "12 km/h", "18° / 9°"). */
export function infoText(mode, stateObj, { conditionLabel, daily, locale } = {}) {
  const a = stateObj?.attributes || {};
  if (mode === "condition") return conditionLabel || "";
  if (mode === "humidity") return Number.isFinite(Number(a.humidity)) ? `${formatNumber(Number(a.humidity), { decimals: 0, locale })} %` : "";
  if (mode === "wind") {
    const v = Number(a.wind_speed);
    return Number.isFinite(v) ? `${formatNumber(v, { decimals: 0, locale })} ${a.wind_speed_unit || "km/h"}` : "";
  }
  if (mode === "high_low") {
    const today = Array.isArray(daily) ? daily[0] : null;
    const hi = Number(today?.temperature);
    const lo = Number(today?.templow);
    if (!Number.isFinite(hi)) return "";
    return Number.isFinite(lo) ? `${formatNumber(hi, { decimals: 0, locale })}° / ${formatNumber(lo, { decimals: 0, locale })}°` : `${formatNumber(hi, { decimals: 0, locale })}°`;
  }
  return "";
}

const STYLES = `
:host { display: inline-block; max-width: 100%; }
.badge {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: var(--ha-badge-size, 36px);
  min-width: var(--ha-badge-size, 36px);
  max-width: 100%;
  padding: 0 14px 0 4px;
  border-radius: var(--ha-badge-border-radius, calc(var(--ha-badge-size, 36px) / 2));
  border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
  background: var(--ha-card-background, var(--card-background-color, #fff));
  color: var(--primary-text-color);
  overflow: hidden;
  isolation: isolate;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  font-family: inherit;
  --sgwb-accent: var(--primary-color, #03a9f4);
}
.badge.no-icon { padding-left: 14px; }
.badge:focus-visible { outline: 2px solid var(--sgwb-accent); outline-offset: 2px; }
.badge::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  background: color-mix(in srgb, var(--sgwb-accent) 7%, transparent);
}
.graph {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 44%;
  z-index: -1;
  pointer-events: none;
  opacity: 0.85;
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 45%, #000 92%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 45%, #000 92%, transparent 100%);
}
.graph svg { display: block; width: 100%; height: 100%; }
.icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--ha-badge-size, 36px) - 8px);
  height: calc(var(--ha-badge-size, 36px) - 8px);
  border-radius: 50%;
  background: color-mix(in srgb, var(--sgwb-accent) 18%, transparent);
  color: var(--sgwb-accent);
  --mdc-icon-size: 18px;
}
.text { display: flex; flex-direction: column; justify-content: center; min-width: 0; line-height: 1.15; text-shadow: 0 0 3px var(--ha-card-background, var(--card-background-color, #fff)), 0 0 1px var(--ha-card-background, var(--card-background-color, #fff)); }
.label { font-size: 10px; font-weight: 500; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.1px; }
.line { display: flex; align-items: baseline; gap: 6px; min-width: 0; white-space: nowrap; }
.temp { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; }
.info { font-size: 12px; font-weight: 500; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; }
.extras { display: flex; align-items: center; gap: 10px; flex: none; padding-left: 10px; margin-left: 2px; border-left: 1px solid color-mix(in srgb, var(--secondary-text-color) 28%, transparent); height: 18px; text-shadow: 0 0 3px var(--ha-card-background, var(--card-background-color, #fff)); }
.extra { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; white-space: nowrap; color: var(--primary-text-color); }
.extra ha-icon { --mdc-icon-size: 15px; color: var(--sgwb-accent); flex: none; }
.extra.muted { display: none; }
.hidden { display: none !important; }
.warn { color: var(--error-color, #db4437); font-size: 12px; }
`;

function el(tag, className, attrs) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

let uid = 0;

export class SmartGraphWeatherBadge extends Base {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uid = `sgwb${(uid += 1)}`;
    this._forecast = { hourly: null, daily: null };
  }

  static getConfigElement() {
    return document.createElement(WEATHER_EDITOR_TAG);
  }

  static getStubConfig(hass) {
    const id = Object.keys(hass?.states || {}).find((e) => e.startsWith("weather.")) || "weather.forecast_home";
    return { entity: id };
  }

  setConfig(config) {
    try {
      this._config = validateWeatherConfig(config);
      this._error = null;
    } catch (err) {
      this._config = null;
      this._error = err.message || String(err);
    }
    this._unsubscribe();
    this._forecast = { hourly: null, daily: null };
    this._history = [];
    this._historyAt = 0;
    this._build();
    if (this._hass) this.hass = this._hass;
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    if (!this._config || !this._els) return;
    this._subscribe();
    this._loadHistory();
    if (!prev || prev.states?.[this._config.entity] !== hass.states?.[this._config.entity] || !this._drawn) this._update();
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    if (this._hass && this._config) this._subscribe();
    if (typeof ResizeObserver !== "undefined" && this._els && !this._ro) {
      this._ro = new ResizeObserver(() => this._drawGraph());
      this._ro.observe(this._els.badge);
    }
  }

  disconnectedCallback() {
    this._unsubscribe();
    this._ro?.disconnect();
    this._ro = null;
  }

  _build() {
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = el("style");
    style.textContent = STYLES;
    const badge = el("div", "badge", { role: "button", tabindex: "0" });
    root.append(style, badge);
    this._els = null;
    this._drawn = false;
    if (!this._config) {
      const warn = el("span", "warn");
      warn.textContent = this._error || "Ungültige Konfiguration.";
      badge.append(warn);
      return;
    }
    const c = this._config;
    const graph = el("div", "graph", { "aria-hidden": "true" });
    const icon = el("span", `icon${c.show_icon ? "" : " hidden"}`);
    const glyph = el("ha-icon");
    icon.append(glyph);
    const text = el("div", "text");
    const label = el("span", `label${c.show_name ? "" : " hidden"}`);
    const line = el("span", "line");
    const temp = el("span", "temp");
    const info = el("span", "info");
    line.append(temp, info);
    text.append(label, line);
    badge.classList.toggle("no-icon", !c.show_icon);
    const extras = el("div", `extras${c.extras.length ? "" : " hidden"}`);
    const extraEls = c.extras.map(() => {
      const item = el("span", "extra muted");
      const ic = el("ha-icon");
      const val = el("span");
      item.append(ic, val);
      extras.append(item);
      return { item, ic, val };
    });
    badge.append(graph, icon, text, extras);
    const open = () => this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: c.entity }, bubbles: true, composed: true }));
    badge.addEventListener("click", open);
    badge.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        open();
      }
    });
    this._els = { badge, graph, glyph, label, temp, info, extras, extraEls };
    if (this.isConnected) this.connectedCallback();
  }

  _subscribe() {
    const c = this._config;
    const s = this._hass?.states?.[c.entity];
    const conn = this._hass?.connection;
    if (!s || !conn?.subscribeMessage) return;
    const wanted = new Set();
    const graphType = forecastType(c.forecast, s.attributes?.supported_features);
    if (graphType) wanted.add(graphType);
    const needsDaily = c.info === "high_low" || c.extras.some((e) => e.key && EXTRAS[e.key].forecast);
    if (needsDaily) {
      // daily forecast for today's values, hourly as fallback
      const t = forecastType("daily", s.attributes?.supported_features) || forecastType("hourly", s.attributes?.supported_features);
      if (t) wanted.add(t);
    }
    const key = `${c.entity}|${[...wanted].sort().join(",")}`;
    if (this._subKey === key) return;
    this._unsubscribe();
    this._subKey = key;
    this._graphType = graphType;
    this._subs = [...wanted].map((type) =>
      conn
        .subscribeMessage(
          (msg) => {
            this._forecast[type] = Array.isArray(msg?.forecast) ? msg.forecast : [];
            this._update();
          },
          { type: "weather/subscribe_forecast", forecast_type: type, entity_id: c.entity }
        )
        .catch(() => null)
    );
  }

  /** Temperature history of the last hours (weather attribute or own sensor), refreshed every 5 minutes. */
  _loadHistory() {
    const c = this._config;
    if (c.forecast !== "history" || !this._hass || this._historyLoading) return;
    if (this._historyAt && Date.now() - this._historyAt < 300000) return;
    this._historyLoading = true;
    const entityId = c.history_entity || c.entity;
    const attribute = c.history_entity ? undefined : "temperature";
    fetchHistory(this._hass, { entityId, attribute, hours: c.hours_to_show, updateInterval: 300 })
      .then((res) => {
        const data = res.points?.length ? reduceSeries(res.points, { start: res.start, end: res.end, buckets: 48, aggregation: "average", fill: "hold" }) : [];
        this._history = data.filter((d) => Number.isFinite(d?.v)).length > 1 ? data : [];
      })
      .catch(() => {
        this._history = [];
      })
      .finally(() => {
        this._historyLoading = false;
        this._historyAt = Date.now();
        this._drawGraph();
      });
  }

  _unsubscribe() {
    for (const p of this._subs || []) Promise.resolve(p).then((unsub) => typeof unsub === "function" && unsub());
    this._subs = [];
    this._subKey = null;
  }

  _update() {
    const c = this._config;
    const els = this._els;
    if (!c || !els || !this._hass) return;
    this._drawn = true;
    const s = this._hass.states?.[c.entity];
    const unavailable = !s || s.state === "unavailable" || s.state === "unknown";
    const cond = conditionInfo(s?.state);
    const accent = c.color || (unavailable ? "var(--disabled-text-color, #9ca3af)" : cond.color);
    els.badge.style.setProperty("--sgwb-accent", accent);
    const icon = unavailable ? "mdi:weather-cloudy-alert" : cond.icon;
    if (els.glyph.icon !== icon) {
      els.glyph.icon = icon;
      els.glyph.setAttribute("icon", icon);
    }
    const name = c.name || s?.attributes?.friendly_name || c.entity;
    els.label.textContent = name;
    const locale = getNumberLocale(this._hass);
    const t = Number(s?.attributes?.temperature);
    const unit = s?.attributes?.temperature_unit || "°C";
    const tempText = unavailable || !Number.isFinite(t) ? "–" : `${formatNumber(t, { decimals: c.decimals, locale })} ${unit}`;
    if (els.temp.textContent !== tempText) els.temp.textContent = tempText;
    const label = unavailable
      ? "Nicht verfügbar"
      : (this._hass.formatEntityState && s ? this._hass.formatEntityState(s) : "") || cond.label || s.state;
    const info = unavailable ? "Nicht verfügbar" : infoText(c.info, s, { conditionLabel: label, daily: this._forecast.daily, locale });
    if (els.info.textContent !== info) els.info.textContent = info;
    els.info.classList.toggle("hidden", !info);
    const extraTexts = [];
    c.extras.forEach((ex, i) => {
      const v = unavailable && !ex.entity ? null : extraValue(ex, s, { states: this._hass.states, daily: this._forecast.daily, hourly: this._forecast.hourly, locale });
      const e = els.extraEls[i];
      e.item.classList.toggle("muted", !v);
      if (!v) return;
      if (e.ic.icon !== v.icon) {
        e.ic.icon = v.icon;
        e.ic.setAttribute("icon", v.icon);
      }
      if (e.val.textContent !== v.text) e.val.textContent = v.text;
      e.item.title = v.label;
      extraTexts.push(`${v.label} ${v.text}`);
    });
    els.extras.classList.toggle("hidden", !extraTexts.length);
    els.badge.setAttribute("aria-label", [c.show_name ? name : "", tempText, info, ...extraTexts].filter(Boolean).join(", "));
    els.badge.title = [name, tempText, label, ...extraTexts].filter(Boolean).join(" · ");
    this._drawGraph();
  }

  _drawGraph() {
    const els = this._els;
    if (!els || !this._config) return;
    const type = this._graphType;
    const points = this._config.forecast === "history" ? this._history || [] : type ? forecastPoints(this._forecast[type], type) : [];
    const w = els.graph.clientWidth;
    const h = els.graph.clientHeight;
    const svg =
      points.length > 1 && w && h
        ? renderGraphSVG({ data: points, width: w, height: h, type: "smooth-area", color: "var(--sgwb-accent)", baseline: "bottom", headroom: 0.15, lineWidth: 1.25, fillOpacity: 0.22, idPrefix: this._uid })
        : "";
    if (svg !== this._lastSvg) {
      els.graph.innerHTML = svg;
      this._lastSvg = svg;
    }
  }
}

// ---- editor

const LABELS = {
  entity: "Wetter-Entity",
  name: "Name (optional)",
  show_name: "Name über der Temperatur",
  show_icon: "Wettersymbol",
  extras: "Zusätzliche Werte (Badge wird breiter)",
  extra_entities: "Eigene Sensoren als zusätzliche Werte (z. B. Regenmesser)",
  info: "Zusatz neben der Temperatur",
  forecast: "Verlauf im Hintergrund",
  history_entity: "Eigener Temperatursensor für den Verlauf (optional)",
  hours_to_show: "Zeitraum des Verlaufs (Stunden)",
  decimals: "Nachkommastellen",
};

export function weatherToForm(config) {
  const c = config || {};
  return {
    entity: c.entity,
    name: c.name,
    show_name: c.show_name === true,
    show_icon: c.show_icon !== false,
    info: c.info || "condition",
    forecast: c.forecast === false ? "none" : c.forecast || "auto",
    history_entity: c.history_entity,
    hours_to_show: c.hours_to_show ?? 24,
    decimals: c.decimals ?? 0,
    extras: (Array.isArray(c.extras) ? c.extras : []).filter((e) => typeof e === "string"),
    extra_entities: (Array.isArray(c.extras) ? c.extras : []).filter((e) => isPlainObject(e) && e.entity).map((e) => e.entity),
  };
}

export function weatherFromForm(config, form) {
  const out = { ...(config || {}) };
  const d = form || {};
  if (d.entity) out.entity = d.entity;
  if (typeof d.name === "string" && d.name) out.name = d.name;
  else delete out.name;
  if (d.show_name === true) out.show_name = true;
  else delete out.show_name;
  if (d.show_icon === false) out.show_icon = false;
  else delete out.show_icon;
  if (d.info && d.info !== "condition") out.info = d.info;
  else delete out.info;
  if (d.forecast && d.forecast !== "auto") out.forecast = d.forecast;
  else delete out.forecast;
  if (out.forecast === "history" && typeof d.history_entity === "string" && d.history_entity) out.history_entity = d.history_entity;
  else if (out.forecast !== "history" || d.history_entity !== undefined) delete out.history_entity;
  if (out.forecast === "history" && typeof d.hours_to_show === "number" && d.hours_to_show !== 24) out.hours_to_show = d.hours_to_show;
  else delete out.hours_to_show;
  if (d.extras !== undefined || d.extra_entities !== undefined) {
    const old = Array.isArray(out.extras) ? out.extras : [];
    const keys = Array.isArray(d.extras) ? d.extras : old.filter((e) => typeof e === "string");
    const ids = Array.isArray(d.extra_entities) ? d.extra_entities : old.filter((e) => isPlainObject(e) && e.entity).map((e) => e.entity);
    const list = [...keys, ...ids.map((id) => old.find((e) => isPlainObject(e) && e.entity === id) || { entity: id })];
    if (list.length) out.extras = list;
    else delete out.extras;
  }
  if (typeof d.decimals === "number" && d.decimals !== 0) out.decimals = d.decimals;
  else delete out.decimals;
  return out;
}

export class SmartGraphWeatherBadgeEditor extends Base {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }

  _render() {
    if (!customElements.get("ha-form")) {
      this.textContent = "Der visuelle Editor ist nicht verfügbar. Bitte den YAML-Modus verwenden.";
      return;
    }
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => LABELS[s.name] ?? s.name;
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const next = weatherFromForm(this._config, ev.detail.value);
        this._config = next;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
      });
      this.append(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = [
      { name: "entity", required: true, selector: { entity: { filter: { domain: "weather" } } } },
      { name: "name", selector: { text: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_icon", selector: { boolean: {} } },
          { name: "show_name", selector: { boolean: {} } },
        ],
      },
      {
        name: "info",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "condition", label: "Wetterzustand (z. B. Sonnig)" },
              { value: "high_low", label: "Höchst- / Tiefstwert heute" },
              { value: "humidity", label: "Luftfeuchtigkeit" },
              { value: "wind", label: "Wind" },
              { value: "none", label: "Nichts" },
            ],
          },
        },
      },
      {
        name: "forecast",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "auto", label: "Automatisch (stündlich, sonst täglich)" },
              { value: "hourly", label: "Vorhersage nächste 24 Stunden" },
              { value: "daily", label: "Vorhersage nächste Tage" },
              { value: "history", label: "Temperaturverlauf der letzten Stunden (Standard 24 h)" },
              { value: "none", label: "Kein Verlauf" },
            ],
          },
        },
      },
      {
        name: "extras",
        selector: { select: { multiple: true, mode: "list", options: Object.entries(EXTRAS).map(([value, d]) => ({ value, label: d.label })) } },
      },
      { name: "extra_entities", selector: { entity: { multiple: true, filter: { domain: "sensor" } } } },
      ...(this._config?.forecast === "history"
        ? [
            { name: "history_entity", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
            { name: "hours_to_show", selector: { number: { min: 1, max: 168, mode: "box", unit_of_measurement: "h" } } },
          ]
        : []),
      { name: "decimals", selector: { number: { min: 0, max: 2, mode: "box" } } },
    ];
    this._form.data = weatherToForm(this._config);
  }
}

export function registerWeatherBadge() {
  if (typeof customElements === "undefined" || customElements.get(WEATHER_TAG)) return;
  customElements.define(WEATHER_TAG, SmartGraphWeatherBadge);
  if (!customElements.get(WEATHER_EDITOR_TAG)) customElements.define(WEATHER_EDITOR_TAG, SmartGraphWeatherBadgeEditor);
  window.customBadges = window.customBadges || [];
  window.customBadges.push({
    type: WEATHER_TAG,
    name: "Smart Graph Weather Badge",
    description: "Wetter als Badge im Stil der Smart-Graph-Info-Karte: Symbol, Temperatur, Zustand und Vorhersage-Verlauf.",
    preview: true,
    documentationURL: "https://github.com/rest2178/smart-graph-button-card",
  });
}
