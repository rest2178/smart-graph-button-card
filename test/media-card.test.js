import { test } from "node:test";
import assert from "node:assert/strict";
import { validateMediaConfig, defaultContentType, presetCall, activePreset, volumeIcon, supports, FEATURES, mediaToForm, mediaFromForm, artworkUrl } from "../src/media-card.js";

test("config: players, presets, defaults, errors", () => {
  const c = validateMediaConfig({ entity: "media_player.a", entities: ["media_player.b", { entity: "media_player.a" }, { entity: "media_player.c", name: "Küche" }], presets: ["Ö3", { name: "Ö1", source: "Ö1" }] });
  assert.deepEqual(c.players, ["media_player.a", "media_player.b", "media_player.c"]);
  assert.equal(c.names["media_player.c"], "Küche");
  assert.deepEqual(c.presets[0], { name: "Ö3", media_content_id: "Ö3" });
  assert.equal(c.preset_columns, 2);
  assert.equal(c.show_power, true);
  assert.throws(() => validateMediaConfig({}));
  assert.throws(() => validateMediaConfig({ entity: "light.x" }));
  assert.throws(() => validateMediaConfig({ entity: "media_player.a", presets: [{ name: "leer" }] }));
  assert.throws(() => validateMediaConfig({ entity: "media_player.a", presets: [{ action: "kein service" }] }));
  assert.throws(() => validateMediaConfig({ entity: "media_player.a", preset_columns: 9 }));
});

test("content type per integration", () => {
  assert.equal(defaultContentType("alexa_media", "Radio Steiermark"), "TUNEIN");
  assert.equal(defaultContentType("sonos", "FV:2/31"), "favorite_item_id");
  assert.equal(defaultContentType("music_assistant", "Ö3"), "radio");
  assert.equal(defaultContentType("spotify", "spotify:playlist:123"), "playlist");
  assert.equal(defaultContentType("cast", "https://x/stream"), "music");
  assert.equal(defaultContentType(undefined, "x"), "music");
});

test("preset service calls", () => {
  assert.deepEqual(presetCall({ name: "Ö3", media_content_id: "Hitradio Ö3" }, "media_player.e", "alexa_media"), {
    domain: "media_player", service: "play_media", data: { entity_id: "media_player.e", media_content_id: "Hitradio Ö3", media_content_type: "TUNEIN" },
  });
  assert.equal(presetCall({ media_content_id: "x", media_content_type: "custom" }, "media_player.e", "alexa_media").data.media_content_type, "custom");
  assert.deepEqual(presetCall({ source: "Ö1" }, "media_player.s"), { domain: "media_player", service: "select_source", data: { entity_id: "media_player.s", source: "Ö1" } });
  assert.deepEqual(presetCall({ action: "media_player.volume_set", data: { entity_id: "current", volume_level: 0.2 } }, "media_player.s"), {
    domain: "media_player", service: "volume_set", data: { entity_id: "media_player.s", volume_level: 0.2 },
  });
});

test("active preset from title / source", () => {
  const presets = [{ name: "Radio Steiermark", media_content_id: "Radio Steiermark" }, { name: "Ö3", media_content_id: "Hitradio Ö3" }];
  assert.equal(activePreset(presets, { state: "playing", attributes: { media_title: "Hitradio Ö3" } }), 1);
  assert.equal(activePreset(presets, { state: "playing", attributes: { media_artist: "ORF Radio Steiermark" } }), 0);
  assert.equal(activePreset(presets, { state: "idle", attributes: { media_title: "Hitradio Ö3" } }), -1);
  assert.equal(activePreset(presets, { state: "playing", attributes: {} }), -1);
});

test("volume icon and feature bits", () => {
  assert.equal(volumeIcon(0.8, false), "mdi:volume-high");
  assert.equal(volumeIcon(0.5, false), "mdi:volume-medium");
  assert.equal(volumeIcon(0.1, false), "mdi:volume-low");
  assert.equal(volumeIcon(0.5, true), "mdi:volume-off");
  assert.ok(supports({ attributes: { supported_features: 4 | 16 } }, FEATURES.PREVIOUS_TRACK));
  assert.ok(!supports({ attributes: {} }, FEATURES.VOLUME_SET));
});

test("editor mapping keeps presets and objects", () => {
  const cfg = { type: "custom:smart-graph-media-card", entity: "media_player.a", entities: [{ entity: "media_player.b", name: "B" }], presets: ["Ö3"] };
  const form = mediaToForm(cfg);
  assert.deepEqual(form.entities, ["media_player.b"]);
  const out = mediaFromForm(cfg, { ...form, show_power: false });
  assert.deepEqual(out.entities, [{ entity: "media_player.b", name: "B" }]);
  assert.equal(out.show_power, false);
  assert.deepEqual(out.presets, ["Ö3"]);
  const back = mediaFromForm(out, { ...mediaToForm(out), show_power: true, entities: [] });
  assert.equal(back.show_power, undefined);
  assert.equal(back.entities, undefined);
});

test("artwork: modes and picture url", () => {
  assert.equal(validateMediaConfig({ entity: "media_player.a" }).artwork, "thumbnail");
  assert.equal(validateMediaConfig({ entity: "media_player.a", artwork: "both" }).artwork, "both");
  assert.equal(validateMediaConfig({ entity: "media_player.a", artwork: false }).artwork, "none");
  assert.throws(() => validateMediaConfig({ entity: "media_player.a", artwork: "huge" }));
  const hass = { hassUrl: (p) => `http://ha.local:8123${p}` };
  const playing = { state: "playing", attributes: { entity_picture: "/api/media_player_proxy/media_player.a?token=x" } };
  assert.equal(artworkUrl(playing, hass), "http://ha.local:8123/api/media_player_proxy/media_player.a?token=x");
  assert.equal(artworkUrl({ state: "playing", attributes: { entity_picture: "https://cdn/x.jpg" } }, hass), "https://cdn/x.jpg");
  assert.equal(artworkUrl({ ...playing, state: "idle" }, hass), null);
  assert.equal(artworkUrl({ state: "playing", attributes: {} }, hass), null);
  const form = mediaToForm({ entity: "media_player.a", artwork: "background" });
  assert.equal(form.artwork, "background");
  assert.equal(mediaFromForm({ entity: "media_player.a", artwork: "both" }, { ...form, artwork: "thumbnail" }).artwork, undefined);
  assert.equal(mediaFromForm({ entity: "media_player.a" }, { ...form, artwork: "none" }).artwork, "none");
});
