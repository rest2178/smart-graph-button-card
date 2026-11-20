import { test } from "node:test";
import assert from "node:assert/strict";
import { validateMediaConfig, defaultContentType, presetCall, activePreset, volumeIcon, supports, FEATURES, mediaToForm, mediaFromForm, artworkUrl, presetToForm, presetFromForm, presetSchema, presetImageKey, pressedPreset, artKey, currentPreset, findPlaylists, playlistItems, playlistFolders } from "../src/media-card.js";

test("config: players, presets, defaults, errors", () => {
  const c = validateMediaConfig({ entity: "media_player.a", entities: ["media_player.b", { entity: "media_player.a" }, { entity: "media_player.c", name: "Küche" }], presets: ["Ö3", { name: "Ö1", source: "Ö1" }] });
  assert.deepEqual(c.players, ["media_player.a", "media_player.b", "media_player.c"]);
  assert.equal(c.names["media_player.c"], "Küche");
  assert.deepEqual(c.presets[0], { name: "Ö3", media_content_id: "Ö3" });
  assert.equal(c.preset_columns, 2);
  assert.equal(c.show_power, true);
  assert.throws(() => validateMediaConfig({}));
  assert.throws(() => validateMediaConfig({ entity: "light.x" }));
  // incomplete presets (just added in the editor) are skipped, not an error
  assert.equal(validateMediaConfig({ entity: "media_player.a", presets: [{ name: "leer" }, { name: "", media_content_id: "" }, { action: "" }] }).presets.length, 0);
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

test("preset editor mapping: kinds round-trip", () => {
  assert.deepEqual(presetToForm("Ö3"), { kind: "media", name: "Ö3", media_content_id: "Ö3" });
  const media = { name: "Ö3", media_content_id: "Hitradio Ö3", media_content_type: "TUNEIN", icon: "mdi:radio" };
  assert.deepEqual(presetFromForm(presetToForm(media)), media);
  const src = { name: "Ö1", source: "Ö1" };
  assert.deepEqual(presetFromForm(presetToForm(src)), src);
  const act = { name: "Leise", action: "media_player.volume_set", data: { entity_id: "current", volume_level: 0.2 } };
  assert.deepEqual(presetFromForm(presetToForm(act)), act);
  assert.equal(presetToForm({ service: "script.x" }).action, "script.x");
  // switching the kind drops the fields of the old kind
  assert.deepEqual(presetFromForm({ ...presetToForm(media), kind: "source", source: "FM4" }), { name: "Ö3", icon: "mdi:radio", source: "FM4" });
  // schema: source list as dropdown when the player has one
  const names = (sch) => sch.flatMap((x) => (x.schema ? x.schema.map((y) => y.name) : [x.name]));
  assert.ok(names(presetSchema("media", [])).includes("media_content_type"));
  assert.ok(presetSchema("source", ["Ö1"]).find((x) => x.name === "source").selector.select);
  assert.ok(names(presetSchema("action", [])).includes("data"));
});

test("preset pictures: config, styles, editor mapping", () => {
  const c = validateMediaConfig({ entity: "media_player.a", presets: [{ name: "Ö3", media_content_id: "Hitradio Ö3", image: "/local/logos/oe3.png" }, { name: "FM4", source: "FM4", image: "" }] });
  assert.equal(c.presets[0].image, "/local/logos/oe3.png");
  assert.equal(c.presets[1].image, undefined);
  assert.equal(c.preset_style, "logo");
  assert.equal(c.preset_auto_image, true);
  assert.equal(c.preset_show_name, true);
  assert.equal(validateMediaConfig({ entity: "media_player.a", preset_style: "tile", preset_show_name: false }).preset_show_name, false);
  assert.throws(() => validateMediaConfig({ entity: "media_player.a", preset_style: "huge" }));
  assert.throws(() => validateMediaConfig({ entity: "media_player.a", presets: [{ name: "x", media_content_id: "x", image: 'a" onerror="x' }] }));
  assert.equal(presetImageKey(["media_player.a"], { name: "Ö3", media_content_id: "Hitradio Ö3" }), "sgmc-img2:media_player.a:Hitradio Ö3:Ö3");
  // editor: image round-trip, upload replaces the address, removing the upload clears it
  const f = presetToForm({ name: "Ö3", media_content_id: "x", image: "/local/a.png" });
  assert.equal(presetFromForm(f).image, "/local/a.png");
  assert.equal(presetFromForm({ ...f, image_upload: "/api/image/serve/abc/512x512", _image_upload_before: undefined }).image, "/api/image/serve/abc/512x512");
  const up = presetToForm({ name: "Ö3", media_content_id: "x", image: "/api/image/serve/abc/512x512" });
  assert.equal(up.image_upload, "/api/image/serve/abc/512x512");
  assert.equal(presetFromForm({ ...up, image_upload: undefined, _image_upload_before: up.image_upload }).image, undefined);
  // main form: style options
  const form = mediaToForm({ entity: "media_player.a", preset_style: "tile", preset_auto_image: false });
  assert.equal(form.preset_style, "tile");
  const out = mediaFromForm({ entity: "media_player.a" }, { ...form, preset_style: "logo", preset_auto_image: true });
  assert.equal(out.preset_style, undefined);
  assert.equal(out.preset_auto_image, undefined);
});

test("pressed preset stays active while the station plays", () => {
  const pressed = { player: "media_player.a", index: 1, at: 0, idBefore: null };
  const play = (id) => ({ state: "playing", attributes: { media_title: "Some Song", media_content_id: id } });
  assert.equal(pressedPreset(pressed, "media_player.a", { state: "idle", attributes: {} }, 3000), 1, "start-up grace");
  assert.equal(pressedPreset(pressed, "media_player.a", play("s1"), 6000), 1);
  assert.equal(pressed.contentId, "s1");
  assert.equal(pressed.started, true);
  assert.equal(pressedPreset(pressed, "media_player.a", play("s1"), 60000), 1, "songs change, station stays");
  assert.equal(pressedPreset(pressed, "media_player.a", play("other"), 61000), -1, "something else plays");
  assert.equal(pressedPreset(pressed, "media_player.b", play("s1"), 6000), -1, "other player");
  assert.equal(pressedPreset({ ...pressed }, "media_player.a", { state: "idle", attributes: {} }, 31000), -1, "stopped");
  assert.equal(pressedPreset(null, "media_player.a", play("s1"), 1), -1);
});

test("pressed preset waits for slow players (Alexa) to report the new station", () => {
  const old = { state: "playing", attributes: { media_content_id: "old", entity_picture: "/api/media_player_proxy/m?token=AAA&cache=1" } };
  const pressed = { player: "m", index: 0, at: 0, idBefore: "old", artBefore: "/api/media_player_proxy/m?token=AAA&cache=1" };
  // 20 s later still the old station, token rotated – still pending, not finished
  const rotated = { state: "playing", attributes: { media_content_id: "old", entity_picture: "/api/media_player_proxy/m?token=BBB&cache=1" } };
  assert.equal(pressedPreset(pressed, "m", old, 8000), 0);
  assert.equal(pressedPreset(pressed, "m", rotated, 20000), 0);
  assert.equal(pressed.contentId, undefined, "rotating token is no new picture");
  // 45 s: the new station arrives – the press is kept and marked as started
  const fresh = { state: "playing", attributes: { media_content_id: "new", entity_picture: "/api/media_player_proxy/m?token=BBB&cache=2" } };
  assert.equal(pressedPreset(pressed, "m", fresh, 45000), 0);
  assert.equal(pressed.started, true);
  assert.equal(pressed.contentId, "new");
});

test("artKey ignores the access token", () => {
  assert.equal(artKey("/api/p/m?token=A&cache=1"), "/api/p/m?cache=1");
  assert.equal(artKey("/api/p/m?cache=1&token=A"), "/api/p/m?cache=1");
  assert.equal(artKey("/api/p/m?token=A"), "/api/p/m");
  assert.equal(artKey("https://cdn/x.jpg"), "https://cdn/x.jpg");
  assert.equal(artKey(null), null);
});

test("playlists: config, content type, editor mode", () => {
  assert.equal(validateMediaConfig({ entity: "media_player.a" }).playlists, "auto");
  assert.equal(validateMediaConfig({ entity: "media_player.a", playlists: false }).playlists, null);
  const c = validateMediaConfig({ entity: "media_player.a", playlists: ["Rock Hits", { name: "Chill", media_content_id: "spotify:playlist:1" }, { name: "" }] });
  assert.deepEqual(c.playlists.map((p) => p.name), ["Rock Hits", "Chill"]);
  assert.throws(() => validateMediaConfig({ entity: "media_player.a", playlists: "alle" }));
  assert.equal(validateMediaConfig({ entity: "media_player.a" }).show_options_menu, true);
  assert.equal(defaultContentType("alexa_media", "Rock Hits", "playlist"), "AMAZON_MUSIC");
  assert.equal(defaultContentType("music_assistant", "Chill", "playlist"), "playlist");
  assert.equal(defaultContentType("alexa_media", "Ö3"), "TUNEIN");
  assert.equal(presetCall({ media_content_id: "Rock Hits" }, "media_player.e", "alexa_media", "playlist").data.media_content_type, "AMAZON_MUSIC");
  // editor
  assert.equal(mediaToForm({ entity: "media_player.a" }).playlist_mode, "auto");
  assert.equal(mediaToForm({ entity: "media_player.a", playlists: [] }).playlist_mode, "list");
  assert.equal(mediaToForm({ entity: "media_player.a", playlists: false }).playlist_mode, "none");
  const base = { entity: "media_player.a" };
  assert.deepEqual(mediaFromForm(base, { ...mediaToForm(base), playlist_mode: "list" }).playlists, []);
  assert.equal(mediaFromForm(base, { ...mediaToForm(base), playlist_mode: "none" }).playlists, false);
  assert.equal("playlists" in mediaFromForm({ ...base, playlists: ["x"] }, { ...mediaToForm(base), playlist_mode: "auto" }), false);
  assert.deepEqual(mediaFromForm({ ...base, playlists: ["x"] }, { ...mediaToForm({ ...base, playlists: ["x"] }) }).playlists, ["x"]);
});

test("findPlaylists searches the media library", async () => {
  const tree = {
    "": { children: [{ title: "Favoriten", can_expand: true, media_content_id: "favs", media_content_type: "favorites" }, { title: "Musikbibliothek", can_expand: true, media_content_id: "lib", media_content_type: "library" }] },
    favs: { children: [{ title: "Ö1", can_play: true, media_class: "channel", media_content_id: "FV:1", media_content_type: "favorite_item_id" }] },
    lib: { children: [{ title: "Playlists", can_expand: true, media_content_id: "pl", media_content_type: "playlists" }, { title: "Alben", can_expand: true, media_content_id: "al" }] },
    pl: { children: [{ title: "Rock", can_play: true, can_expand: true, media_class: "playlist", media_content_id: "S:1", media_content_type: "playlist", thumbnail: "/t/1" }, { title: "Chill", can_play: true, media_class: "directory", media_content_id: "S:2", media_content_type: "playlist" }] },
  };
  const calls = [];
  const browse = async (args) => {
    calls.push(args.media_content_id || "");
    const n = tree[args.media_content_id || ""];
    if (!n) throw new Error("not found");
    return n;
  };
  const found = await findPlaylists(browse);
  assert.deepEqual(found.map((f) => f.name), ["Rock", "Chill"]);
  assert.equal(found[0].image, "/t/1");
  assert.ok(!calls.includes("al") || calls.length <= 8);
  assert.deepEqual(await findPlaylists(async () => { throw new Error("no browse"); }), []);
  // helpers
  assert.equal(playlistItems(tree.favs).length, 0, "favorites are no playlists");
  assert.equal(playlistItems(tree.favs, true).length, 1, "inside a playlist folder every playable item counts");
  assert.equal(playlistFolders(tree.lib).length, 1);
});

test("pressing Ö3 while Radio Steiermark still plays keeps Ö3 (Alexa reports late)", () => {
  const presets = [{ name: "Radio Steiermark", media_content_id: "Radio Steiermark" }, { name: "Ö3", media_content_id: "Hitradio Ö3" }];
  const steiermark = { state: "playing", attributes: { media_title: "Radio Steiermark", media_content_id: "st", entity_picture: "/p?token=A&cache=st" } };
  const pressed = { player: "m", index: 1, at: 0, idBefore: "st", artBefore: "/p?token=A&cache=st" };
  // 10 s: Alexa still reports Steiermark, which matches preset 0 by name
  let m = activePreset(presets, steiermark);
  assert.equal(m, 0);
  let pi = pressedPreset(pressed, "m", steiermark, 10000);
  assert.deepEqual(currentPreset(m, pi, pressed), { current: 1, dropPressed: false });
  // 40 s: Ö3 arrives (song title only)
  const oe3 = { state: "playing", attributes: { media_title: "Some Song", media_content_id: "oe3", entity_picture: "/p?token=A&cache=oe3" } };
  m = activePreset(presets, oe3);
  pi = pressedPreset(pressed, "m", oe3, 40000);
  assert.equal(pressed.started, true);
  assert.deepEqual(currentPreset(m, pi, pressed), { current: 1, dropPressed: false });
  // later the user switches to Steiermark by voice: recognised by name, press dropped
  pi = pressedPreset(pressed, "m", steiermark, 90000);
  assert.deepEqual(currentPreset(activePreset(presets, steiermark), pi, pressed), { current: 0, dropPressed: true });
  assert.deepEqual(currentPreset(0, -1, null), { current: 0, dropPressed: false });
});

test("short station names match as a whole word", () => {
  const presets = [{ name: "Ö3", media_content_id: "x" }, { name: "Ö1", media_content_id: "y" }];
  assert.equal(activePreset(presets, { state: "playing", attributes: { media_title: "Hitradio Ö3 – live" } }), 0);
  assert.equal(activePreset(presets, { state: "playing", attributes: { media_title: "BÖ3X" } }), -1);
});

test("preset style image", () => {
  assert.equal(validateMediaConfig({ entity: "media_player.a", preset_style: "image" }).preset_style, "image");
  assert.equal(mediaFromForm({ entity: "media_player.a" }, { ...mediaToForm({ entity: "media_player.a" }), preset_style: "image" }).preset_style, "image");
});
