import { test } from "node:test";
import assert from "node:assert/strict";
import { parseColor, toHex, applyPickedColor, lightColor } from "../src/color-utils.js";

test("parse hex and rgb(a) colors", () => {
  assert.deepEqual(parseColor("#22c55e"), { r: 34, g: 197, b: 94, a: 1 });
  assert.deepEqual(parseColor("#fff"), { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual(parseColor("rgba(34, 197, 94, 0.15)"), { r: 34, g: 197, b: 94, a: 0.15 });
  assert.deepEqual(parseColor("rgb(10 20 30 / 50%)"), { r: 10, g: 20, b: 30, a: 0.5 });
  assert.equal(parseColor("var(--primary-color)"), null);
  assert.equal(parseColor(""), null);
});

test("hex output for the native picker", () => {
  assert.equal(toHex({ r: 34, g: 197, b: 94 }), "#22c55e");
});

test("picked color keeps an existing transparency", () => {
  assert.equal(applyPickedColor("#000000", "#ef4444"), "#ef4444");
  assert.equal(applyPickedColor("", "#ef4444"), "#ef4444");
  assert.equal(applyPickedColor("rgba(34, 197, 94, 0.15)", "#ef4444"), "rgba(239, 68, 68, 0.15)");
  assert.equal(applyPickedColor("var(--x)", "#ef4444"), "#ef4444");
});

test("lightColor: rgb, hs, color temperature, off", () => {
  assert.deepEqual(lightColor({ state: "on", attributes: { rgb_color: [255, 80, 0] } }), { r: 255, g: 80, b: 0, a: 1 });
  assert.deepEqual(lightColor({ state: "on", attributes: { hs_color: [240, 100] } }), { r: 0, g: 0, b: 255, a: 1 });
  const warm = lightColor({ state: "on", attributes: { color_temp_kelvin: 2700 } });
  assert.ok(warm.r === 255 && warm.b < warm.g, "warm white is orange-ish");
  assert.ok(lightColor({ state: "on", attributes: { color_temp: 370 } }));
  assert.equal(lightColor({ state: "off", attributes: { rgb_color: [255, 0, 0] } }), null);
  assert.equal(lightColor({ state: "on", attributes: { brightness: 200 } }), null);
  assert.equal(lightColor(undefined), null);
});
