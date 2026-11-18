/**
 * Smart Graph Overview Card – several sensors in one card (e.g. room air):
 * overall rating, all values side by side and one history graph that can be
 * switched between the sensors.
 *
 * type: custom:smart-graph-overview-card
 */
import { fetchHistory } from "./history-provider.js";
import { reduceSeries, appendPoint } from "./data-reducer.js";
import { renderGraphSVG } from "./graph-renderer.js";
import { formatNumber, getNumberLocale, getLanguage } from "./value-formatter.js";
import { resolveLevels, findLevel, overallRating, TYPE_COLORS, TYPE_ICONS, TYPE_NAMES, RATINGS } from "./levels.js";
import { parseNumber, isPlainObject, isSafeCssValue } from "./utils.js";
import { isUnavailableState } from "./state-resolver.js";

export const OVERVIEW_TAG = "smart-graph-overview-card";
export const OVERVIEW_EDITOR_TAG = "smart-graph-overview-card-editor";

const Base = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
const ENTITY_RE = /^[a-z_]+\.[a-z0-9_]+$/;
const FALLBACK_COLOR = "var(--primary-color, #03a9f4)";

export class OverviewConfigError extends Error {}

/** Validate and normalise the overview card config. Throws OverviewConfigError. */
export function validateOverviewConfig(raw) {
  if (!isPlainObject(raw)) throw new OverviewConfigError("Die Konfiguration muss ein Objekt sein.");
  const errors = [];
  const list = Array.isArray(raw.entities) ? raw.entities : [];
  if (!list.length) errors.push("entities fehlt: mindestens ein Sensor wird benötigt.");
  const entities = list.map((e, i) => {
    const item = typeof e === "string" ? { entity: e } : isPlainObject(e) ? { ...e } : {};
    if (typeof item.entity !== "string" || !ENTITY_RE.test(item.entity)) errors.push(`entities[${i}]: „${item.entity ?? e}“ ist keine gültige Entity-ID.`);
    if (item.color !== undefined && !isSafeCssValue(item.color)) errors.push(`entities[${i}].color ist ungültig.`);
    if (item.decimals !== undefined) {
      const d = parseNumber(item.decimals);
      if (d === null || d < 0 || d > 6 || !Number.isInteger(d)) errors.push(`entities[${i}].decimals muss 0 bis 6 sein.`);
      else item.decimals = d;
    }
    if (item.levels === undefined) item.levels = "auto";
    return item;
  });
  const hours = raw.hours_to_show === undefined ? 24 : parseNumber(raw.hours_to_show);
  if (hours === null || hours <= 0 || hours > 8760) errors.push("hours_to_show muss zwischen 0 und 8760 liegen.");
  const interval = raw.update_interval === undefined ? 300 : parseNumber(raw.update_interval);
  if (interval === null || interval < 10) errors.push("update_interval muss mindestens 10 Sekunden sein.");
  const graphEntity = raw.graph_entity ?? entities[0]?.entity;
  if (graphEntity !== undefined && !entities.some((e) => e.entity === graphEntity)) errors.push("graph_entity muss einer der entities sein.");
  const ratings = Array.isArray(raw.ratings) ? raw.ratings.map((r, i) => ({ ...RATINGS[Math.min(i, RATINGS.length - 1)], ...(isPlainObject(r) ? r : {}) })) : RATINGS;
  if (errors.length) throw new OverviewConfigError(errors.join("\n"));
  return {
    type: raw.type,
    title: raw.title === undefined ? "Luftqualität" : String(raw.title ?? ""),
    icon: typeof raw.rating_icon === "string" ? raw.rating_icon : "mdi:leaf",
    show_rating: raw.show_rating !== false,
    show_graph: raw.show_graph !== false,
    show_axis: raw.show_axis !== false,
    entities,
    graph_entity: graphEntity,
    hours_to_show: hours,
    update_interval: interval,
    max_points: Math.max(10, Math.min(300, parseNumber(raw.max_points) ?? 96)),
    graph_height: isSafeCssValue(raw.graph_height) ? String(raw.graph_height) : "86px",
    ratings,
  };
}

/** Time axis ticks between start and end (ms): aligned to full hours/days. */
export function timeTicks(start, end, maxTicks = 6) {
  const span = end - start;
  if (!(span > 0)) return [];
  const hour = 3600e3;
  const steps = [1, 2, 3, 4, 6, 8, 12, 24, 48, 72, 168].map((h) => h * hour);
  const step = steps.find((s) => span / s <= maxTicks) ?? steps[steps.length - 1];
  const out = [];
  // align to local time
  const first = new Date(start);
  first.setMinutes(0, 0, 0);
  if (step >= 24 * hour) first.setHours(0);
  let t = first.getTime();
  const stepHours = step / hour;
  if (stepHours < 24) {
    while (new Date(t).getHours() % stepHours !== 0) t += hour;
  }
  for (; t <= end; t += step) if (t >= start) out.push(t);
  return out;
}

const STYLES = `
:host { display: block; }
ha-card.sgoc {
  display: block;
  container-type: inline-size;
  box-sizing: border-box;
  padding: 16px;
  border-radius: var(--ha-card-border-radius, 16px);
  color: var(--primary-text-color);
  overflow: hidden;
}
.top { display: flex; align-items: center; gap: 16px; min-width: 0; }
.rating { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 0 1 auto; }
.rating.hidden, .sep.hidden, .panel.hidden, .axis.hidden { display: none; }
.r-icon {
  flex: none; width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--sgoc-rating, #22c55e) 16%, transparent);
  color: var(--sgoc-rating, #22c55e);
  --mdc-icon-size: 28px;
}
.r-texts { display: flex; flex-direction: column; min-width: 0; }
.r-title { font-size: 13px; font-weight: 600; }
.r-label { font-size: 22px; font-weight: 700; line-height: 1.15; color: color-mix(in srgb, var(--sgoc-rating, #22c55e) 78%, var(--primary-text-color)); }
.r-text { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sep { align-self: stretch; width: 1px; background: var(--divider-color, rgba(127, 127, 127, 0.25)); flex: none; }
.items { display: flex; flex: 1 1 auto; justify-content: space-around; gap: 8px; min-width: 0; }
.item {
  all: unset; box-sizing: border-box; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  min-width: 0; padding: 4px 6px; border-radius: 10px;
}
.item:hover { background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
.item:focus-visible { box-shadow: 0 0 0 2px var(--primary-color, #03a9f4); }
.i-icon {
  width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); --mdc-icon-size: 18px;
}
.i-value { font-size: 16px; font-weight: 700; white-space: nowrap; }
.i-unit { font-size: 0.72em; font-weight: 500; color: var(--secondary-text-color); margin-left: 3px; }
.panel {
  margin-top: 14px; padding: 10px 12px 6px; border-radius: 12px;
  background: color-mix(in srgb, var(--primary-text-color) 3.5%, transparent);
}
.p-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.p-title { font-size: 12px; color: var(--secondary-text-color); }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip {
  all: unset; box-sizing: border-box; cursor: pointer; font-size: 11.5px; padding: 4px 11px; border-radius: 999px;
  background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); color: var(--primary-text-color);
}
.chip:focus-visible { box-shadow: 0 0 0 2px var(--primary-color, #03a9f4); }
.chip.active { background: color-mix(in srgb, var(--c) 80%, #000); color: #fff; }
.chart { position: relative; height: var(--sgoc-graph-height, 86px); margin-top: 8px; }
.chart svg { display: block; width: 100%; height: 100%; }
.axis { position: relative; height: 16px; font-size: 10.5px; color: var(--secondary-text-color); }
.axis span { position: absolute; top: 2px; transform: translateX(-50%); white-space: nowrap; }
.axis span.first { transform: none; }
.empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--secondary-text-color); }
.empty.hidden { display: none; }
@container (max-width: 560px) {
  .top { flex-direction: column; align-items: stretch; gap: 12px; }
  .sep { display: none; }
  .items { justify-content: space-between; flex-wrap: wrap; }
  .p-head { flex-direction: column; align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
ha-card.sgoc-error { display: block; padding: 12px 14px; border: 1px solid var(--error-color, #db4437); }
ha-card.sgoc-error .title { font-weight: 600; color: var(--error-color, #db4437); margin-bottom: 4px; }
ha-card.sgoc-error .msg { white-space: pre-wrap; font-size: 13px; }
`;

function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

let uid = 0;

export class SmartGraphOverviewCard extends Base {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uid = `sgoc${++uid}`;
    this._points = [];
    this._loaded = false;
    this._token = 0;
    this._size = { w: 0, h: 0 };
  }

  static getConfigElement() {
    return document.createElement(OVERVIEW_EDITOR_TAG);
  }

  static getStubConfig(hass) {
    const states = hass?.states || {};
    const ids = Object.keys(states).filter((id) => id.startsWith("sensor."));
    const pick = [];
    for (const dc of ["temperature", "humidity", "carbon_dioxide", "pm25"]) {
      const id = ids.find((i) => states[i]?.attributes?.device_class === dc);
      if (id) pick.push(id);
    }
    return { title: "Luftqualität", entities: pick.length ? pick : ids.slice(0, 3).length ? ids.slice(0, 3) : ["sensor.example"] };
  }

  setConfig(config) {
    try {
      this._config = validateOverviewConfig(config);
      this._error = null;
    } catch (err) {
      this._config = null;
      this._error = err.message;
    }
    this._selected = this._config?.graph_entity;
    this._points = [];
    this._loaded = false;
    this._token++;
    this._render();
    if (this._connected) this._attach();
  }

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    if (!this._config || !this._els) return;
    let changed = !old || old.themes !== hass.themes || old.locale !== hass.locale;
    for (const e of this._config.entities) if (old?.states?.[e.entity] !== hass.states?.[e.entity]) changed = true;
    if (changed) this._update();
    const s = hass.states?.[this._selected];
    if (this._loaded && s && s !== old?.states?.[this._selected]) {
      const t = Date.parse(s.last_changed || s.last_updated);
      if (Number.isFinite(t)) {
        this._points = appendPoint(this._points, { t, v: parseNumber(s.state) }, Date.now() - this._config.hours_to_show * 3600e3);
        this._drawGraph();
      }
    }
    if (!this._loaded && this._connected && !this._fetching) this._fetch();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return this._config?.show_graph === false ? 2 : 5;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  connectedCallback() {
    this._connected = true;
    if (this._config) this._attach();
  }

  disconnectedCallback() {
    this._connected = false;
    this._detach();
  }

  _attach() {
    this._detach();
    if (!this._config || !this._els) return;
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver((entries) => {
        const r = entries[entries.length - 1]?.contentRect;
        if (!r) return;
        const w = Math.round(r.width);
        const h = Math.round(r.height);
        if (w !== this._size.w || h !== this._size.h) {
          this._size = { w, h };
          this._drawGraph();
        }
      });
      this._ro.observe(this._els.chart);
    }
    this._timer = setInterval(() => this._fetch(), this._config.update_interval * 1000);
    if (this._hass) this._fetch();
  }

  _detach() {
    if (this._ro) this._ro.disconnect();
    this._ro = null;
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    this._token++;
    this._fetching = false;
  }

  // ------------------------------------------------------------ rendering

  _render() {
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = el("style");
    style.textContent = STYLES;
    if (!this._config) {
      const card = el("ha-card", "sgoc-error", { role: "alert" });
      const t = el("div", "title");
      t.textContent = "Smart Graph Overview Card – Konfigurationsfehler";
      const m = el("div", "msg");
      m.textContent = this._error || "Unbekannter Fehler";
      card.append(t, m);
      root.append(style, card);
      this._els = null;
      return;
    }
    const c = this._config;
    const card = el("ha-card", "sgoc");
    const top = el("div", "top");
    const rating = el("div", `rating${c.show_rating ? "" : " hidden"}`);
    const rIcon = el("div", "r-icon");
    const rGlyph = el("ha-icon", "", { icon: c.icon });
    rGlyph.icon = c.icon;
    rIcon.append(rGlyph);
    const rTexts = el("div", "r-texts");
    const rTitle = el("div", "r-title");
    rTitle.textContent = c.title;
    const rLabel = el("div", "r-label");
    const rText = el("div", "r-text");
    rTexts.append(rTitle, rLabel, rText);
    rating.append(rIcon, rTexts);
    const sep = el("div", `sep${c.show_rating ? "" : " hidden"}`);
    const items = el("div", "items");
    const itemEls = c.entities.map((e) => {
      const btn = el("button", "item", { type: "button" });
      const icon = el("div", "i-icon");
      const glyph = el("ha-icon");
      icon.append(glyph);
      const value = el("div", "i-value");
      const num = el("span", "i-num");
      const unit = el("span", "i-unit");
      value.append(num, unit);
      btn.append(icon, value);
      btn.addEventListener("click", () => this._moreInfo(e.entity));
      items.append(btn);
      return { btn, icon, glyph, num, unit };
    });
    top.append(rating, sep, items);

    const panel = el("div", `panel${c.show_graph ? "" : " hidden"}`);
    const head = el("div", "p-head");
    const pTitle = el("div", "p-title");
    pTitle.textContent = `Verlauf (letzte ${formatHours(c.hours_to_show)})`;
    const chips = el("div", "chips", { role: "tablist" });
    const chipEls = c.entities.map((e) => {
      const chip = el("button", "chip", { type: "button", role: "tab" });
      chip.addEventListener("click", () => this._select(e.entity));
      chips.append(chip);
      return chip;
    });
    if (c.entities.length < 2) chips.style.display = "none";
    head.append(pTitle, chips);
    const chart = el("div", "chart");
    chart.style.setProperty("--sgoc-graph-height", c.graph_height);
    const graph = el("div", "graph-svg");
    graph.style.cssText = "position:absolute;inset:0";
    const empty = el("div", "empty hidden");
    chart.append(graph, empty);
    const axis = el("div", `axis${c.show_axis ? "" : " hidden"}`);
    panel.append(head, chart, axis);
    card.append(top, panel);
    root.append(style, card);
    this._els = { card, rating, rLabel, rText, rIcon, items: itemEls, chips: chipEls, chart, graph, empty, axis, pTitle };
    if (this._hass) this._update();
  }

  _info(e) {
    const s = this._hass?.states?.[e.entity];
    const dc = s?.attributes?.device_class;
    const color = e.color || TYPE_COLORS[dc] || FALLBACK_COLOR;
    const name = e.name || TYPE_NAMES[dc] || s?.attributes?.friendly_name || e.entity;
    const icon = e.icon || s?.attributes?.icon || TYPE_ICONS[dc] || "mdi:eye";
    return { s, dc, color, name, icon };
  }

  _update() {
    const c = this._config;
    const els = this._els;
    if (!c || !els || !this._hass) return;
    const locale = getNumberLocale(this._hass);
    const levels = [];
    c.entities.forEach((e, i) => {
      const { s, dc, color, name, icon } = this._info(e);
      const ref = els.items[i];
      ref.btn.style.setProperty("--c", color);
      if (ref.glyph.icon !== icon) {
        ref.glyph.icon = icon;
        ref.glyph.setAttribute("icon", icon);
      }
      const unavailable = !s || isUnavailableState(s.state);
      const n = unavailable ? null : parseNumber(s.state);
      let decimals = e.decimals;
      if (decimals === undefined) {
        const p = this._hass.entities?.[e.entity]?.display_precision;
        if (Number.isInteger(p)) decimals = p;
      }
      ref.num.textContent = n === null ? (unavailable ? "–" : String(s.state)) : formatNumber(n, { decimals, locale }) ?? "–";
      const unit = e.unit ?? s?.attributes?.unit_of_measurement ?? "";
      ref.unit.textContent = n === null ? "" : unit;
      ref.btn.title = name;
      ref.btn.setAttribute("aria-label", `${name}: ${ref.num.textContent}${unit ? ` ${unit}` : ""}`);
      const chip = els.chips[i];
      chip.textContent = name;
      chip.style.setProperty("--c", color);
      chip.classList.toggle("active", e.entity === this._selected);
      chip.setAttribute("aria-selected", String(e.entity === this._selected));
      if (!unavailable) levels.push(findLevel(n, resolveLevels(e.levels, dc)));
    });
    const r = overallRating(levels, c.ratings);
    els.rating.style.setProperty("--sgoc-rating", r?.color || "var(--secondary-text-color)");
    els.rLabel.textContent = r ? r.label : "–";
    els.rText.textContent = r ? r.text : "Keine Bewertung möglich";
  }

  _select(entityId) {
    if (entityId === this._selected) return;
    this._selected = entityId;
    this._points = [];
    this._loaded = false;
    this._token++;
    this._fetching = false;
    this._update();
    this._drawGraph();
    this._fetch();
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  async _fetch() {
    const c = this._config;
    if (!c?.show_graph || !this._hass || !this._connected || !this._selected) return;
    const token = ++this._token;
    this._fetching = true;
    const entityId = this._selected;
    const res = await fetchHistory(this._hass, {
      entityId,
      hours: c.hours_to_show,
      updateInterval: c.update_interval,
      resolution: `${c.max_points}:average:hold`,
    });
    if (token !== this._token || !this._config) return;
    this._fetching = false;
    let points = res.status === "error" && this._points.length ? this._points : res.points;
    const cur = this._hass.states?.[entityId];
    if (cur) {
      const t = Date.parse(cur.last_changed || cur.last_updated);
      const last = points[points.length - 1];
      if (Number.isFinite(t) && (!last || t > last.t)) points = points.concat([{ t, v: parseNumber(cur.state) }]);
    }
    this._points = points;
    this._loaded = true;
    this._status = res.status;
    this._drawGraph();
  }

  _drawGraph() {
    const c = this._config;
    const els = this._els;
    if (!c || !els || !c.show_graph) return;
    let { w, h } = this._size;
    if ((!w || !h) && typeof ResizeObserver === "undefined") {
      w = els.chart.clientWidth;
      h = els.chart.clientHeight;
    }
    const end = Date.now();
    const start = end - c.hours_to_show * 3600e3;
    this._drawAxis(start, end);
    if (!w || !h) return;
    const entity = c.entities.find((e) => e.entity === this._selected);
    const color = entity ? this._info(entity).color : FALLBACK_COLOR;
    const data = reduceSeries(this._points, { start, end, buckets: c.max_points, aggregation: "average", fill: "hold" });
    const svg = renderGraphSVG({
      data,
      width: w,
      height: h,
      type: "smooth-area",
      color,
      baseline: "bottom",
      headroom: 0.3,
      lineWidth: 2,
      fillOpacity: 0.3,
      idPrefix: this._uid,
    });
    if (svg !== this._lastSvg) {
      els.graph.innerHTML = svg;
      this._lastSvg = svg;
    }
    const hasData = Boolean(svg);
    els.empty.classList.toggle("hidden", hasData || !this._loaded);
    els.empty.textContent = this._status === "error" ? "Verlauf nicht verfügbar" : "Keine Daten im Zeitraum";
  }

  _drawAxis(start, end) {
    const els = this._els;
    if (!this._config.show_axis) return;
    const language = getLanguage(this._hass);
    const multiDay = end - start > 48 * 3600e3;
    const fmt = new Intl.DateTimeFormat(language || undefined, multiDay ? { day: "2-digit", month: "2-digit" } : { hour: "2-digit", minute: "2-digit" });
    const ticks = timeTicks(start, end, (this._size.w || 600) < 420 ? 4 : 6);
    const key = ticks.map((t) => fmt.format(t)).join("|") + (this._size.w || 0);
    if (key === this._axisKey) return;
    this._axisKey = key;
    els.axis.replaceChildren();
    for (const t of ticks) {
      const pos = ((t - start) / (end - start)) * 100;
      if (pos > 96) continue; // a label at the very right edge would be cut off
      const span = el("span", pos < 4 ? "first" : "");
      span.style.left = `${pos}%`;
      span.textContent = fmt.format(t);
      els.axis.append(span);
    }
  }
}

function formatHours(h) {
  if (h % 24 === 0 && h >= 48) return `${h / 24} Tage`;
  if (h === 24) return "24 Stunden";
  return h === 1 ? "Stunde" : `${formatNumber(h, { decimals: h % 1 ? 1 : 0, locale: "de" })} Stunden`;
}

// ------------------------------------------------------------ editor

const LABELS = {
  title: "Titel",
  entities: "Sensoren",
  graph_entity: "Graph zu Beginn (Sensor)",
  hours_to_show: "Zeitraum (Stunden)",
  show_rating: "Gesamtbewertung anzeigen",
  show_graph: "Verlauf anzeigen",
};

/** Editor data ↔ config: entities may be objects in YAML – keep them. */
export function overviewToForm(config) {
  const c = config || {};
  return {
    title: c.title ?? "Luftqualität",
    entities: (Array.isArray(c.entities) ? c.entities : []).map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean),
    graph_entity: c.graph_entity,
    hours_to_show: c.hours_to_show ?? 24,
    show_rating: c.show_rating !== false,
    show_graph: c.show_graph !== false,
  };
}

export function overviewFromForm(config, form) {
  const out = { ...(config || {}) };
  const d = form || {};
  const old = Array.isArray(out.entities) ? out.entities : [];
  out.entities = (d.entities || []).map((id) => old.find((e) => (typeof e === "string" ? e : e?.entity) === id) ?? id);
  if (typeof d.title === "string") out.title = d.title;
  if (d.graph_entity && d.entities?.includes(d.graph_entity)) out.graph_entity = d.graph_entity;
  else delete out.graph_entity;
  if (typeof d.hours_to_show === "number" && d.hours_to_show !== 24) out.hours_to_show = d.hours_to_show;
  else delete out.hours_to_show;
  for (const k of ["show_rating", "show_graph"]) {
    if (d[k] === false) out[k] = false;
    else delete out[k];
  }
  return out;
}

export class SmartGraphOverviewCardEditor extends Base {
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
        const next = overviewFromForm(this._config, ev.detail.value);
        this._config = next;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
      });
      this.append(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = [
      { name: "title", selector: { text: {} } },
      { name: "entities", selector: { entity: { multiple: true, filter: { domain: "sensor" } } } },
      { name: "graph_entity", selector: { entity: { include_entities: overviewToForm(this._config).entities } } },
      { name: "hours_to_show", selector: { number: { min: 1, max: 168, mode: "box" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_rating", selector: { boolean: {} } },
          { name: "show_graph", selector: { boolean: {} } },
        ],
      },
    ];
    this._form.data = overviewToForm(this._config);
  }
}

export function registerOverviewCard() {
  if (typeof customElements === "undefined" || customElements.get(OVERVIEW_TAG)) return;
  customElements.define(OVERVIEW_TAG, SmartGraphOverviewCard);
  if (!customElements.get(OVERVIEW_EDITOR_TAG)) customElements.define(OVERVIEW_EDITOR_TAG, SmartGraphOverviewCardEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: OVERVIEW_TAG,
    name: "Smart Graph Overview Card",
    description: "Mehrere Sensoren in einer Karte (z. B. Luftqualität): Gesamtbewertung, alle Werte und ein umschaltbarer Verlaufsgraph.",
    preview: true,
    documentationURL: "https://github.com/rest2178/smart-graph-button-card",
  });
}
