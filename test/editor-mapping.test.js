import { test } from "node:test";
import assert from "node:assert/strict";
import { configToForm, formToConfig, setPath, pruneEmpty } from "../src/smart-graph-button-card-editor.js";

test("editor round-trip keeps unmanaged keys", () => {
  const cfg = {
    type: "custom:smart-graph-button-card",
    entity: "switch.a",
    thresholds: { ranges: [{ from: 0, color: "red" }] },
    graph: { entity: "sensor.p", type: "bar", max_points: 30 },
  };
  const out = formToConfig(cfg, configToForm(cfg));
  assert.deepEqual(out.thresholds, cfg.thresholds);
  assert.equal(out.graph.max_points, 30);
  assert.equal(out.graph.enabled, true);
});

test("editor enables value 2 and graph", () => {
  const out = formToConfig({ entity: "switch.a" }, {
    entity: "switch.a", value_2_enabled: true, value_2_entity: "sensor.p", value_2_decimals: 2, value_2_unit: "W",
    graph_enabled: true, graph_entity: "sensor.p", graph_type: "area", graph_position: "bottom", graph_hours_to_show: 12,
  });
  assert.deepEqual(out.value_2, { type: "state", entity: "sensor.p", decimals: 2, unit: "W" });
  assert.equal(out.graph.type, "area");
});

test("editor removes cleared values", () => {
  const out = formToConfig({ entity: "switch.a", value_1: { type: "state" } }, { entity: "switch.a", value_1_enabled: false });
  assert.equal(out.value_1, undefined);
});

test("custom color fields: setPath + pruneEmpty remove empty color maps", () => {
  const cfg = { entity: "switch.a", icon_area: { color: { on: "red" } } };
  setPath(cfg, "icon_area.color.on", "");
  pruneEmpty(cfg, "icon_area.color.on");
  assert.equal(cfg.icon_area, undefined);
});

test("choosing color mode 'thresholds' pre-fills an editable list (per-point)", () => {
  const cfg = { entity: "switch.a", graph: { entity: "sensor.p" } };
  const out = formToConfig(cfg, { ...configToForm(cfg), graph_color_mode: "thresholds" });
  assert.equal(out.graph.color_mode, "thresholds");
  assert.equal(out.graph.threshold_mode, "per-point");
  assert.deepEqual(out.graph.thresholds.map((t) => t.value), [10, 50, 100, 200]);
  // existing lists of any length are kept
  const many = { entity: "switch.a", graph: { color_mode: "thresholds", thresholds: Array.from({ length: 9 }, (_, i) => ({ value: i * 10, color: "#000" })) } };
  assert.equal(formToConfig(many, configToForm(many)).graph.thresholds.length, 9);
});

test("graph stays disabled when only the color mode changes", () => {
  const cfg = { entity: "switch.a" };
  const out = formToConfig(cfg, { ...configToForm(cfg), graph_color_mode: "fixed" });
  assert.equal(out.graph, undefined);
  const off = { entity: "switch.a", graph: { enabled: false } };
  assert.equal(formToConfig(off, { ...configToForm(off), graph_color_mode: "fixed" }).graph.enabled, false);
});

test("editor fade sliders map to graph.fade_start / fade_end without rewriting unchanged values", () => {
  const cfg = { entity: "switch.a", graph: { entity: "sensor.p", fade: 20 } };
  const form = configToForm(cfg);
  assert.equal(form.graph_fade_start, 20);
  assert.equal(form.graph_fade_end, 20);
  const same = formToConfig(cfg, form);
  assert.equal(same.graph.fade_start, undefined, "unchanged value not written");
  const changed = formToConfig(cfg, { ...form, graph_fade_end: 0 });
  assert.equal(changed.graph.fade_end, 0);
});

test("editor: info card graph enabled by default, can be switched off", () => {
  const cfg = { type: "custom:smart-graph-info-card", entity: "sensor.t" };
  const form = configToForm(cfg);
  assert.equal(form.graph_enabled, true);
  assert.equal(form.graph_type, "smooth-area");
  const off = formToConfig(cfg, { ...form, graph_enabled: false });
  assert.equal(off.graph.enabled, false);
  assert.equal(off.variant, undefined, "info card element needs no variant key");
  const btn = formToConfig({ entity: "sensor.t" }, { ...configToForm({ entity: "sensor.t" }), variant: "info" });
  assert.equal(btn.variant, "info");
});

test("editor: show_name toggle and threshold blend", () => {
  const cfg = { entity: "sensor.t", graph: { color_mode: "thresholds", threshold_mode: "vertical", thresholds: [{ value: 15, color: "yellow" }] } };
  const form = configToForm(cfg);
  assert.equal(form.show_name, true);
  assert.equal(form.graph_threshold_blend, "hard");
  const out = formToConfig(cfg, { ...form, show_name: false, graph_threshold_blend: "smooth" });
  assert.equal(out.show_name, false);
  assert.equal(out.graph.threshold_blend, "smooth");
  assert.equal(formToConfig(out, { ...configToForm(out), show_name: true }).show_name, undefined);
});

test("editor: value_position only written when not default", () => {
  const cfg = { type: "custom:smart-graph-info-card", entity: "sensor.t" };
  const form = configToForm(cfg);
  assert.equal(form.value_position, "top-left");
  assert.equal(formToConfig(cfg, form).value_position, undefined);
  const moved = formToConfig(cfg, { ...form, value_position: "bottom-right" });
  assert.equal(moved.value_position, "bottom-right");
  assert.equal(formToConfig(moved, { ...configToForm(moved), value_position: "top-left" }).value_position, undefined);
});

test("editor: value offset sliders", () => {
  const cfg = { type: "custom:smart-graph-info-card", entity: "sensor.t" };
  const form = configToForm(cfg);
  assert.equal(form.value_offset_x, 0);
  const out = formToConfig(cfg, { ...form, value_offset_y: -6 });
  assert.deepEqual(out.value_offset, { y: -6 });
  const back = formToConfig(out, { ...configToForm(out), value_offset_y: 0 });
  assert.equal(back.value_offset, undefined);
});

test("editor: icon position and offset", () => {
  const cfg = { type: "custom:smart-graph-info-card", entity: "sensor.t" };
  const form = configToForm(cfg);
  assert.equal(form.icon_position, "name-left");
  const out = formToConfig(cfg, { ...form, icon_position: "top-right", icon_offset_x: 4 });
  assert.equal(out.icon_position, "top-right");
  assert.deepEqual(out.icon_offset, { x: 4 });
  assert.equal(formToConfig(out, { ...configToForm(out), icon_position: "name-left" }).icon_position, undefined);
});

test("text_contrast toggle maps to text_contrast: off and back", () => {
  const base = { type: "custom:smart-graph-button-card", entity: "sensor.x" };
  assert.equal(configToForm(base).text_contrast_auto, true);
  const off = formToConfig(base, { ...configToForm(base), text_contrast_auto: false });
  assert.equal(off.text_contrast, "off");
  assert.equal(configToForm(off).text_contrast_auto, false);
  const on = formToConfig(off, { ...configToForm(off), text_contrast_auto: true });
  assert.equal(on.text_contrast, undefined);
});

test("design: switching keeps entities and drops design-provided keys", () => {
  const cfg = { type: "custom:smart-graph-button-card", entity: "switch.desk", graph: { entity: "sensor.p", type: "line", position: "full", enabled: false } };
  const form = { ...configToForm(cfg), design: "subtle" };
  const out = formToConfig(cfg, form);
  assert.equal(out.design, "subtle");
  assert.deepEqual(out.graph, { entity: "sensor.p" });
});

test("design: form defaults reflect the design and do not write values", () => {
  const cfg = { type: "custom:smart-graph-button-card", entity: "switch.desk", design: "badge", graph: { entity: "sensor.p" } };
  const form = configToForm(cfg);
  assert.equal(form.hero_enabled, true);
  assert.equal(form.value_2_enabled, true);
  assert.equal(form.state_background_enabled, true);
  assert.equal(form.graph_type, "smooth-area");
  const out = formToConfig(cfg, form);
  assert.equal(out.value_1, undefined);
  assert.equal(out.value_2, undefined);
  assert.equal(out.hero, undefined);
  assert.equal(out.state_background, undefined);
  assert.equal(out.graph.enabled, true);
});

test("design: panel form defaults", () => {
  const cfg = { type: "custom:smart-graph-button-card", entity: "switch.desk", design: "panel", graph: { entity: "sensor.p" } };
  const form = configToForm(cfg);
  assert.equal(form.hero_enabled, true);
  assert.equal(form.value_2_enabled, false);
  assert.equal(form.graph_type, "line");
  assert.equal(form.graph_position, "right");
  const out = formToConfig(cfg, form);
  assert.equal(out.value_2, false);
  assert.equal(out.hero, undefined);
});

test("design: hero off, caption and tint off are stored", () => {
  const cfg = { type: "custom:smart-graph-button-card", entity: "switch.desk", design: "subtle" };
  const out = formToConfig(cfg, { ...configToForm(cfg), hero_caption: "jetzt", state_background_enabled: false });
  assert.deepEqual(out.hero, { caption: "jetzt" });
  assert.equal(out.state_background.enabled, false);
  const off = formToConfig(out, { ...configToForm(out), hero_enabled: false });
  assert.equal(off.hero, false);
});

test("design: double height toggle", () => {
  const cfg = { type: "custom:smart-graph-button-card", entity: "switch.desk", design: "split", layout: { height: "70px" } };
  const form = configToForm(cfg);
  assert.equal(form.design_double, false);
  const out = formToConfig(cfg, { ...form, design_double: true });
  assert.equal(out.design_size, "double");
  assert.equal(out.layout, undefined);
  const back = formToConfig(out, { ...configToForm(out), design_double: false });
  assert.equal(back.design_size, undefined);
  const std = formToConfig(out, { ...configToForm(out), design: "standard" });
  assert.equal(std.design_size, undefined);
});

test("info designs in the editor", () => {
  const cfg = { type: "custom:smart-graph-info-card", entity: "sensor.t", graph: { type: "line", position: "full" } };
  const out = formToConfig(cfg, { ...configToForm(cfg), design: "compact" });
  assert.equal(out.design, "compact");
  assert.equal(out.graph, undefined);
  const form = configToForm(out);
  assert.equal(form.show_name, false);
  assert.equal(form.levels_enabled, true);
  assert.equal(form.state_background_enabled, true);
  const named = formToConfig(out, { ...form, show_name: true, levels_enabled: false });
  assert.equal(named.show_name, true);
  assert.equal(named.levels, false);
  // button → info drops the button design
  const btn = { type: "custom:smart-graph-button-card", entity: "switch.a", design: "subtle" };
  const info = formToConfig(btn, { ...configToForm(btn), variant: "info" });
  assert.equal(info.variant, "info");
  assert.equal(info.design, undefined);
});

test("icon color source: light is stored, fixed removes it", () => {
  const cfg = { type: "custom:smart-graph-button-card", entity: "light.wled" };
  const form = configToForm(cfg);
  assert.equal(form.icon_color_source, "fixed");
  const out = formToConfig(cfg, { ...form, icon_color_source: "light" });
  assert.equal(out.icon_area.color_source, "light");
  const back = formToConfig(out, { ...configToForm(out), icon_color_source: "fixed" });
  assert.equal(back.icon_area, undefined);
});
