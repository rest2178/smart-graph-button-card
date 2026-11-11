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
