import { test } from "node:test";
import assert from "node:assert/strict";
import { validateConfig, ConfigError, DEFAULTS } from "../src/config-validator.js";

const base = { type: "custom:smart-graph-button-card", entity: "switch.schreibtisch_1" };
const throwsWith = (cfg, re) => assert.throws(() => validateConfig(cfg), (e) => e instanceof ConfigError && re.test(e.message));

test("minimal config is valid and populated with defaults", () => {
  const c = validateConfig(base);
  assert.equal(c.graph.enabled, false);
  assert.equal(c.tap_action.action, "toggle");
  assert.equal(c.hold_action.action, "more-info");
  assert.equal(c.layout.height, "64px");
});

test("sensor default tap action is more-info", () => {
  assert.equal(validateConfig({ entity: "sensor.x" }).tap_action.action, "more-info");
});

test("missing entity", () => throwsWith({ type: "x" }, /entity.*fehlt/));
test("invalid entity id", () => throwsWith({ entity: "Schreibtisch" }, /keine gültige Entity-ID/));
test("invalid graph type", () => throwsWith({ ...base, graph: { type: "pie" } }, /graph\.type/));
test("hours_to_show <= 0", () => throwsWith({ ...base, graph: { hours_to_show: 0 } }, /hours_to_show muss größer als 0/));
test("unknown position", () => throwsWith({ ...base, graph: { position: "top" } }, /graph\.position .*unbekannt/));
test("invalid thresholds", () => throwsWith({ ...base, graph: { color_mode: "thresholds", thresholds: [{ value: "x", color: "red" }] } }, /thresholds\[0\]\.value/));
test("thresholds required for color_mode thresholds", () => throwsWith({ ...base, graph: { color_mode: "thresholds" } }, /graph\.thresholds wird/));
test("invalid range min >= max", () => throwsWith({ ...base, graph: { min: 10, max: 5 } }, /Zahlenbereich/));
test("from >= to", () => throwsWith({ ...base, thresholds: { ranges: [{ from: 10, to: 5, color: "red" }] } }, /muss kleiner als/));
test("invalid regex", () => throwsWith({ ...base, states: [{ operator: "regex", value: "([", color: "red" }] }, /regulärer Ausdruck/));
test("invalid action", () => throwsWith({ ...base, tap_action: { action: "explode" } }, /tap_action\.action/));
test("navigate without path", () => throwsWith({ ...base, tap_action: { action: "navigate" } }, /navigation_path/));
test("several errors are reported together", () => {
  assert.throws(() => validateConfig({ ...base, graph: { type: "pie", position: "top" } }), (e) => e.errors.length === 2);
});

test("graph defaults to main entity and update_interval is clamped to >= 10 s", () => {
  const c = validateConfig({ entity: "sensor.p", graph: { update_interval: 1 } });
  assert.equal(c.graph.enabled, true);
  assert.equal(c.graph.entity, "sensor.p");
  assert.equal(c.graph.update_interval, 10);
});

test("numbers become px lengths; values normalised", () => {
  const c = validateConfig({ ...base, layout: { height: 56 }, value_2: { entity: "sensor.p", decimals: "2" } });
  assert.equal(c.layout.height, "56px");
  assert.equal(c.value_2.decimals, 2);
  assert.equal(c.value_2.fallback, "–");
});

test("defaults are never mutated", () => {
  validateConfig({ ...base, graph: { enabled: true, entity: "sensor.p" }, icon_area: false });
  assert.equal(DEFAULTS.graph.enabled, false);
  assert.equal(DEFAULTS.icon_area.enabled, true);
});

test("all spec examples validate", async () => {
  const { readFileSync, readdirSync } = await import("node:fs");
  const { parseSimpleYaml } = await import("./yaml-lite.js");
  const dir = new URL("../examples/", import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".yaml"))) {
    const docs = readFileSync(new URL(file, dir), "utf8").split(/^---$/m).filter((d) => d.trim());
    for (const doc of docs) {
      const cfg = parseSimpleYaml(doc);
      assert.doesNotThrow(() => validateConfig(cfg), `${file}`);
    }
  }
});
