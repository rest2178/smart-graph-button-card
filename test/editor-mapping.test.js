import { test } from "node:test";
import assert from "node:assert/strict";
import { configToForm, formToConfig } from "../src/smart-graph-button-card-editor.js";

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
    color_on: "#22c55e",
  });
  assert.deepEqual(out.value_2, { type: "state", entity: "sensor.p", decimals: 2, unit: "W" });
  assert.equal(out.graph.type, "area");
  assert.equal(out.icon_area.color.on, "#22c55e");
});

test("editor removes cleared values and empty color maps", () => {
  const out = formToConfig({ entity: "switch.a", value_1: { type: "state" }, icon_area: { color: { on: "red" } } }, { entity: "switch.a", value_1_enabled: false, color_on: "" });
  assert.equal(out.value_1, undefined);
  assert.equal(out.icon_area?.color, undefined);
});
