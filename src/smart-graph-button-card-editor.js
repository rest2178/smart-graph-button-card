/**
 * Visual Lovelace editor for the Smart Graph Button Card.
 *
 * Uses Home Assistant's native <ha-form> for standard fields (built into the
 * HA frontend, not a custom card) plus own controls for colors (text field +
 * mouse color picker) and the graph threshold list. Every key the editor does
 * not manage is preserved.
 */

import { parseColor, toHex, applyPickedColor } from "./color-utils.js";

export const EDITOR_TAG = "smart-graph-button-card-editor";

const GRAPH_TYPES = [
  ["line", "Linie"],
  ["area", "Fläche"],
  ["bar", "Balken"],
  ["column", "Säulen"],
  ["stepped", "Stufen"],
  ["line-bar", "Linie + Balken"],
  ["smooth-line-bar", "Abgerundete Linie + Balken"],
];
const GRAPH_POSITIONS = [
  ["full", "Ganze Karte"],
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
export const DEFAULT_THRESHOLDS = [
  { value: 10, color: "#22c55e" },
  { value: 50, color: "#eab308" },
  { value: 100, color: "#f97316" },
  { value: 200, color: "#ef4444" },
];
const PALETTE = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#dc2626", "#a855f7", "#3b82f6"];

const LABELS = {
  entity: "Entity",
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

function mainSchema() {
  return [
    { name: "entity", required: true, selector: { entity: {} } },
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

export function setPath(obj, path, value) {
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

export function pruneEmpty(obj, path) {
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

/** Fade value as percent number for the slider (px values are left to YAML). */
function fadePercent(value) {
  if (value === undefined || value === null || value === false) return 0;
  const m = /^(\d*\.?\d+)%?$/.exec(String(value).trim());
  return m ? Number(m[1]) : undefined;
}

/** Map a (YAML) config to the flat data object used by ha-form. */
export function configToForm(config) {
  const c = config || {};
  return {
    entity: c.entity,
    name: typeof c.name === "string" ? c.name : undefined,
    icon: typeof c.icon === "string" ? c.icon : undefined,
    value_1_enabled: Boolean(c.value_1),
    value_1_entity: get(c, "value_1.entity"),
    value_1_attribute: get(c, "value_1.attribute"),
    value_2_enabled: Boolean(c.value_2),
    value_2_entity: get(c, "value_2.entity"),
    value_2_decimals: get(c, "value_2.decimals"),
    value_2_unit: get(c, "value_2.unit"),
    graph_enabled: c.graph ? get(c, "graph.enabled") !== false : false,
    graph_entity: get(c, "graph.entity"),
    graph_type: get(c, "graph.type") || "line",
    graph_position: get(c, "graph.position") || "full",
    graph_hours_to_show: get(c, "graph.hours_to_show") ?? 24,
    graph_fade_start: fadePercent(get(c, "graph.fade_start") ?? get(c, "graph.fade")),
    graph_fade_end: fadePercent(get(c, "graph.fade_end") ?? get(c, "graph.fade")),
    graph_color_mode: get(c, "graph.color_mode") || "state",
    graph_threshold_mode: get(c, "graph.threshold_mode") || "current",
    graph_gradient_direction: get(c, "graph.gradient.direction") || "vertical",
    state_background_enabled: Boolean(get(c, "state_background.enabled")),
    tap_action: c.tap_action,
    hold_action: c.hold_action,
    double_tap_action: c.double_tap_action,
  };
}

/** Apply flat ha-form data back onto a copy of the config, keeping unknown keys. */
export function formToConfig(config, form) {
  const out = clone(config);
  const d = form || {};
  setPath(out, "entity", d.entity);
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

  if (d.graph_enabled || out.graph) {
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
    if (mode && (mode !== "state" || out.graph.color_mode)) out.graph.color_mode = mode;
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
    const mode = get(c, "graph.color_mode") || "state";
    body.append(this._panelForm((cfg) => graphColorSchema(get(cfg, "graph.color_mode") || "state")));
    if (c.graph && c.graph.enabled === false) body.append(h("p", "sgbc-ed-note", "Der Graph ist deaktiviert. Die Farben gelten, sobald er aktiviert wird."));

    if (mode === "fixed") {
      body.append(colorField("Graph-Farbe", get(c, "graph.color"), (v) => this._set("graph.color", v), "#06b6d4"));
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
    body.append(icons, this._panelForm(stateBackgroundSchema), backgrounds);
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
      get(before, "graph.enabled") !== get(config, "graph.enabled");
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
