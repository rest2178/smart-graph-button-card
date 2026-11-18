import { test } from "node:test";
import assert from "node:assert/strict";
import { validateOverviewConfig, timeTicks, overviewToForm, overviewFromForm } from "../src/overview-card.js";

test("overview config: defaults and errors", () => {
  const c = validateOverviewConfig({ entities: ["sensor.t", { entity: "sensor.co2", name: "CO₂" }] });
  assert.equal(c.title, "Luftqualität");
  assert.equal(c.graph_entity, "sensor.t");
  assert.equal(c.hours_to_show, 24);
  assert.equal(c.entities[1].name, "CO₂");
  assert.throws(() => validateOverviewConfig({ entities: [] }));
  assert.throws(() => validateOverviewConfig({ entities: ["bad id"] }));
  assert.throws(() => validateOverviewConfig({ entities: ["sensor.t"], graph_entity: "sensor.x" }));
});

test("time ticks are aligned to full hours", () => {
  const end = new Date(2026, 10, 18, 10, 37).getTime();
  const ticks = timeTicks(end - 24 * 3600e3, end, 6);
  assert.ok(ticks.length >= 5 && ticks.length <= 7);
  for (const t of ticks) {
    const d = new Date(t);
    assert.equal(d.getMinutes(), 0);
    assert.equal(d.getHours() % 4, 0);
  }
});

test("overview editor keeps entity objects", () => {
  const cfg = { type: "custom:smart-graph-overview-card", entities: ["sensor.t", { entity: "sensor.co2", name: "CO₂" }] };
  const form = overviewToForm(cfg);
  assert.deepEqual(form.entities, ["sensor.t", "sensor.co2"]);
  const out = overviewFromForm(cfg, { ...form, entities: ["sensor.co2", "sensor.h"], show_graph: false });
  assert.deepEqual(out.entities, [{ entity: "sensor.co2", name: "CO₂" }, "sensor.h"]);
  assert.equal(out.show_graph, false);
});
