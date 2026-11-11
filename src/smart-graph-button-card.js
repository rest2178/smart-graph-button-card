/**
 * Smart Graph Button Card – a self-contained Home Assistant Lovelace card.
 * No dependencies on other custom cards, no external resources.
 *
 * type: custom:smart-graph-button-card
 */

import { CARD_STYLES } from "./styles.js";
import { validateConfig, ConfigError } from "./config-validator.js";
import { getStateGroup, matchCustomState, normalizeThresholdRanges, findThresholdColor, resolveColor } from "./state-resolver.js";
import { resolveValue, isTemplate, formatNumber, getNumberLocale } from "./value-formatter.js";
import { fetchHistory } from "./history-provider.js";
import { reduceSeries, appendPoint } from "./data-reducer.js";
import { renderGraphSVG } from "./graph-renderer.js";
import { GestureRecognizer, bindActionHandler, handleAction, hasAction } from "./action-handler.js";
import { parseNumber, isDisplayable, isSafeCssValue, cssLengthToPx } from "./utils.js";
import { EDITOR_TAG } from "./smart-graph-button-card-editor.js";

export const CARD_TAG = "smart-graph-button-card";
export const CARD_VERSION = "1.3.0";

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

function graphKey(g) {
  return JSON.stringify([g.enabled, g.entity, g.attribute, g.hours_to_show, g.update_interval]);
}

export class SmartGraphButtonCard extends HTMLElement {
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
    return {
      columns: 6,
      rows: px !== null && px <= 56 ? 1 : "auto",
      min_columns: 3,
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
    const graph = el("div", `layer graph pos-${c.graph.position}${c.graph.enabled ? "" : " hidden"}`);
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

    const info = el("div", "info");
    const name = el("div", "name");
    if (c.name_style.overflow === "wrap" || c.name_style.max_lines > 1) name.classList.add("multiline");
    if (c.name_style.overflow === "clip") name.classList.add("overflow-clip");
    const values = el("div", `values${c.values.layout === "stacked" ? " stacked" : ""}`);
    const makeValue = (i) => {
      const wrap = el("span", `value value-${i}`);
      const icon = el("ha-icon", "hidden", { "aria-hidden": "true" });
      const text = el("span", "value-text");
      wrap.append(icon, text);
      return { wrap, icon, text };
    };
    const v1 = makeValue(1);
    const sep = el("span", "sep", { "aria-hidden": "true" });
    sep.textContent = c.values.separator;
    const v2 = makeValue(2);
    values.append(v1.wrap, sep, v2.wrap);
    info.append(name, values);
    if (iconWrap) content.append(iconWrap);
    content.append(info);

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
    setVar("--sgbc-name-size", c.name_style.font_size);
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
      const r = cfg ? resolveValue(cfg, hass, ctx) : null;
      results.push(r);
      const visible = Boolean(r && !r.hidden);
      ref.wrap.classList.toggle("hidden", !visible);
      if (!visible) continue;
      visibleCount++;
      if (ref.text.textContent !== r.text) ref.text.textContent = r.text;
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
    const base = isSafeCssValue(g.color) ? g.color : "var(--sgbc-graph-color, var(--primary-color, #03a9f4))";
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
  // eslint-disable-next-line no-console
  console.info(`%c SMART-GRAPH-BUTTON-CARD %c v${CARD_VERSION} `, "color:#fff;background:#0ea5e9;font-weight:700;border-radius:3px 0 0 3px", "color:#0ea5e9;background:#e0f2fe;border-radius:0 3px 3px 0");
}
