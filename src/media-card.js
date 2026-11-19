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
  BROWSE_MEDIA: 131072,
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
/** Preset buttons: logo (small picture + name), tile (picture fills the button), text (name only). */
export const PRESET_STYLES = ["logo", "tile", "text"];

/** Key under which an automatically learned preset picture is stored. */
export function presetImageKey(players, preset) {
  return `sgmc-img:${players[0] || ""}:${preset.media_content_id ?? preset.source ?? preset.action ?? ""}:${preset.name}`;
}

function normalizePreset(p, i, errors) {
  if (typeof p === "string" || typeof p === "number") return { name: String(p), media_content_id: String(p) };
  if (!isPlainObject(p)) {
    errors.push(`presets[${i}] muss ein Text oder ein Objekt sein.`);
    return null;
  }
  const out = { ...p };
  const action = p.action ?? p.perform_action ?? p.service;
  if (action !== undefined) {
    if (action === "") return null;
    if (typeof action !== "string" || !SERVICE_RE.test(action)) errors.push(`presets[${i}].action „${action}“ ist ungültig (z. B. script.radio_an).`);
    out.action = action;
    delete out.perform_action;
    delete out.service;
    if (out.data !== undefined && !isPlainObject(out.data)) errors.push(`presets[${i}].data muss ein Objekt sein.`);
  } else if ((p.source === undefined || p.source === "") && (p.media_content_id === undefined || p.media_content_id === "")) {
    return null; // still incomplete (e.g. just added in the editor) – not shown
  }
  if (out.media_content_id !== undefined) out.media_content_id = String(out.media_content_id);
  if (out.source !== undefined) out.source = String(out.source);
  out.name = String(p.name ?? p.source ?? p.media_content_id ?? action ?? "");
  if (out.image !== undefined && out.image !== null && out.image !== "") {
    if (typeof out.image !== "string" || /["\\\n<>]/.test(out.image)) errors.push(`presets[${i}].image muss eine Bildadresse sein (z. B. /local/logos/oe3.png).`);
  } else delete out.image;
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
  // playlists: "auto" (media library of the player), a list like presets, or false
  let playlists = "auto";
  if (raw.playlists === false || raw.playlists === null) playlists = null;
  else if (Array.isArray(raw.playlists)) {
    const pErr = [];
    playlists = raw.playlists.map((p, i) => normalizePreset(p, i, pErr)).filter(Boolean);
    errors.push(...pErr.map((e) => e.replace(/^presets/, "playlists")));
  } else if (raw.playlists !== undefined && raw.playlists !== "auto") errors.push("playlists muss „auto“, false oder eine Liste sein.");
  let columns = raw.preset_columns === undefined ? null : parseNumber(raw.preset_columns);
  if (columns !== null && (!Number.isInteger(columns) || columns < 1 || columns > 6)) errors.push("preset_columns muss 1 bis 6 sein.");
  const presetStyle = raw.preset_style === undefined ? "logo" : raw.preset_style;
  if (!PRESET_STYLES.includes(presetStyle)) errors.push(`preset_style „${raw.preset_style}“ ist ungültig. Erlaubt: ${PRESET_STYLES.join(", ")}.`);
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
    preset_style: presetStyle,
    preset_show_name: raw.preset_show_name !== false,
    preset_auto_image: raw.preset_auto_image !== false,
    presets,
    playlists,
    show_options_menu: flag("show_options_menu"),
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
export function defaultContentType(platform, id, kind = "preset") {
  const s = String(id ?? "");
  const playlist = kind === "playlist";
  switch (platform) {
    case "alexa_media":
      // station name as in the Alexa app, e.g. "Radio Steiermark"; playlists from Amazon Music
      return playlist ? "AMAZON_MUSIC" : "TUNEIN";
    case "sonos":
      return s.startsWith("FV:") ? "favorite_item_id" : playlist ? "playlist" : "music";
    case "music_assistant":
    case "mass":
      return URL_RE.test(s) ? "music" : playlist ? "playlist" : "radio";
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
export function presetCall(preset, entityId, platform, kind = "preset") {
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
      media_content_type: preset.media_content_type || defaultContentType(platform, preset.media_content_id, kind),
    },
  };
}

/** Index of the preset that is playing right now (or -1). */
export function activePreset(presets, stateObj) {
  if (!stateObj || !["playing", "paused", "buffering", "on"].includes(stateObj.state)) return -1;
  const a = stateObj.attributes || {};
  const hay = [a.media_title, a.media_channel, a.media_artist, a.media_album_name, a.media_playlist, a.source, a.media_content_id]
    .filter((v) => v !== undefined && v !== null && v !== "")
    .map((v) => String(v).toLowerCase());
  if (!hay.length) return -1;
  return presets.findIndex((p) => {
    const keys = [p.match, p.source, p.media_content_id, p.name].filter(Boolean).map((v) => String(v).toLowerCase());
    return keys.some((k) => hay.some((h) => h === k || (k.length > 3 && h.includes(k))));
  });
}

/**
 * Index of the preset pressed last, as long as it is plausibly still playing:
 * same player, not switched to something else (media_content_id changed) and
 * not stopped (a short grace time covers the start-up of the player).
 * Updates `pressed.contentId` (content seen after the start). Returns -1 otherwise.
 */
export function pressedPreset(pressed, player, stateObj, now) {
  if (!pressed || pressed.player !== player || !stateObj) return -1;
  const age = now - pressed.at;
  const running = ["playing", "paused", "buffering", "on"].includes(stateObj.state);
  if (!running) return age < 20000 ? pressed.index : -1;
  const id = stateObj.attributes?.media_content_id;
  if (age > 5000) {
    if (pressed.contentId === undefined) pressed.contentId = id ?? null;
    else if (pressed.contentId !== null && id && id !== pressed.contentId) return -1;
  }
  return pressed.index;
}

const PLAYLIST_RE = /playlist|wiedergabeliste/i;

/** Playable playlists among the children of a media browser node. */
export function playlistItems(node, inPlaylistFolder = false) {
  return (Array.isArray(node?.children) ? node.children : []).filter(
    (c) => c && c.can_play && (inPlaylistFolder || c.media_class === "playlist" || PLAYLIST_RE.test(String(c.media_content_type || "")))
  );
}

/** Folders that probably contain playlists ("Playlists", "Meine Playlists" …). */
export function playlistFolders(node) {
  return (Array.isArray(node?.children) ? node.children : []).filter(
    (c) => c && c.can_expand && (PLAYLIST_RE.test(String(c.title || "")) || PLAYLIST_RE.test(String(c.media_content_type || "")) || PLAYLIST_RE.test(String(c.media_content_id || "")))
  );
}

/**
 * Search the media library of a player for playlists. `browse(args)` returns a
 * media browser node (media_player/browse_media). Looks into folders named
 * like "Playlists" up to two levels deep; at most `maxCalls` requests.
 */
export async function findPlaylists(browse, maxCalls = 8) {
  const found = [];
  const seen = new Set();
  const queue = [{ depth: 0, args: {}, inFolder: false }];
  let calls = 0;
  while (queue.length && calls < maxCalls && found.length < 60) {
    const { depth, args, inFolder } = queue.shift();
    calls += 1;
    let node;
    try {
      node = await browse(args);
    } catch (_err) {
      continue;
    }
    for (const it of playlistItems(node, inFolder)) {
      const key = `${it.media_content_type}|${it.media_content_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      found.push({ name: String(it.title ?? it.media_content_id), media_content_id: it.media_content_id, media_content_type: it.media_content_type, image: it.thumbnail || undefined });
    }
    if (depth >= 2) continue;
    let folders = playlistFolders(node).map((f) => ({ f, inFolder: true }));
    // nothing named "Playlists" on the top level: look one level into the libraries
    if (!folders.length && depth === 0) folders = (node?.children || []).filter((ch) => ch?.can_expand).slice(0, 4).map((f) => ({ f, inFolder: false }));
    for (const { f, inFolder: inF } of folders) queue.push({ depth: depth + 1, args: { media_content_id: f.media_content_id, media_content_type: f.media_content_type }, inFolder: inF });
  }
  return found;
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
.menu.omenu { left: 8px; right: auto; min-width: 240px; max-height: 340px; }
button.ic.opt-btn { width: 32px; margin-left: -8px; margin-right: -6px; }
button.ic.opt-btn.open { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
.menu .back { display: flex; align-items: center; gap: 6px; padding: 2px 8px 6px 4px; border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2)); margin-bottom: 4px; font-weight: 600; font-size: 14px; }
.menu .back button.ic { width: 34px; height: 34px; --mdc-icon-size: 20px; }
.menu .empty { padding: 10px 16px 12px; font-size: 13px; color: var(--secondary-text-color); line-height: 1.4; }
.menu button.item .thumb { width: 32px; height: 32px; border-radius: 5px; object-fit: cover; flex: none; background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); }
.menu button.item .grow { flex: 1 1 auto; min-width: 0; }
.menu button.item ha-icon.more { color: var(--secondary-text-color); margin-left: auto; }
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
button.preset .p-img { display: none; object-fit: cover; flex: none; background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); }
button.preset .p-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
/* logo: small picture left of the name */
.presets.style-logo button.preset.has-img { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0 6px 0 5px; }
.presets.style-logo button.preset.has-img .p-img { display: block; width: 28px; height: 28px; border-radius: 5px; }
.presets.style-logo button.preset.has-img ha-icon { display: none; }
/* tile: picture fills the button, name small below */
.presets.style-tile { gap: 12px; }
.presets.style-tile button.preset { height: auto; padding: 0; display: flex; flex-direction: column; align-items: stretch; border-radius: 10px; overflow: hidden; }
.presets.style-tile button.preset .p-art {
  position: relative;
  aspect-ratio: 16 / 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  box-sizing: border-box;
  font-size: 15px;
  font-weight: 700;
  white-space: normal;
  line-height: 1.2;
  text-align: center;
  overflow: hidden;
  background: color-mix(in srgb, var(--sgmc-active) 12%, var(--card-background-color, #fff));
  color: var(--sgmc-active);
}
.presets.style-tile button.preset .p-art ha-icon { --mdc-icon-size: 28px; margin: 0; }
.presets.style-tile button.preset.has-img .p-art { padding: 0; background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); }
.presets.style-tile button.preset.has-img .p-art > :not(.p-img) { display: none; }
.presets.style-tile button.preset .p-img { position: absolute; inset: 0; width: 100%; height: 100%; }
.presets.style-tile button.preset.has-img .p-img { display: block; }
.presets.style-tile button.preset .p-name { padding: 6px 8px 7px; font-size: 12px; text-align: center; }
.presets.style-tile.no-name button.preset .p-name { display: none; }
.presets.style-tile button.preset.active { box-shadow: 0 0 0 2px var(--sgmc-active), 0 1px 3px rgba(0, 0, 0, 0.22); }
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
      if (!this._els || ev.composedPath().includes(this)) return;
      if (!this._els.menu.classList.contains("hidden")) this._toggleMenu(false);
      if (!this._els.omenu.classList.contains("hidden")) this._toggleOptions(false);
    };
    document.addEventListener("click", this._outside, true);
  }

  disconnectedCallback() {
    if (this._outside) document.removeEventListener("click", this._outside, true);
    clearTimeout(this._volTimer);
  }

  _presetImage(i) {
    const c = this._config;
    const p = c.presets[i];
    if (!p || c.preset_style === "text") return { src: null };
    if (p.image) return { src: typeof this._hass?.hassUrl === "function" && p.image.startsWith("/") && !p.image.startsWith("//") ? this._hass.hassUrl(p.image) : p.image };
    if (!c.preset_auto_image) return { src: null };
    try {
      const v = localStorage.getItem(presetImageKey(c.players, p));
      return { src: v || null, auto: true };
    } catch (_err) {
      return { src: null };
    }
  }

  _paintPresetImages() {
    (this._els?.presetButtons || []).forEach(({ button, img }, i) => {
      const { src, auto } = this._presetImage(i);
      if (!src) {
        button.classList.remove("has-img");
        if (img.hasAttribute("src")) img.removeAttribute("src");
        return;
      }
      if (auto) img.dataset.auto = "1";
      else delete img.dataset.auto;
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
      else if (img.complete && img.naturalWidth) button.classList.add("has-img");
    });
  }

  _forgetPresetImage(i) {
    try {
      localStorage.removeItem(presetImageKey(this._config.players, this._config.presets[i]));
    } catch (_err) {
      /* ignore */
    }
  }

  /**
   * Store the picture of the playing station for preset i. Pictures from Home
   * Assistant (media proxy with a rotating token) are copied as a small data
   * URL; pictures from other servers are stored as their address.
   */
  _learnPresetImage(i, url) {
    const c = this._config;
    const key = presetImageKey(c.players, c.presets[i]);
    try {
      if (localStorage.getItem(key) || this._learning?.[key]) return;
    } catch (_err) {
      return;
    }
    this._learning = { ...(this._learning || {}), [key]: true };
    const done = (value) => {
      if (this._learning) delete this._learning[key];
      if (!value) return;
      try {
        localStorage.setItem(key, value);
      } catch (_err) {
        /* storage full or blocked */
      }
      this._paintPresetImages();
    };
    let sameOrigin = false;
    try {
      sameOrigin = new URL(url, location.href).origin === location.origin;
    } catch (_err) {
      sameOrigin = false;
    }
    if (!sameOrigin) {
      done(url);
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const size = 160;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        done(canvas.toDataURL("image/jpeg", 0.85));
      } catch (_err) {
        done(null);
      }
    };
    img.onerror = () => done(null);
    img.src = url;
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
    if (this._els) this._toggleOptions(false);
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
    const optBtn = iconButton(`opt-btn${c.show_options_menu ? "" : " hidden"}`, "mdi:dots-vertical", "Optionen");
    optBtn.setAttribute("aria-haspopup", "true");
    optBtn.setAttribute("aria-expanded", "false");
    const menuBtn = iconButton("menu-btn", "mdi:chevron-down", "Player und Quelle wählen");
    menuBtn.setAttribute("aria-haspopup", "true");
    menuBtn.setAttribute("aria-expanded", "false");
    const power = iconButton("power", "mdi:power", "Ein/Aus");
    head.append(optBtn, pIcon, thumb, titles, menuBtn, power);
    const menu = el("div", "menu hidden", { role: "menu" });
    const omenu = el("div", "menu omenu hidden", { role: "menu" });

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

    const presets = el("div", `presets style-${c.preset_style}${c.preset_show_name ? "" : " no-name"}${c.presets.length ? "" : " hidden"}`);
    presets.style.setProperty("--sgmc-cols", String(c.preset_columns));
    const presetButtons = c.presets.map((p, i) => {
      const b = el("button", "preset", { type: "button", title: p.name, "aria-label": p.name });
      const img = el("img", "p-img", { alt: "", loading: "lazy", decoding: "async" });
      img.addEventListener("error", () => {
        // picture not loadable: forget a learned one, show the button without it
        if (img.dataset.auto) this._forgetPresetImage(i);
        b.classList.remove("has-img");
        img.removeAttribute("src");
      });
      img.addEventListener("load", () => b.classList.add("has-img"));
      const icon = () => {
        const ic = el("ha-icon");
        ic.icon = p.icon;
        ic.setAttribute("icon", p.icon);
        return ic;
      };
      const name = el("span", "p-name");
      name.textContent = p.name;
      if (c.preset_style === "tile") {
        const art = el("span", "p-art");
        art.append(img);
        if (p.icon) art.append(icon());
        else art.append(document.createTextNode(p.name));
        b.append(art, name);
      } else {
        b.append(img);
        if (p.icon) b.append(icon());
        b.append(name);
      }
      b.addEventListener("click", () => this._playPreset(i));
      presets.append(b);
      return { button: b, img };
    });

    card.append(artBg, head, menu, omenu, controls, presets);

    // events
    menuBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._toggleOptions(false);
      this._toggleMenu();
    });
    optBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._toggleOptions();
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

    this._els = { card, optBtn, omenu, pIcon, thumb, artBg, name, info, menuBtn, power, menu, controls, mute, slider, prev, play, next, presets, presetButtons };
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
    // remember the pressed preset: many players (e.g. Alexa with radio) report
    // the song, not the station – this way highlight and picture still match
    this._pressed = { player: this._current, index: i, at: Date.now(), artBefore: artworkUrl(this._stateObj(), this._hass) };
    this._call(call.domain, call.service, call.data);
    this._update();
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

  // ---- options menu (⋮): playlists, sources, player details

  _playlistState() {
    const c = this._config;
    if (Array.isArray(c.playlists)) return { items: c.playlists, loading: false, enabled: true };
    if (c.playlists !== "auto") return { items: [], loading: false, enabled: false };
    const s = this._stateObj();
    const cache = this._browseCache?.[this._current];
    return { items: cache?.items || [], loading: Boolean(cache?.loading), enabled: supports(s, FEATURES.BROWSE_MEDIA), auto: true, done: Boolean(cache?.at) };
  }

  _loadPlaylists(force) {
    const c = this._config;
    const id = this._current;
    if (c.playlists !== "auto" || !this._hass?.callWS) return;
    this._browseCache = this._browseCache || {};
    const cache = this._browseCache[id];
    if (cache?.loading || (!force && cache?.at && Date.now() - cache.at < 300000)) return;
    this._browseCache[id] = { items: cache?.items || [], loading: true, at: cache?.at };
    const browse = (args) => this._hass.callWS({ type: "media_player/browse_media", entity_id: id, ...args });
    findPlaylists(browse)
      .catch(() => [])
      .then((items) => {
        this._browseCache[id] = { items, loading: false, at: Date.now() };
        if (this._optView === "playlists" && id === this._current) this._renderOptions();
      });
  }

  /** Picture URL for a menu item; HA-internal pictures need a signed path. */
  _menuImage(img, url) {
    if (!url) return;
    if (!url.startsWith("/") || url.startsWith("//") || url.startsWith("/local/") || !this._hass?.callWS) {
      img.src = url.startsWith("/") && !url.startsWith("//") && typeof this._hass?.hassUrl === "function" ? this._hass.hassUrl(url) : url;
      return;
    }
    this._signed = this._signed || {};
    const done = (path) => {
      img.src = typeof this._hass?.hassUrl === "function" ? this._hass.hassUrl(path) : path;
    };
    if (this._signed[url]) return done(this._signed[url]);
    this._hass
      .callWS({ type: "auth/sign_path", path: url, expires: 3600 })
      .then((r) => {
        this._signed[url] = r?.path || url;
        done(this._signed[url]);
      })
      .catch(() => done(url));
  }

  _menuItem({ label, icon, image, more, selected }, onClick) {
    const b = el("button", `item${selected ? " selected" : ""}`, { type: "button", role: "menuitem" });
    if (image !== undefined) {
      const img = el("img", "thumb", { alt: "", loading: "lazy", decoding: "async" });
      img.addEventListener("error", () => img.replaceWith(Object.assign(el("ha-icon"), { icon: icon || "mdi:playlist-music" })));
      this._menuImage(img, image);
      if (!image) {
        const ic = el("ha-icon");
        ic.icon = icon || "mdi:playlist-music";
        ic.setAttribute("icon", ic.icon);
        b.append(ic);
      } else b.append(img);
    } else if (icon) {
      const ic = el("ha-icon");
      ic.icon = selected ? "mdi:check" : icon;
      ic.setAttribute("icon", ic.icon);
      b.append(ic);
    }
    const span = el("span", "grow");
    span.textContent = label;
    b.append(span);
    if (more) {
      const m = el("ha-icon", "more");
      m.icon = "mdi:chevron-right";
      m.setAttribute("icon", m.icon);
      b.append(m);
    }
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      onClick();
    });
    return b;
  }

  _toggleOptions(force, view = "main") {
    const els = this._els;
    if (!els) return;
    const open = force ?? els.omenu.classList.contains("hidden");
    if (open) {
      this._toggleMenu(false);
      this._optView = view;
      this._renderOptions();
    }
    els.omenu.classList.toggle("hidden", !open);
    els.optBtn.classList.toggle("open", open);
    els.optBtn.setAttribute("aria-expanded", String(open));
  }

  _renderOptions() {
    const els = this._els;
    const m = els.omenu;
    const s = this._stateObj();
    const view = this._optView || "main";
    m.replaceChildren();
    const back = (title) => {
      const row = el("div", "back");
      const b = iconButton("", "mdi:arrow-left", "Zurück");
      b.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._optView = "main";
        this._renderOptions();
      });
      const t = el("span");
      t.textContent = title;
      row.append(b, t);
      m.append(row);
    };
    const sources = Array.isArray(s?.attributes?.source_list) && supports(s, FEATURES.SELECT_SOURCE) ? s.attributes.source_list : [];
    if (view === "main") {
      const pl = this._playlistState();
      if (pl.enabled) {
        m.append(
          this._menuItem({ label: "Playlists", icon: "mdi:playlist-music", more: true }, () => {
            this._optView = "playlists";
            this._loadPlaylists();
            this._renderOptions();
          })
        );
      }
      if (sources.length) {
        m.append(
          this._menuItem({ label: "Quellen", icon: "mdi:import", more: true }, () => {
            this._optView = "sources";
            this._renderOptions();
          })
        );
      }
      m.append(
        this._menuItem({ label: "Player-Details", icon: "mdi:information-outline" }, () => {
          this._toggleOptions(false);
          this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: this._current }, bubbles: true, composed: true }));
        })
      );
      return;
    }
    if (view === "sources") {
      back("Quellen");
      for (const src of sources) {
        m.append(
          this._menuItem({ label: String(src), icon: "mdi:music-box-multiple-outline", selected: src === s.attributes.source }, () => {
            this._toggleOptions(false);
            this._call("media_player", "select_source", { entity_id: this._current, source: src });
          })
        );
      }
      return;
    }
    // playlists
    back("Playlists");
    const pl = this._playlistState();
    if (pl.loading && !pl.items.length) {
      const e = el("div", "empty");
      e.textContent = "Playlists werden geladen …";
      m.append(e);
      return;
    }
    if (!pl.items.length) {
      const e = el("div", "empty");
      e.textContent = pl.auto
        ? "Keine Playlists in der Mediathek dieses Players gefunden. Eigene Playlists lassen sich im Karten-Editor unter „Playlists“ eintragen."
        : "Noch keine Playlists eingetragen (Karten-Editor → „Playlists“).";
      m.append(e);
      return;
    }
    const active = activePreset(pl.items, s);
    pl.items.forEach((p, i) => {
      m.append(
        this._menuItem({ label: p.name, icon: "mdi:playlist-music", image: p.image || "", selected: i === active }, () => {
          this._toggleOptions(false);
          const call = presetCall(p, this._current, this._platform(this._current), "playlist");
          this._call(call.domain, call.service, call.data);
        })
      );
    });
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
    const matched = activePreset(c.presets, s);
    const pressed = matched < 0 ? pressedPreset(this._pressed, this._current, s, Date.now()) : -1;
    if (matched >= 0 || (this._pressed && pressed < 0)) this._pressed = null;
    const current = matched >= 0 ? matched : pressed;
    els.presetButtons.forEach(({ button: b }, i) => {
      b.classList.toggle("active", i === current);
      b.setAttribute("aria-pressed", String(i === current));
      b.disabled = unavailable;
    });
    // automatic picture: remember the station picture while this preset plays
    if (current >= 0 && c.preset_auto_image && c.preset_style !== "text" && !c.presets[current].image) {
      const art = artworkUrl(s, this._hass);
      // after pressing a preset wait for the new picture (not the one of the previous station)
      const stale = pressed >= 0 && (art === this._pressed?.artBefore || Date.now() - this._pressed.at > 120000);
      if (art && !stale) this._learnPresetImage(current, art);
    }
    this._paintPresetImages();

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
  preset_style: "Aussehen der Sender-Tasten",
  preset_show_name: "Namen unter dem Bild zeigen",
  preset_auto_image: "Senderbild automatisch übernehmen",
  show_options_menu: "Optionsmenü ⋮ (Playlists, Quellen)",
  playlist_mode: "Playlists im Menü ⋮",
};

const PRESET_LABELS = {
  name: "Beschriftung",
  icon: "Symbol (optional)",
  kind: "Art",
  media_content_id: "Sender / Inhalt",
  media_content_type: "Typ (leer = automatisch)",
  source: "Quelle / Favorit",
  action: "Aktion (Dienst)",
  data: "Daten (optional)",
  match: "Erkennen am Text (optional)",
  image: "Bild (Adresse, optional)",
  image_upload: "Bild hochladen",
};

const PRESET_HELPERS = {
  media_content_id: "Alexa: Sendername wie in der Alexa-App (z. B. Radio Steiermark). Andere: Stream-URL, Spotify-URI oder ID.",
  media_content_type: "Alexa: TUNEIN (Standard), AMAZON_MUSIC oder custom (Sprachbefehl). Sonos: favorite_item_id. Music Assistant: radio.",
  action: "z. B. script.radio_morgens oder media_player.volume_set",
  data: "entity_id: current = der in der Karte gewählte Player",
  image: "Logo oder Cover: /local/logos/oe3.png (Ordner www), eine Internet-Adresse oder hochladen. Leer = automatisch, sobald der Sender einmal läuft.",
  match: "Hebt die Taste hervor, wenn dieser Text im Titel, Sender oder in der Quelle vorkommt.",
};

const PRESET_KINDS = [
  { value: "media", label: "Sender / Inhalt abspielen" },
  { value: "source", label: "Quelle / Favorit des Players" },
  { value: "action", label: "Beliebige Aktion (Skript, Dienst)" },
];

const CONTENT_TYPES = ["TUNEIN", "AMAZON_MUSIC", "custom", "music", "radio", "playlist", "favorite_item_id", "url"];

/** Preset (string or object from YAML) → flat editor data. */
export function presetToForm(preset) {
  const p = typeof preset === "string" || typeof preset === "number" ? { name: String(preset), media_content_id: String(preset) } : isPlainObject(preset) ? preset : {};
  const action = p.action ?? p.perform_action ?? p.service;
  const kind = action !== undefined ? "action" : p.source !== undefined ? "source" : "media";
  const f = { kind, name: p.name ?? "" };
  if (p.icon) f.icon = p.icon;
  if (p.image) {
    f.image = p.image;
    if (String(p.image).startsWith("/api/image/serve/")) f.image_upload = p.image;
  }
  if (p.match) f.match = p.match;
  if (kind === "action") {
    f.action = action;
    if (isPlainObject(p.data)) f.data = p.data;
  } else if (kind === "source") f.source = p.source === undefined ? "" : String(p.source);
  else {
    f.media_content_id = p.media_content_id === undefined ? "" : String(p.media_content_id);
    if (p.media_content_type) f.media_content_type = p.media_content_type;
  }
  return f;
}

/** Flat editor data → preset object (only the keys of the chosen kind). */
export function presetFromForm(f) {
  const d = f || {};
  const out = {};
  const name = typeof d.name === "string" ? d.name.trim() : "";
  if (name) out.name = name;
  if (d.icon) out.icon = d.icon;
  // a new upload replaces the address field
  let image = d.image_upload && d.image_upload !== d._image_upload_before ? d.image_upload : d.image;
  // upload removed → also drop its address
  if (!d.image_upload && d._image_upload_before && image === d._image_upload_before) image = "";
  if (typeof image === "string" && image.trim()) out.image = image.trim();
  if (d.kind === "action") {
    out.action = d.action || "";
    if (isPlainObject(d.data) && Object.keys(d.data).length) out.data = d.data;
  } else if (d.kind === "source") out.source = d.source ?? "";
  else {
    out.media_content_id = d.media_content_id ?? "";
    if (d.media_content_type) out.media_content_type = d.media_content_type;
  }
  if (typeof d.match === "string" && d.match.trim()) out.match = d.match.trim();
  return out;
}

export function presetSchema(kind, sources) {
  const value =
    kind === "action"
      ? [
          { name: "action", selector: { text: {} } },
          { name: "data", selector: { object: {} } },
        ]
      : kind === "source"
        ? [
            sources.length
              ? { name: "source", selector: { select: { mode: "dropdown", custom_value: true, options: sources.map((v) => ({ value: v, label: v })) } } }
              : { name: "source", selector: { text: {} } },
          ]
        : [
            { name: "media_content_id", selector: { text: {} } },
            { name: "media_content_type", selector: { select: { mode: "dropdown", custom_value: true, options: CONTENT_TYPES.map((v) => ({ value: v, label: v })) } } },
          ];
  return [
    {
      type: "grid",
      name: "",
      schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
      ],
    },
    { name: "kind", selector: { select: { mode: "dropdown", options: PRESET_KINDS } } },
    ...value,
    { name: "image", selector: { text: {} } },
    { name: "image_upload", selector: { image: {} } },
    { name: "match", selector: { text: {} } },
  ];
}

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
    preset_style: c.preset_style || "logo",
    show_options_menu: c.show_options_menu !== false,
    playlist_mode: c.playlists === false || c.playlists === null ? "none" : Array.isArray(c.playlists) ? "list" : "auto",
    preset_show_name: c.preset_show_name !== false,
    preset_auto_image: c.preset_auto_image !== false,
    artwork: c.artwork === false ? "none" : c.artwork === true ? "both" : c.artwork || "thumbnail",
  };
}

/** Main form → config. Presets are edited in their own list and kept as they are. */
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
  if (d.show_options_menu === false) out.show_options_menu = false;
  else delete out.show_options_menu;
  if (d.playlist_mode === "none") out.playlists = false;
  else if (d.playlist_mode === "list") out.playlists = Array.isArray(out.playlists) ? out.playlists : [];
  else if (d.playlist_mode === "auto") delete out.playlists;
  if (d.preset_style && d.preset_style !== "logo") out.preset_style = d.preset_style;
  else delete out.preset_style;
  for (const k of ["preset_show_name", "preset_auto_image"]) {
    if (d[k] === false) out[k] = false;
    else delete out[k];
  }
  if (typeof d.preset_columns === "number") out.preset_columns = d.preset_columns;
  else delete out.preset_columns;
  return out;
}

const EDITOR_STYLES = `
.sgmc-ed-presets { margin-top: 20px; }
.sgmc-ed-title { font-size: 15px; font-weight: 500; margin: 0 0 4px; }
.sgmc-ed-hint { font-size: 12px; color: var(--secondary-text-color); margin: 0 0 10px; }
.sgmc-ed-item { border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3)); border-radius: 12px; padding: 4px 12px 12px; margin-bottom: 10px; }
.sgmc-ed-head { display: flex; align-items: center; gap: 4px; min-height: 40px; }
.sgmc-ed-head .label { flex: 1 1 auto; min-width: 0; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sgmc-ed-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; padding: 0; border: 0; border-radius: 50%;
  background: transparent; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
}
.sgmc-ed-btn:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
.sgmc-ed-btn:disabled { color: var(--disabled-text-color, #9ca3af); cursor: default; background: transparent; }
.sgmc-ed-btn.delete { color: var(--error-color, #db4437); }
.sgmc-ed-add {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px 8px 12px;
  border: 1px solid var(--primary-color, #03a9f4); border-radius: 18px; background: transparent;
  color: var(--primary-color, #03a9f4); font: inherit; font-weight: 500; cursor: pointer; --mdc-icon-size: 20px;
}
.sgmc-ed-add:hover { background: color-mix(in srgb, var(--primary-color, #03a9f4) 8%, transparent); }
`;

export class SmartGraphMediaCardEditor extends Base {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    for (const item of [...(this._listItems?.presets || []), ...(this._listItems?.playlists || [])]) item.form.hass = hass;
  }

  _emit(next) {
    this._config = next;
    this._renderedPresets = this._listsJson(next);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }

  _listsJson(c) {
    return JSON.stringify([c?.presets || [], Array.isArray(c?.playlists) ? c.playlists : null]);
  }

  _list(key) {
    return Array.isArray(this._config?.[key]) ? this._config[key] : [];
  }

  _sources() {
    const id = this._config?.entity;
    const list = this._hass?.states?.[id]?.attributes?.source_list;
    return Array.isArray(list) ? list.map(String) : [];
  }

  _setList(key, list, rebuild) {
    const next = { ...this._config };
    if (list.length || key === "playlists") next[key] = list;
    else delete next[key];
    this._emit(next);
    if (rebuild) this._renderLists();
  }

  _render() {
    if (!customElements.get("ha-form")) {
      this.textContent = "Der visuelle Editor ist nicht verfügbar. Bitte den YAML-Modus verwenden.";
      return;
    }
    if (!this._form) {
      const style = document.createElement("style");
      style.textContent = EDITOR_STYLES;
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => LABELS[s.name] ?? s.name;
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const listShown = (c) => Array.isArray(c?.playlists) && c.show_options_menu !== false;
        const before = listShown(this._config);
        this._emit(mediaFromForm(this._config, ev.detail.value));
        // playlist mode switched → show / hide the playlist list
        if (listShown(this._config) !== before) this._renderLists();
      });
      this._presetBox = document.createElement("div");
      this._presetBox.className = "sgmc-ed-presets";
      this._playlistBox = document.createElement("div");
      this._playlistBox.className = "sgmc-ed-presets";
      this.append(style, this._form, this._presetBox, this._playlistBox);
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
      { name: "show_options_menu", selector: { boolean: {} } },
      ...(this._config?.show_options_menu === false
        ? []
        : [
            {
              name: "playlist_mode",
              selector: {
                select: {
                  mode: "dropdown",
                  options: [
                    { value: "auto", label: "Automatisch aus der Mediathek des Players" },
                    { value: "list", label: "Eigene Liste (z. B. für Alexa / Amazon Music)" },
                    { value: "none", label: "Keine Playlists" },
                  ],
                },
              },
            },
          ]),
      { name: "preset_columns", selector: { number: { min: 1, max: 6, mode: "box" } } },
      {
        name: "preset_style",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "logo", label: "Logo + Name" },
              { value: "tile", label: "Bild-Kachel" },
              { value: "text", label: "Nur Name" },
            ],
          },
        },
      },
      {
        type: "grid",
        name: "",
        schema: [
          ...((this._config?.preset_style || "logo") === "tile" ? [{ name: "preset_show_name", selector: { boolean: {} } }] : []),
          ...((this._config?.preset_style || "logo") !== "text" ? [{ name: "preset_auto_image", selector: { boolean: {} } }] : []),
        ],
      },
    ];
    this._form.data = mediaToForm(this._config);
    // the list is only rebuilt when the presets changed from outside (YAML mode, undo)
    if (this._listsJson(this._config) !== this._renderedPresets) this._renderLists();
  }

  _button(icon, label, className, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `sgmc-ed-btn ${className || ""}`;
    b.title = label;
    b.setAttribute("aria-label", label);
    const i = document.createElement("ha-icon");
    i.icon = icon;
    i.setAttribute("icon", icon);
    b.append(i);
    b.addEventListener("click", onClick);
    return b;
  }

  _renderLists() {
    this._renderedPresets = this._listsJson(this._config);
    this._listItems = {};
    this._renderList("presets", this._presetBox, {
      title: "Sender / Favoriten",
      hint: "Jede Taste spielt einen Sender oder Inhalt ab, wählt eine Quelle des Players oder startet eine Aktion.",
      add: "Sender hinzufügen",
      item: "Taste",
    });
    if (Array.isArray(this._config?.playlists) && this._config.show_options_menu !== false) {
      this._renderList("playlists", this._playlistBox, {
        title: "Playlists (Menü ⋮)",
        hint: "Alexa: Name der Playlist aus Amazon Music (Typ AMAZON_MUSIC wird automatisch gewählt). Spotify: spotify:playlist:… Andere: ID oder URL.",
        add: "Playlist hinzufügen",
        item: "Playlist",
      });
    } else if (this._playlistBox) this._playlistBox.replaceChildren();
  }

  _renderList(key, box, text) {
    if (!box) return;
    const entries = this._list(key);
    box.replaceChildren();
    const title = document.createElement("div");
    title.className = "sgmc-ed-title";
    title.textContent = text.title;
    const hint = document.createElement("div");
    hint.className = "sgmc-ed-hint";
    hint.textContent = text.hint;
    box.append(title, hint);
    const sources = this._sources();
    this._listItems[key] = entries.map((entry, i) => {
      const wrap = document.createElement("div");
      wrap.className = "sgmc-ed-item";
      const head = document.createElement("div");
      head.className = "sgmc-ed-head";
      const label = document.createElement("span");
      label.className = "label";
      const data = presetToForm(entry);
      label.textContent = data.name || `${text.item} ${i + 1}`;
      const move = (dir) => {
        const list = [...this._list(key)];
        const j = i + dir;
        [list[i], list[j]] = [list[j], list[i]];
        this._setList(key, list, true);
      };
      const up = this._button("mdi:arrow-up", "Nach oben", "", () => move(-1));
      const down = this._button("mdi:arrow-down", "Nach unten", "", () => move(1));
      up.disabled = i === 0;
      down.disabled = i === entries.length - 1;
      const del = this._button("mdi:delete-outline", `${text.item} löschen`, "delete", () => {
        this._setList(key, this._list(key).filter((_, k) => k !== i), true);
      });
      head.append(label, up, down, del);
      const form = document.createElement("ha-form");
      form.hass = this._hass;
      form.computeLabel = (sch) => PRESET_LABELS[sch.name] ?? sch.name;
      form.computeHelper = (sch) => PRESET_HELPERS[sch.name];
      form.schema = presetSchema(data.kind, sources);
      form.data = data;
      form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = ev.detail.value || {};
        const kindChanged = value.kind !== form.data?.kind;
        const next = presetFromForm({ ...value, _image_upload_before: form.data?.image_upload });
        const list = [...this._list(key)];
        list[i] = next;
        this._setList(key, list, false);
        label.textContent = next.name || `${text.item} ${i + 1}`;
        // other kind → other fields
        if (kindChanged) form.schema = presetSchema(value.kind, sources);
        form.data = presetToForm(next);
      });
      wrap.append(head, form);
      box.append(wrap);
      return { wrap, form };
    });
    const add = document.createElement("button");
    add.type = "button";
    add.className = "sgmc-ed-add";
    const plus = document.createElement("ha-icon");
    plus.icon = "mdi:plus";
    plus.setAttribute("icon", "mdi:plus");
    add.append(plus, document.createTextNode(text.add));
    add.addEventListener("click", () => this._setList(key, [...this._list(key), { name: "", media_content_id: "" }], true));
    box.append(add);
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
