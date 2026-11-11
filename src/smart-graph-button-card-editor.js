/**
 * Visual Lovelace editor for the Smart Graph Button Card.
 *
 * Uses Home Assistant's native <ha-form> (built into the HA frontend, not a
 * custom card). Complex options (thresholds, custom states, layers, …) stay
 * in YAML mode; the editor preserves every key it does not manage.
 */

export const EDITOR_TAG = "smart-graph-button-card-editor";

const GRAPH_TYPES = ["line", "area", "bar", "column", "stepped", "line-bar"];
const GRAPH_POSITIONS = ["full", "left", "right", "bottom", "icon-area", "custom"];

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
  state_background_enabled: "Statushintergrund aktivieren",
  color_on: "Farbe „Ein“ (Symbol)",
  color_off: "Farbe „Aus“ (Symbol)",
  state_background_on: "Hintergrund „Ein“",
  state_background_off: "Hintergrund „Aus“",
  tap_action: "Tap-Aktion",
  hold_action: "Hold-Aktion",
  double_tap_action: "Double-Tap-Aktion",
};

function buildSchema() {
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
            { name: "graph_type", selector: { select: { mode: "dropdown", options: GRAPH_TYPES.map((v) => ({ value: v, label: v })) } } },
            { name: "graph_position", selector: { select: { mode: "dropdown", options: GRAPH_POSITIONS.map((v) => ({ value: v, label: v })) } } },
          ],
        },
        { name: "graph_hours_to_show", selector: { number: { min: 1, max: 168, step: 1, mode: "box", unit_of_measurement: "h" } } },
      ],
    },
    {
      type: "expandable",
      name: "colors_section",
      flatten: true,
      title: "Farben & Hintergrund",
      icon: "mdi:palette",
      schema: [
        {
          type: "grid",
          name: "",
          schema: [
            { name: "color_on", selector: { text: {} } },
            { name: "color_off", selector: { text: {} } },
          ],
        },
        { name: "state_background_enabled", selector: { boolean: {} } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "state_background_on", selector: { text: {} } },
            { name: "state_background_off", selector: { text: {} } },
          ],
        },
      ],
    },
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
}

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
    if (parent && typeof parent === "object" && Object.keys(parent).length === 0) {
      setPath(obj, parentPath, undefined);
    }
  }
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
    state_background_enabled: Boolean(get(c, "state_background.enabled")),
    color_on: get(c, "icon_area.color.on"),
    color_off: get(c, "icon_area.color.off"),
    state_background_on: get(c, "state_background.colors.on"),
    state_background_off: get(c, "state_background.colors.off"),
    tap_action: c.tap_action,
    hold_action: c.hold_action,
    double_tap_action: c.double_tap_action,
  };
}

/** Apply flat ha-form data back onto a copy of the config, keeping unknown keys. */
export function formToConfig(config, form) {
  const out = JSON.parse(JSON.stringify(config || {}));
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

  if (d.graph_enabled) {
    if (!out.graph || typeof out.graph !== "object") out.graph = {};
    out.graph.enabled = true;
    setPath(out, "graph.entity", d.graph_entity);
    setPath(out, "graph.type", d.graph_type);
    setPath(out, "graph.position", d.graph_position);
    setPath(out, "graph.hours_to_show", typeof d.graph_hours_to_show === "number" ? d.graph_hours_to_show : undefined);
  } else if (out.graph && typeof out.graph === "object") {
    out.graph.enabled = false;
  }

  if (d.state_background_enabled) setPath(out, "state_background.enabled", true);
  else if (out.state_background) setPath(out, "state_background.enabled", false);
  setPath(out, "state_background.colors.on", d.state_background_on);
  setPath(out, "state_background.colors.off", d.state_background_off);
  pruneEmpty(out, "state_background.colors.on");

  setPath(out, "icon_area.color.on", d.color_on);
  setPath(out, "icon_area.color.off", d.color_off);
  pruneEmpty(out, "icon_area.color.on");

  for (const key of ["tap_action", "hold_action", "double_tap_action"]) setPath(out, key, d[key]);
  return out;
}

// Guard allows importing the pure mapping helpers in Node-based tests.
const EditorBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {};

class SmartGraphButtonCardEditor extends EditorBase {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._form = null;
    this._ready = false;
    this._onValueChanged = this._onValueChanged.bind(this);
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }

  setConfig(config) {
    this._config = config || {};
    if (this._form) this._form.data = configToForm(this._config);
  }

  connectedCallback() {
    if (!this._ready) {
      this._ready = true;
      this._ensureComponents().then(() => this._render());
    }
  }

  disconnectedCallback() {
    if (this._form) this._form.removeEventListener("value-changed", this._onValueChanged);
    this._form = null;
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

  _render() {
    this.replaceChildren();
    if (!customElements.get("ha-form")) {
      const msg = document.createElement("p");
      msg.style.cssText = "margin:0;padding:8px;color:var(--secondary-text-color)";
      msg.textContent = "Der visuelle Editor ist in dieser Home-Assistant-Version nicht verfügbar. Bitte den YAML-Modus verwenden.";
      this.append(msg);
      return;
    }
    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form.schema = buildSchema();
    form.data = configToForm(this._config);
    form.computeLabel = (s) => LABELS[s.name] ?? s.title ?? s.name;
    form.computeHelper = (s) =>
      s.name === "color_on" || s.name === "color_off" || s.name.startsWith("state_background_")
        ? "CSS-Farbe, z. B. #22c55e oder rgba(34,197,94,0.15)"
        : undefined;
    form.addEventListener("value-changed", this._onValueChanged);
    const hint = document.createElement("p");
    hint.style.cssText = "margin:12px 0 0;font-size:12px;color:var(--secondary-text-color)";
    hint.textContent = "Grenzwerte, eigene Zustände, Ebenen und Layout lassen sich im YAML-Modus konfigurieren.";
    this.append(form, hint);
    this._form = form;
  }

  _onValueChanged(ev) {
    ev.stopPropagation();
    const config = formToConfig(this._config, ev.detail?.value);
    if (!config.type) config.type = "custom:smart-graph-button-card";
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
}

if (typeof customElements !== "undefined" && !customElements.get(EDITOR_TAG)) {
  customElements.define(EDITOR_TAG, SmartGraphButtonCardEditor);
}
