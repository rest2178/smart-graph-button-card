import { test } from "node:test";
import assert from "node:assert/strict";
import { formatNumber, renderTemplate, resolveValue, formatDuration, formatRelative } from "../src/value-formatter.js";
import { parseNumber, isDisplayable } from "../src/utils.js";

const hassDe = (states, extra = {}) => ({ locale: { language: "de" }, language: "de", states, ...extra });

test("parseNumber rejects invalid numbers", () => {
  for (const v of ["abc", "", " ", "unavailable", "unknown", null, undefined, NaN, Infinity, -Infinity, "Infinity", "NaN", "1,5", true, {}, []]) {
    assert.equal(parseNumber(v), null, `value ${String(v)}`);
  }
  assert.equal(parseNumber("7.5"), 7.5);
  assert.equal(parseNumber(" -3 "), -3);
  assert.equal(parseNumber("1e3"), 1000);
});

test("number formatting with decimals (de locale)", () => {
  assert.equal(formatNumber(7.5, { decimals: 2, locale: "de" }), "7,50");
  assert.equal(formatNumber("1234.567", { decimals: 1, locale: "de" }), "1.234,6");
  assert.equal(formatNumber(3, { decimals: 0, locale: "en-US" }), "3");
  assert.equal(formatNumber(-0.001, { decimals: 2, locale: "de" }), "0,00", "no negative zero");
  assert.equal(formatNumber("abc", { decimals: 2 }), null);
  assert.equal(formatNumber(Infinity), null);
});

test("duration and relative time", () => {
  assert.equal(formatDuration(3725), "1:02:05");
  assert.equal(formatDuration(65), "1:05");
  assert.equal(formatDuration("x"), null);
  const now = Date.parse("2026-01-01T12:00:00Z");
  assert.match(formatRelative("2026-01-01T11:55:00Z", "en", now), /5 minutes ago/);
  assert.equal(formatRelative("not a date", "en", now), null);
});

test("template: only placeholders, never code", () => {
  assert.equal(renderTemplate("{value} {unit}", { value: "7,50", unit: "W" }), "7,50 W");
  assert.equal(renderTemplate("{missing}|{value}", { value: undefined }), "|");
  assert.equal(renderTemplate("{constructor} {__proto__}", {}), " ");
  assert.equal(renderTemplate("${alert(1)}", {}), "${alert(1)}");
});

test("value: state with decimals and unit", () => {
  const hass = hassDe({ "sensor.p": { state: "7.5", attributes: { unit_of_measurement: "W" } } });
  const r = resolveValue({ entity: "sensor.p", type: "state", decimals: 2, unit: "W", use_entity_unit: false }, hass);
  assert.equal(r.text, "7,50 W");
  assert.equal(r.numeric, 7.5);
});

test("value: entity unit used when no unit configured", () => {
  const hass = hassDe({ "sensor.t": { state: "21.456", attributes: { unit_of_measurement: "°C" } } });
  assert.equal(resolveValue({ entity: "sensor.t", decimals: 1 }, hass).text, "21,5 °C");
});

test("value: state mapping case-insensitive", () => {
  const hass = hassDe({ "switch.a": { state: "on", attributes: {} } });
  const cfg = { entity: "switch.a", state_mapping: { ON: "Ein", off: "Aus" } };
  assert.equal(resolveValue(cfg, hass).text, "Ein");
});

test("value: missing entity -> fallback, never undefined/NaN", () => {
  const r = resolveValue({ entity: "sensor.nope", decimals: 2, unit: "W", fallback: "–" }, hassDe({}));
  assert.equal(r.text, "–");
  assert.ok(isDisplayable(r.text));
});

test("value: non-numeric/invalid values fall back", () => {
  const hass = hassDe({ "sensor.x": { state: "NaN", attributes: {} }, "sensor.y": { state: "", attributes: {} } });
  assert.equal(resolveValue({ entity: "sensor.x", fallback: "n/a" }, hass).text, "n/a");
  assert.equal(resolveValue({ entity: "sensor.y", fallback: "n/a" }, hass).text, "n/a");
});

test("value: unavailable uses configured text or hides", () => {
  const hass = hassDe({ "sensor.p": { state: "unavailable", attributes: {} } });
  assert.equal(resolveValue({ entity: "sensor.p", unavailable_text: "Nicht verfügbar" }, hass).text, "Nicht verfügbar");
  assert.equal(resolveValue({ entity: "sensor.p", hide_if_unavailable: true }, hass).hidden, true);
  const native = hassDe({ "sensor.p": { state: "unknown", attributes: {} } }, { formatEntityState: () => "Unbekannt" });
  assert.equal(resolveValue({ entity: "sensor.p" }, native).text, "Unbekannt");
});

test("value: attribute, text, name, template, prefix/suffix, thresholds", () => {
  const hass = hassDe({
    "climate.x": { state: "heat", attributes: { friendly_name: "Bad", current_temperature: 20.25 } },
  });
  assert.equal(resolveValue({ entity: "climate.x", type: "attribute", attribute: "current_temperature", decimals: 1, unit: "°C" }, hass).text, "20,3 °C");
  assert.equal(resolveValue({ type: "text", text: "Hallo" }, hass).text, "Hallo");
  assert.equal(resolveValue({ entity: "climate.x", type: "name" }, hass).text, "Bad");
  assert.equal(resolveValue({ entity: "climate.x", template: "{name}: {attr:current_temperature}" }, hass).text, "Bad: 20.25");
  assert.equal(resolveValue({ entity: "climate.x", type: "attribute", attribute: "current_temperature", decimals: 0, prefix: "≈", suffix: "!" }, hass).text, "≈20!");
  const r = resolveValue({ entity: "climate.x", type: "attribute", attribute: "current_temperature", thresholds: [{ value: 0, color: "blue" }, { value: 20, color: "red" }] }, hass);
  assert.equal(r.color, "red");
});

test("paddingSide picks the left/right part of a padding shorthand", async () => {
  const { paddingSide } = await import("../src/utils.js");
  assert.equal(paddingSide("8px 12px", "left"), "12px");
  assert.equal(paddingSide("8px", "left"), "8px");
  assert.equal(paddingSide("1px 2px 3px 4px", "left"), "4px");
  assert.equal(paddingSide("1px 2px 3px 4px", "right"), "2px");
  assert.equal(paddingSide("var(--pad)", "left"), "var(--pad)");
});
