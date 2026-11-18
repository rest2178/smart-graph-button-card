import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLevels, findLevel, ringFraction, overallRating, LEVEL_PRESETS } from "../src/levels.js";

test("presets per device class", () => {
  const t = resolveLevels("auto", "temperature");
  assert.equal(findLevel(12.8, t).label, "Zu kalt");
  assert.equal(findLevel(16.1, t).label, "Eher kühl");
  assert.equal(findLevel(21.5, t).label, "Optimal");
  assert.equal(findLevel(28.3, t).label, "Zu warm");
  const h = resolveLevels(undefined, "humidity");
  assert.equal(findLevel(28, h).label, "Zu trocken");
  assert.equal(findLevel(45, h).label, "Optimal");
  assert.equal(findLevel(72, h).label, "Zu feucht");
  const co2 = resolveLevels("auto", "carbon_dioxide");
  assert.deepEqual([580, 950, 1450].map((v) => findLevel(v, co2).label), ["Gut", "Erhöht", "Kritisch"]);
  const pm = resolveLevels("auto", "pm25");
  assert.deepEqual([3, 18, 35].map((v) => findLevel(v, pm).label), ["Sehr gut", "Erhöht", "Schlecht"]);
  assert.equal(resolveLevels("auto", "power"), null);
  assert.equal(resolveLevels(false, "temperature"), null);
  assert.ok(LEVEL_PRESETS.temperature.length > 3);
});

test("custom levels: sorted, value-less base level, severity guess", () => {
  const l = resolveLevels([{ value: 25, label: "Warm", color: "red" }, { label: "Kalt", color: "#3b82f6" }, { value: 15, label: "Gut", color: "green" }]);
  assert.deepEqual(l.map((x) => x.label), ["Kalt", "Gut", "Warm"]);
  assert.equal(findLevel(10, l).label, "Kalt");
  assert.equal(findLevel(15, l).label, "Gut");
  assert.equal(findLevel(30, l).label, "Warm");
  assert.equal(l[2].severity, 2);
  assert.equal(l[1].severity, 0);
  assert.equal(findLevel("abc", l), null);
});

test("ring fraction and overall rating", () => {
  assert.equal(ringFraction(20, "temperature"), 0.5);
  assert.equal(ringFraction(500, "humidity"), 1);
  assert.equal(ringFraction(5, "x", [0, 10]), 0.5);
  const t = resolveLevels("auto", "temperature");
  const co2 = resolveLevels("auto", "carbon_dioxide");
  assert.equal(overallRating([findLevel(16.1, t), findLevel(580, co2)]).label, "Gut");
  assert.equal(overallRating([findLevel(16.1, t), findLevel(950, co2)]).label, "Mäßig");
  assert.equal(overallRating([findLevel(1450, co2)]).label, "Schlecht");
  assert.equal(overallRating([null]), null);
});
