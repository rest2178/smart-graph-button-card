/**
 * Smart Graph Media Card – compact control for any media player:
 * device name, player switch, power, volume, previous / play / next and
 * preset buttons (radio stations, playlists, favorites).
 *
 * Uses only the standard media_player services, so it works with Alexa Media
 * Player, Sonos, Google Cast, Spotify, Music Assistant, HEOS, MusicCast, DLNA …
 *
 * type: custom:smart-graph-media-card
 */
import { isPlainObject, parseNumber } from "./utils.js";

export const MEDIA_TAG = "smart-graph-media-card";
export const MEDIA_EDITOR_TAG = "smart-graph-media-card-editor";

const Base = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
const PLAYER_RE = /^media_player\.[a-z0-9_]+$/;
const SERVICE_RE = /^[a-z_]+\.[a-z0-9_]+$/;

/** media_player supported_features bits. */
export const FEATURES = Object.freeze({
  PAUSE: 1,
  VOLUME_SET: 4,
  VOLUME_MUTE: 8,
  PREVIOUS_TRACK: 16,
  NEXT_TRACK: 32,
  TURN_ON: 128,
  TURN_OFF: 256,
  PLAY_MEDIA: 512,
  VOLUME_STEP: 1024,
  SELECT_SOURCE: 2048,
  STOP: 4096,
  PLAY: 16384,
});

export function supports(stateObj, feature) {
  return ((Number(stateObj?.attributes?.supported_features) || 0) & feature) !== 0;
}

const STATE_TEXT = {
  playing: "Spielt",
  paused: "Pausiert",
  idle: "Bereit",
  standby: "Standby",
  on: "An",
  off: "Aus",
  buffering: "Lädt …",
  unavailable: "Nicht verfügbar",
  unknown: "Unbekannt",
};

export class MediaConfigError extends Error {}

/** thumbnail: cover instead of the symbol; background: blurred cover behind the card; both; none. */
export const ARTWORK_MODES = ["thumbnail", "background", "both", "none"];

function normalizePreset(p, i, errors) {
  if (typeof p === "string" || typeof p === "number") return { name: String(p), media_content_id: String(p) };
  if (!isPlainObject(p)) {
    errors.push(`presets[${i}] muss ein Text oder ein Objekt sein.`);
    return null;
  }
  const out = { ...p };
  const action = p.action ?? p.perform_action ?? p.service;
  if (action !== undefined) {
    if (typeof action !== "string" || !SERVICE_RE.test(action)) errors.push(`presets[${i}].action „${action}“ ist ungültig (z. B. script.radio_an).`);
    out.action = action;
    delete out.perform_action;
    delete out.service;
    if (out.data !== undefined && !isPlainObject(out.data)) errors.push(`presets[${i}].data muss ein Objekt sein.`);
  } else if (p.source === undefined && (p.media_content_id === undefined || p.media_content_id === "")) {
    errors.push(`presets[${i}] braucht „media_content_id“, „source“ oder „action“.`);
  }
  if (out.media_content_id !== undefined) out.media_content_id = String(out.media_content_id);
  if (out.source !== undefined) out.source = String(out.source);
  out.name = String(p.name ?? p.source ?? p.media_content_id ?? action ?? "");
  return out;
}

/** Validate and normalise the media card config. Throws MediaConfigError. */
export function validateMediaConfig(raw) {
  if (!isPlainObject(raw)) throw new MediaConfigError("Die Konfiguration muss ein Objekt sein.");
  const errors = [];
  const players = [];
  const names = {};
  const add = (e, path) => {
    const item = typeof e === "string" ? { entity: e } : isPlainObject(e) ? e : {};
    if (typeof item.entity !== "string" || !PLAYER_RE.test(item.entity)) {
      errors.push(`${path}: „${item.entity ?? e}“ ist keine media_player-Entity.`);
      return;
    }
    if (!players.includes(item.entity)) players.push(item.entity);
    if (typeof item.name === "string" && item.name) names[item.entity] = item.name;
  };
  if (raw.entity !== undefined) add(raw.entity, "entity");
  (Array.isArray(raw.entities) ? raw.entities : []).forEach((e, i) => add(e, `entities[${i}]`));
  if (!players.length && !errors.length) errors.push("entity fehlt: ein media_player wird benötigt.");
  const presets = (Array.isArray(raw.presets) ? raw.presets : []).map((p, i) => normalizePreset(p, i, errors)).filter(Boolean);
  let columns = raw.preset_columns === undefined ? null : parseNumber(raw.preset_columns);
  if (columns !== null && (!Number.isInteger(columns) || columns < 1 || columns > 6)) errors.push("preset_columns muss 1 bis 6 sein.");
  const artwork = raw.artwork === undefined ? "thumbnail" : raw.artwork === false ? "none" : raw.artwork === true ? "both" : raw.artwork;
  if (!ARTWORK_MODES.includes(artwork)) errors.push(`artwork „${raw.artwork}“ ist ungültig. Erlaubt: ${ARTWORK_MODES.join(", ")}.`);
  if (errors.length) throw new MediaConfigError(errors.join("\n"));
  if (columns === null) columns = Math.max(1, Math.min(3, presets.length || 1));
  const flag = (k) => raw[k] !== false;
  return {
    type: raw.type,
    players,
    names,
    name: typeof raw.name === "string" && raw.name ? raw.name : undefined,
    icon: typeof raw.icon === "string" && raw.icon ? raw.icon : undefined,
    show_power: flag("show_power"),
    show_volume: flag("show_volume"),
    show_controls: flag("show_controls"),
    show_media_info: flag("show_media_info"),
    show_source_list: flag("show_source_list"),
    artwork,
    presets,
    preset_columns: columns,
  };
}

const URL_RE = /^[a-z][a-z0-9+.-]*:\/\//i;

/** Cover / station picture of the player while something is playing (or null). */
export function artworkUrl(stateObj, hass) {
  if (!stateObj || !["playing", "paused", "buffering", "on"].includes(stateObj.state)) return null;
  const pic = stateObj.attributes?.entity_picture_local || stateObj.attributes?.entity_picture;
  if (typeof pic !== "string" || !pic) return null;
  if (URL_RE.test(pic) || pic.startsWith("data:")) return pic;
  return typeof hass?.hassUrl === "function" ? hass.hassUrl(pic) : pic;
}

/**
 * media_content_type when a preset only gives media_content_id – chosen by the
 * integration (platform) behind the player.
 */
export function defaultContentType(platform, id) {
  const s = String(id ?? "");
  switch (platform) {
    case "alexa_media":
      return "TUNEIN"; // station name as in the Alexa app, e.g. "Radio Steiermark"
    case "sonos":
      return s.startsWith("FV:") ? "favorite_item_id" : "music";
    case "music_assistant":
    case "mass":
      return URL_RE.test(s) ? "music" : "radio";
    case "spotify":
    case "spotifyplus": {
      const m = /^spotify:(playlist|album|artist|track|episode|show):/.exec(s);
      return m ? m[1] : "music";
    }
    default:
      return "music";
  }
}

/** Service call for a preset: { domain, service, data }. */
export function presetCall(preset, entityId, platform) {
  if (preset.action) {
    const [domain, service] = preset.action.split(".");
    const data = { ...(preset.data || {}) };
    // "entity_id: current" → the player that is selected in the card
    if (data.entity_id === "current") data.entity_id = entityId;
    return { domain, service, data };
  }
  if (preset.source !== undefined) return { domain: "media_player", service: "select_source", data: { entity_id: entityId, source: preset.source } };
  return {
    domain: "media_player",
    service: "play_media",
    data: {
      entity_id: entityId,
      media_content_id: preset.media_content_id,
      media_content_type: preset.media_content_type || defaultContentType(platform, preset.media_content_id),
    },
  };
}

/** Index of the preset that is playing right now (or -1). */
export function activePreset(presets, stateObj) {
  if (!stateObj || !["playing", "paused", "buffering", "on"].includes(stateObj.state)) return -1;
  const a = stateObj.attributes || {};
  const hay = [a.media_title, a.media_channel, a.media_artist, a.media_album_name, a.source, a.media_content_id]
    .filter((v) => v !== undefined && v !== null && v !== "")
    .map((v) => String(v).toLowerCase());
  if (!hay.length) return -1;
  return presets.findIndex((p) => {
    const keys = [p.match, p.source, p.media_content_id, p.name].filter(Boolean).map((v) => String(v).toLowerCase());
    return keys.some((k) => hay.some((h) => h === k || (k.length > 3 && h.includes(k))));
  });
}

export function volumeIcon(level, muted) {
  const v = Number(level);
  if (muted || !Number.isFinite(v) || v <= 0) return muted ? "mdi:volume-off" : "mdi:volume-low";
  return v < 0.34 ? "mdi:volume-low" : v < 0.67 ? "mdi:volume-medium" : "mdi:volume-high";
}

function playerIcon(stateObj) {
  const dc = stateObj?.attributes?.device_class;
  if (dc === "speaker") return "mdi:speaker";
  if (dc === "tv") return "mdi:television";
  if (dc === "receiver") return "mdi:audio-video";
  return "mdi:cast";
}

const STYLES = `
:host { display: block; }
ha-card.sgmc {
  position: relative;
  box-sizing: border-box;
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--primary-text-color);
  --sgmc-active: var(--state-media_player-active-color, var(--primary-color, #03a9f4));
}
.head { display: flex; align-items: center; gap: 12px; min-width: 0; }
.p-icon { flex: none; --mdc-icon-size: 26px; color: var(--secondary-text-color); display: inline-flex; width: 40px; justify-content: center; }
.p-icon.active { color: var(--sgmc-active); }
.art-thumb { flex: none; width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25); }
/* blurred cover behind the card, toned down with the card color so text stays readable */
.art-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity 400ms ease; }
.art-bg.show { opacity: 1; }
.art-bg::before {
  content: "";
  position: absolute;
  inset: -40px;
  background: var(--sgmc-art) center / cover no-repeat;
  filter: blur(22px) saturate(1.4);
}
.art-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--card-background-color, #fff) 68%, transparent);
}
ha-card.sgmc > :not(.art-bg) { position: relative; z-index: 1; }
ha-card.sgmc > .menu { position: absolute; z-index: 5; }
ha-card.sgmc.has-art button.preset:not(.active) { background: color-mix(in srgb, var(--card-background-color, #fff) 82%, transparent); }
.titles { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.name, .info { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.name { font-size: 16px; font-weight: 500; line-height: 1.25; }
.info { font-size: 12px; color: var(--secondary-text-color); line-height: 1.3; }
.info.hidden, .hidden { display: none !important; }
button.ic {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--primary-text-color);
  cursor: pointer;
  --mdc-icon-size: 24px;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 120ms ease, color 120ms ease;
}
button.ic:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
button.ic:focus-visible { outline: 2px solid var(--sgmc-active); outline-offset: 1px; }
button.ic:disabled { color: var(--disabled-text-color, #9ca3af); cursor: default; background: transparent; }
button.ic.power:not(.on):not(:disabled) { color: var(--secondary-text-color); }
.menu-btn ha-icon { transition: transform 160ms ease; }
.menu-btn.open ha-icon { transform: rotate(180deg); }
.menu {
  position: absolute;
  z-index: 5;
  top: 58px;
  right: 16px;
  min-width: 200px;
  max-width: calc(100% - 32px);
  max-height: 300px;
  overflow: auto;
  padding: 6px 0;
  border-radius: 12px;
  background: var(--card-background-color, #fff);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
  border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
}
.menu .section { padding: 8px 16px 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--secondary-text-color); }
.menu button.item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 16px;
  border: 0;
  background: transparent;
  color: var(--primary-text-color);
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}
.menu button.item:hover, .menu button.item:focus-visible { background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); outline: none; }
.menu button.item.selected { color: var(--sgmc-active); font-weight: 600; }
.menu button.item ha-icon { --mdc-icon-size: 18px; flex: none; }
.menu button.item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.controls { display: flex; align-items: center; gap: 4px; min-width: 0; }
.vol { flex: 1 1 auto; min-width: 60px; display: flex; align-items: center; padding: 0 8px; }
input.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 24px;
  margin: 0;
  background: transparent;
  cursor: pointer;
  --sgmc-fill: 0%;
}
input.slider:disabled { cursor: default; opacity: 0.5; }
input.slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, var(--sgmc-active) var(--sgmc-fill), color-mix(in srgb, var(--primary-text-color) 22%, transparent) var(--sgmc-fill));
}
input.slider::-moz-range-track { height: 4px; border-radius: 2px; background: color-mix(in srgb, var(--primary-text-color) 22%, transparent); }
input.slider::-moz-range-progress { height: 4px; border-radius: 2px; background: var(--sgmc-active); }
input.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -7px;
  border: 0;
  border-radius: 50%;
  background: var(--sgmc-active);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
input.slider::-moz-range-thumb { width: 18px; height: 18px; border: 0; border-radius: 50%; background: var(--sgmc-active); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); }
input.slider:focus-visible { outline: none; }
input.slider:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 4px color-mix(in srgb, var(--sgmc-active) 30%, transparent); }
.transport { display: flex; align-items: center; gap: 4px; flex: none; }
.presets { display: grid; grid-template-columns: repeat(var(--sgmc-cols, 3), minmax(0, 1fr)); gap: 10px; }
button.preset {
  min-width: 0;
  height: 40px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: var(--card-background-color, #fff);
  color: var(--primary-text-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.22), 0 1px 1px rgba(0, 0, 0, 0.08);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 120ms ease, box-shadow 120ms ease, transform 80ms ease;
}
button.preset:hover { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25); }
button.preset:active { transform: scale(0.98); }
button.preset:focus-visible { outline: 2px solid var(--sgmc-active); outline-offset: 2px; }
button.preset:disabled { cursor: default; opacity: 0.5; }
button.preset.active {
  color: var(--sgmc-active);
  border-color: color-mix(in srgb, var(--sgmc-active) 55%, transparent);
  background: color-mix(in srgb, var(--sgmc-active) 10%, var(--card-background-color, #fff));
}
button.preset ha-icon { --mdc-icon-size: 18px; margin-right: 6px; vertical-align: -3px; }
.warn { padding: 12px 16px; color: var(--error-color, #db4437); font-size: 13px; white-space: pre-line; }
`;

function el(tag, className, attrs) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

function iconButton(className, icon, label) {
  const b = el("button", `ic ${className}`, { type: "button", "aria-label": label, title: label });
  const i = el("ha-icon");
  i.icon = icon;
  i.setAttribute("icon", icon);
  b.append(i);
  return b;
}

function setIcon(button, icon) {
  const i = button.firstElementChild;
  if (i && i.icon !== icon) {
    i.icon = icon;
    i.setAttribute("icon", icon);
  }
}

export class SmartGraphMediaCard extends Base {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._volSentAt = 0;
  }

  static getConfigElement() {
    return document.createElement(MEDIA_EDITOR_TAG);
  }

  static getStubConfig(hass) {
    const id = Object.keys(hass?.states || {}).find((e) => e.startsWith("media_player.")) || "media_player.wohnzimmer";
    return { entity: id, presets: [] };
  }

  setConfig(config) {
    try {
      this._config = validateMediaConfig(config);
      this._error = null;
    } catch (err) {
      this._config = null;
      this._error = err.message || String(err);
    }
    this._current = this._restoreCurrent();
    this._build();
    if (this._hass) this._update(true);
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    if (!this._config || !this._els) return;
    // only re-render when one of our players changed
    const changed = !prev || this._config.players.some((id) => prev.states?.[id] !== hass.states?.[id]);
    if (changed) this._update();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return this._config?.presets.length ? 3 : 2;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback() {
    this._outside = (ev) => {
      if (!this._els?.menu || this._els.menu.classList.contains("hidden")) return;
      if (!ev.composedPath().includes(this)) this._toggleMenu(false);
    };
    document.addEventListener("click", this._outside, true);
  }

  disconnectedCallback() {
    if (this._outside) document.removeEventListener("click", this._outside, true);
    clearTimeout(this._volTimer);
  }

  _storageKey() {
    return this._config ? `sgmc:${this._config.players.join(",")}` : null;
  }

  _restoreCurrent() {
    const players = this._config?.players || [];
    try {
      const saved = localStorage.getItem(this._storageKey());
      if (saved && players.includes(saved)) return saved;
    } catch (_err) {
      /* storage blocked – use the first player */
    }
    return players[0];
  }

  _setCurrent(id) {
    this._current = id;
    try {
      localStorage.setItem(this._storageKey(), id);
    } catch (_err) {
      /* ignore */
    }
    this._update(true);
  }

  _call(domain, service, data) {
    if (!this._hass?.callService) return;
    Promise.resolve(this._hass.callService(domain, service, data)).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn(`[smart-graph-media-card] ${domain}.${service} fehlgeschlagen:`, err);
    });
  }

  _build() {
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = el("style");
    style.textContent = STYLES;
    const card = el("ha-card", "sgmc");
    root.append(style, card);
    this._els = null;
    if (!this._config) {
      const warn = el("div", "warn");
      warn.textContent = this._error || "Ungültige Konfiguration.";
      card.append(warn);
      return;
    }
    const c = this._config;

    const head = el("div", "head");
    const pIcon = el("ha-icon", "p-icon");
    const thumb = el("img", "art-thumb hidden", { alt: "", loading: "lazy", decoding: "async" });
    thumb.addEventListener("error", () => {
      // picture not loadable (e.g. expired link): back to the symbol
      this._badArt = thumb.getAttribute("src");
      thumb.classList.add("hidden");
      pIcon.classList.remove("hidden");
    });
    const artBg = el("div", "art-bg", { "aria-hidden": "true" });
    const titles = el("div", "titles");
    const name = el("div", "name");
    const info = el("div", `info${c.show_media_info ? "" : " hidden"}`);
    titles.append(name, info);
    const menuBtn = iconButton("menu-btn", "mdi:chevron-down", "Player und Quelle wählen");
    menuBtn.setAttribute("aria-haspopup", "true");
    menuBtn.setAttribute("aria-expanded", "false");
    const power = iconButton("power", "mdi:power", "Ein/Aus");
    head.append(pIcon, thumb, titles, menuBtn, power);
    const menu = el("div", "menu hidden", { role: "menu" });

    const controls = el("div", "controls");
    const mute = iconButton("mute", "mdi:volume-high", "Stumm schalten");
    const vol = el("div", "vol");
    const slider = el("input", "slider", { type: "range", min: "0", max: "100", step: "1", "aria-label": "Lautstärke" });
    vol.append(slider);
    const transport = el("div", "transport");
    const prev = iconButton("prev", "mdi:skip-previous", "Zurück");
    const play = iconButton("play", "mdi:play", "Wiedergabe/Pause");
    const next = iconButton("next", "mdi:skip-next", "Weiter");
    transport.append(prev, play, next);
    controls.append(mute, vol, transport);

    const presets = el("div", `presets${c.presets.length ? "" : " hidden"}`);
    presets.style.setProperty("--sgmc-cols", String(c.preset_columns));
    const presetButtons = c.presets.map((p, i) => {
      const b = el("button", "preset", { type: "button", title: p.name });
      if (p.icon) {
        const ic = el("ha-icon");
        ic.icon = p.icon;
        ic.setAttribute("icon", p.icon);
        b.append(ic);
      }
      b.append(document.createTextNode(p.name));
      b.addEventListener("click", () => this._playPreset(i));
      presets.append(b);
      return b;
    });

    card.append(artBg, head, menu, controls, presets);

    // events
    menuBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._toggleMenu();
    });
    power.addEventListener("click", () => {
      const s = this._stateObj();
      if (!s) return;
      const off = ["off", "standby", "unavailable", "unknown"].includes(s.state);
      this._call("media_player", off ? "turn_on" : "turn_off", { entity_id: this._current });
    });
    mute.addEventListener("click", () => {
      const s = this._stateObj();
      if (!s) return;
      if (supports(s, FEATURES.VOLUME_MUTE)) {
        this._call("media_player", "volume_mute", { entity_id: this._current, is_volume_muted: !s.attributes.is_volume_muted });
      } else if (supports(s, FEATURES.VOLUME_SET)) {
        // no mute support (e.g. some Alexa devices): toggle between 0 and the last level
        const level = Number(s.attributes.volume_level) || 0;
        if (level > 0) this._lastLevel = level;
        this._sendVolume(level > 0 ? 0 : this._lastLevel || 0.3);
      }
    });
    slider.addEventListener("input", () => {
      const v = Number(slider.value) / 100;
      this._paintSlider(v);
      setIcon(mute, volumeIcon(v, false));
      clearTimeout(this._volTimer);
      this._volTimer = setTimeout(() => this._sendVolume(v), 180);
    });
    slider.addEventListener("change", () => {
      clearTimeout(this._volTimer);
      this._paintSlider(Number(slider.value) / 100);
      this._sendVolume(Number(slider.value) / 100);
    });
    prev.addEventListener("click", () => this._call("media_player", "media_previous_track", { entity_id: this._current }));
    next.addEventListener("click", () => this._call("media_player", "media_next_track", { entity_id: this._current }));
    play.addEventListener("click", () => {
      const s = this._stateObj();
      if (!s) return;
      const service = s.state === "playing" ? (supports(s, FEATURES.PAUSE) ? "media_pause" : "media_stop") : "media_play";
      this._call("media_player", supports(s, FEATURES.PAUSE) && supports(s, FEATURES.PLAY) ? "media_play_pause" : service, { entity_id: this._current });
    });

    this._els = { card, pIcon, thumb, artBg, name, info, menuBtn, power, menu, controls, mute, slider, prev, play, next, presets, presetButtons };
  }

  _stateObj() {
    return this._hass?.states?.[this._current];
  }

  _platform(id) {
    return this._hass?.entities?.[id]?.platform;
  }

  _sendVolume(v) {
    const level = Math.max(0, Math.min(1, Math.round(v * 100) / 100));
    this._volSentAt = Date.now();
    this._pendingLevel = level;
    this._call("media_player", "volume_set", { entity_id: this._current, volume_level: level });
  }

  _paintSlider(v) {
    this._els.slider.style.setProperty("--sgmc-fill", `${Math.round(Math.max(0, Math.min(1, v)) * 100)}%`);
  }

  _playPreset(i) {
    const p = this._config.presets[i];
    if (!p) return;
    const call = presetCall(p, this._current, this._platform(this._current));
    this._call(call.domain, call.service, call.data);
  }

  _playerName(id) {
    return this._config.names[id] || this._hass?.states?.[id]?.attributes?.friendly_name || id;
  }

  _menuItems() {
    const c = this._config;
    const s = this._stateObj();
    const items = [];
    if (c.players.length > 1) {
      items.push({ section: "Player" });
      for (const id of c.players) items.push({ kind: "player", value: id, label: this._playerName(id), icon: playerIcon(this._hass?.states?.[id]), selected: id === this._current });
    }
    const sources = Array.isArray(s?.attributes?.source_list) ? s.attributes.source_list : [];
    if (c.show_source_list && sources.length && supports(s, FEATURES.SELECT_SOURCE)) {
      items.push({ section: "Quelle" });
      for (const src of sources) items.push({ kind: "source", value: src, label: String(src), icon: "mdi:music-box-multiple-outline", selected: src === s.attributes.source });
    }
    return items;
  }

  _toggleMenu(force) {
    const els = this._els;
    const open = force ?? els.menu.classList.contains("hidden");
    if (open) {
      els.menu.replaceChildren();
      for (const it of this._menuItems()) {
        if (it.section) {
          const h = el("div", "section");
          h.textContent = it.section;
          els.menu.append(h);
          continue;
        }
        const b = el("button", `item${it.selected ? " selected" : ""}`, { type: "button", role: "menuitemradio", "aria-checked": String(it.selected) });
        const ic = el("ha-icon");
        ic.icon = it.selected ? "mdi:check" : it.icon;
        ic.setAttribute("icon", ic.icon);
        const label = el("span");
        label.textContent = it.label;
        b.append(ic, label);
        b.addEventListener("click", (ev) => {
          ev.stopPropagation();
          this._toggleMenu(false);
          if (it.kind === "player") this._setCurrent(it.value);
          else this._call("media_player", "select_source", { entity_id: this._current, source: it.value });
        });
        els.menu.append(b);
      }
    }
    els.menu.classList.toggle("hidden", !open);
    els.menuBtn.classList.toggle("open", open);
    els.menuBtn.setAttribute("aria-expanded", String(open));
  }

  _update() {
    const c = this._config;
    const els = this._els;
    if (!c || !els || !this._hass) return;
    const s = this._stateObj();
    const state = s?.state ?? "unavailable";
    const unavailable = !s || state === "unavailable" || state === "unknown";
    const a = s?.attributes || {};
    const active = !unavailable && !["off", "standby"].includes(state);

    // head
    const icon = c.icon || a.icon || playerIcon(s);
    if (els.pIcon.icon !== icon) {
      els.pIcon.icon = icon;
      els.pIcon.setAttribute("icon", icon);
    }
    els.pIcon.classList.toggle("active", active);
    // artwork: cover / station picture as thumbnail and/or blurred background
    const art = c.artwork === "none" ? null : artworkUrl(s, this._hass);
    const useThumb = Boolean(art) && (c.artwork === "thumbnail" || c.artwork === "both") && art !== this._badArt;
    if (useThumb && els.thumb.getAttribute("src") !== art) els.thumb.setAttribute("src", art);
    els.thumb.classList.toggle("hidden", !useThumb);
    els.pIcon.classList.toggle("hidden", useThumb);
    const useBg = Boolean(art) && (c.artwork === "background" || c.artwork === "both");
    if (useBg) els.artBg.style.setProperty("--sgmc-art", `url("${art.replace(/["\\\n]/g, encodeURIComponent)}")`);
    els.artBg.classList.toggle("show", useBg);
    els.card.classList.toggle("has-art", useBg);
    const name = c.name && c.players.length === 1 ? c.name : this._playerName(this._current);
    if (els.name.textContent !== name) els.name.textContent = name;
    els.name.title = name;
    if (c.show_media_info) {
      const playingInfo = ["playing", "paused", "buffering"].includes(state) ? [a.media_title, a.media_artist || a.media_channel || a.app_name].filter(Boolean).join(" · ") : "";
      const text = playingInfo || (this._hass.formatEntityState && s ? this._hass.formatEntityState(s) : STATE_TEXT[state] || state);
      if (els.info.textContent !== text) els.info.textContent = text;
      els.info.classList.toggle("hidden", !text);
    }
    els.menuBtn.classList.toggle("hidden", this._menuItems().length === 0);
    const canPower = supports(s, FEATURES.TURN_ON) || supports(s, FEATURES.TURN_OFF);
    els.power.classList.toggle("hidden", !c.show_power || (!canPower && !unavailable));
    els.power.disabled = unavailable;
    els.power.classList.toggle("on", active);

    // volume
    const canVolume = supports(s, FEATURES.VOLUME_SET);
    const canMute = supports(s, FEATURES.VOLUME_MUTE);
    els.mute.classList.toggle("hidden", !c.show_volume || (!canVolume && !canMute && !unavailable));
    els.slider.parentElement.classList.toggle("hidden", !c.show_volume || (!canVolume && !unavailable));
    els.mute.disabled = unavailable;
    els.slider.disabled = unavailable || !canVolume;
    const reported = Number(a.volume_level);
    let level = Number.isFinite(reported) ? reported : 0;
    // right after a change the player may still report the old level
    if (Date.now() - this._volSentAt < 1500 && this._pendingLevel !== undefined) level = this._pendingLevel;
    if (this.shadowRoot.activeElement !== els.slider || Date.now() - this._volSentAt > 1500) {
      els.slider.value = String(Math.round(level * 100));
      this._paintSlider(level);
    }
    setIcon(els.mute, volumeIcon(level, a.is_volume_muted === true));
    els.mute.setAttribute("aria-pressed", String(a.is_volume_muted === true));

    // transport
    const show = (b, ok) => {
      b.classList.toggle("hidden", !c.show_controls || (!ok && !unavailable));
      b.disabled = unavailable;
    };
    show(els.prev, supports(s, FEATURES.PREVIOUS_TRACK));
    show(els.next, supports(s, FEATURES.NEXT_TRACK));
    show(els.play, supports(s, FEATURES.PLAY) || supports(s, FEATURES.PAUSE) || supports(s, FEATURES.STOP));
    const playing = state === "playing" || state === "buffering";
    setIcon(els.play, playing ? (supports(s, FEATURES.PAUSE) ? "mdi:pause" : "mdi:stop") : "mdi:play");
    els.play.setAttribute("aria-label", playing ? "Pause" : "Wiedergabe");
    els.controls.classList.toggle("hidden", [els.mute, els.slider.parentElement, els.prev, els.play, els.next].every((b) => b.classList.contains("hidden")));

    // presets
    const current = activePreset(c.presets, s);
    els.presetButtons.forEach((b, i) => {
      b.classList.toggle("active", i === current);
      b.setAttribute("aria-pressed", String(i === current));
      b.disabled = unavailable;
    });

    // the open menu follows source / player changes
    if (!els.menu.classList.contains("hidden")) this._toggleMenu(true);
  }
}

// ---- editor

const LABELS = {
  entity: "Media-Player",
  entities: "Weitere Player (Umschalten über ▾)",
  name: "Name (optional)",
  icon: "Symbol (optional)",
  show_power: "Ein/Aus-Taste",
  show_volume: "Lautstärke",
  show_controls: "Zurück / Wiedergabe / Weiter",
  show_media_info: "Titel und Interpret anzeigen",
  show_source_list: "Quellen im Menü ▾",
  artwork: "Bild des Senders / Covers",
  preset_columns: "Spalten der Sender-Tasten",
  presets: "Sender / Favoriten (YAML)",
};

export function mediaToForm(config) {
  const c = config || {};
  const extra = (Array.isArray(c.entities) ? c.entities : []).map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean);
  return {
    entity: c.entity,
    entities: extra,
    name: c.name,
    icon: c.icon,
    show_power: c.show_power !== false,
    show_volume: c.show_volume !== false,
    show_controls: c.show_controls !== false,
    show_media_info: c.show_media_info !== false,
    show_source_list: c.show_source_list !== false,
    preset_columns: c.preset_columns,
    artwork: c.artwork === false ? "none" : c.artwork === true ? "both" : c.artwork || "thumbnail",
    presets: Array.isArray(c.presets) ? c.presets : [],
  };
}

export function mediaFromForm(config, form) {
  const out = { ...(config || {}) };
  const d = form || {};
  if (d.entity) out.entity = d.entity;
  const old = Array.isArray(out.entities) ? out.entities : [];
  const extra = (d.entities || []).filter((id) => id && id !== out.entity);
  if (extra.length) out.entities = extra.map((id) => old.find((e) => (typeof e === "string" ? e : e?.entity) === id) ?? id);
  else delete out.entities;
  for (const k of ["name", "icon"]) {
    if (typeof d[k] === "string" && d[k]) out[k] = d[k];
    else delete out[k];
  }
  for (const k of ["show_power", "show_volume", "show_controls", "show_media_info", "show_source_list"]) {
    if (d[k] === false) out[k] = false;
    else delete out[k];
  }
  if (d.artwork && d.artwork !== "thumbnail") out.artwork = d.artwork;
  else delete out.artwork;
  if (typeof d.preset_columns === "number") out.preset_columns = d.preset_columns;
  else delete out.preset_columns;
  if (Array.isArray(d.presets) && d.presets.length) out.presets = d.presets;
  else delete out.presets;
  return out;
}

export class SmartGraphMediaCardEditor extends Base {
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
      this._form.computeHelper = (s) =>
        s.name === "presets"
          ? "Liste mit name und media_content_id (Alexa: Sendername wie in der Alexa-App), source (Quelle/Favorit) oder action (z. B. script.radio)."
          : undefined;
      this._form.addEventListener("value-changed", (ev) => {
        const next = mediaFromForm(this._config, ev.detail.value);
        this._config = next;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
      });
      this.append(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = [
      { name: "entity", required: true, selector: { entity: { filter: { domain: "media_player" } } } },
      { name: "entities", selector: { entity: { multiple: true, filter: { domain: "media_player" } } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} } },
        ],
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_power", selector: { boolean: {} } },
          { name: "show_volume", selector: { boolean: {} } },
          { name: "show_controls", selector: { boolean: {} } },
          { name: "show_media_info", selector: { boolean: {} } },
          { name: "show_source_list", selector: { boolean: {} } },
        ],
      },
      {
        name: "artwork",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "thumbnail", label: "Kleines Bild statt Symbol" },
              { value: "background", label: "Als Hintergrund der Karte" },
              { value: "both", label: "Kleines Bild und Hintergrund" },
              { value: "none", label: "Kein Bild" },
            ],
          },
        },
      },
      { name: "preset_columns", selector: { number: { min: 1, max: 6, mode: "box" } } },
      { name: "presets", selector: { object: {} } },
    ];
    this._form.data = mediaToForm(this._config);
  }
}

export function registerMediaCard() {
  if (typeof customElements === "undefined" || customElements.get(MEDIA_TAG)) return;
  customElements.define(MEDIA_TAG, SmartGraphMediaCard);
  if (!customElements.get(MEDIA_EDITOR_TAG)) customElements.define(MEDIA_EDITOR_TAG, SmartGraphMediaCardEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: MEDIA_TAG,
    name: "Smart Graph Media Card",
    description: "Media-Player steuern (Alexa, Sonos, Google Cast, Spotify …): Ein/Aus, Lautstärke, Wiedergabe und Sender-Tasten.",
    preview: true,
    documentationURL: "https://github.com/rest2178/smart-graph-button-card",
  });
}
