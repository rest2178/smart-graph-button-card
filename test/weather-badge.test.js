import { test } from "node:test";
import assert from "node:assert/strict";
import { validateWeatherConfig, forecastType, forecastPoints, infoText, conditionInfo, weatherToForm, weatherFromForm } from "../src/weather-badge.js";

test("config defaults and errors", () => {
  const c = validateWeatherConfig({ entity: "weather.home" });
  assert.equal(c.info, "condition");
  assert.equal(c.forecast, "auto");
  assert.equal(c.decimals, 0);
  assert.equal(c.show_icon, true);
  assert.equal(c.show_name, false);
  assert.equal(validateWeatherConfig({ entity: "weather.home", forecast: false }).forecast, "none");
  assert.throws(() => validateWeatherConfig({ entity: "sensor.t" }));
  assert.throws(() => validateWeatherConfig({ entity: "weather.home", info: "uv" }));
  assert.throws(() => validateWeatherConfig({ entity: "weather.home", decimals: 5 }));
});

test("forecast type from supported features", () => {
  assert.equal(forecastType("auto", 3), "hourly");
  assert.equal(forecastType("auto", 1), "daily");
  assert.equal(forecastType("auto", 0), null);
  assert.equal(forecastType("hourly", 1), null);
  assert.equal(forecastType("daily", 3), "daily");
  assert.equal(forecastType("none", 3), null);
});

test("forecast points: future only, 24 hours or 7 days", () => {
  const now = Date.parse("2026-11-20T12:00:00Z");
  const hourly = Array.from({ length: 48 }, (_, i) => ({ datetime: new Date(now + (i - 2) * 3600e3).toISOString(), temperature: i }));
  const pts = forecastPoints(hourly, "hourly", now);
  assert.equal(pts.length, 24);
  assert.equal(pts[0].v, 1, "one hour back is still shown, older entries dropped");
  assert.equal(forecastPoints(hourly, "daily", now).length, 7);
  assert.deepEqual(forecastPoints(null, "hourly", now), []);
});

test("info text and conditions", () => {
  const s = { state: "sunny", attributes: { humidity: 62, wind_speed: 12.4, wind_speed_unit: "km/h" } };
  assert.equal(infoText("condition", s, { conditionLabel: "Sonnig" }), "Sonnig");
  assert.equal(infoText("humidity", s, { locale: "de" }), "62 %");
  assert.equal(infoText("wind", s, { locale: "de" }), "12 km/h");
  assert.equal(infoText("high_low", s, { daily: [{ temperature: 18.4, templow: 8.6 }], locale: "de" }), "18° / 9°");
  assert.equal(infoText("high_low", s, { daily: null }), "");
  assert.equal(infoText("none", s), "");
  assert.equal(conditionInfo("rainy").icon, "mdi:weather-rainy");
  assert.equal(conditionInfo("whatever").icon, "mdi:weather-cloudy-alert");
});

test("editor mapping", () => {
  const cfg = { type: "custom:smart-graph-weather-badge", entity: "weather.home" };
  const form = weatherToForm(cfg);
  assert.equal(form.info, "condition");
  const out = weatherFromForm(cfg, { ...form, info: "high_low", show_name: true, forecast: "daily" });
  assert.equal(out.info, "high_low");
  assert.equal(out.show_name, true);
  assert.equal(out.forecast, "daily");
  const back = weatherFromForm(out, { ...weatherToForm(out), info: "condition", show_name: false, forecast: "auto" });
  assert.equal(back.info, undefined);
  assert.equal(back.show_name, undefined);
  assert.equal(back.forecast, undefined);
});
