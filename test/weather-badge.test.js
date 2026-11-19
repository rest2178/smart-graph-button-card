import { test } from "node:test";
import assert from "node:assert/strict";
import { validateWeatherConfig, forecastType, forecastPoints, infoText, conditionInfo, weatherToForm, weatherFromForm, extraValue } from "../src/weather-badge.js";

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

test("extras: config, weather attributes, forecast, own sensors", () => {
  const c = validateWeatherConfig({ entity: "weather.home", extras: ["humidity", "precipitation", { entity: "sensor.rain_today", icon: "mdi:water" }] });
  assert.deepEqual(c.extras[0], { key: "humidity" });
  assert.equal(c.extras[2].entity, "sensor.rain_today");
  assert.deepEqual(validateWeatherConfig({ entity: "weather.home" }).extras, []);
  assert.throws(() => validateWeatherConfig({ entity: "weather.home", extras: ["pollen"] }));
  assert.throws(() => validateWeatherConfig({ entity: "weather.home", extras: [{ entity: "kein entity" }] }));

  const now = Date.parse("2026-11-20T12:00:00Z");
  const s = { state: "rainy", attributes: { humidity: 81, wind_speed: 17.6, wind_speed_unit: "km/h", pressure: 1012.4, pressure_unit: "hPa", uv_index: 2, precipitation_unit: "mm", apparent_temperature: 5.4 } };
  const ctx = { locale: "de", now };
  assert.deepEqual(extraValue({ key: "humidity" }, s, ctx), { icon: "mdi:water-percent", text: "81 %", label: "Luftfeuchtigkeit" });
  assert.equal(extraValue({ key: "wind" }, s, ctx).text, "18 km/h");
  assert.equal(extraValue({ key: "pressure" }, s, ctx).text, "1.012 hPa");
  assert.equal(extraValue({ key: "uv_index" }, s, ctx).text, "UV 2");
  assert.equal(extraValue({ key: "apparent_temperature" }, s, ctx).text, "5°");
  assert.equal(extraValue({ key: "visibility" }, s, ctx), null, "missing attribute → hidden");
  // precipitation: daily forecast first, else the sum of the next 24 hours
  assert.equal(extraValue({ key: "precipitation" }, s, { ...ctx, daily: [{ precipitation: 4.2, precipitation_probability: 70 }] }).text, "4,2 mm");
  const hourly = Array.from({ length: 30 }, (_, i) => ({ datetime: new Date(now + i * 3600e3).toISOString(), precipitation: i < 4 ? 0.5 : 0, precipitation_probability: i === 2 ? 60 : 10 }));
  assert.equal(extraValue({ key: "precipitation" }, s, { ...ctx, hourly }).text, "2 mm");
  assert.equal(extraValue({ key: "precipitation_probability" }, s, { ...ctx, hourly }).text, "60 %");
  assert.equal(extraValue({ key: "precipitation" }, s, ctx), null, "no forecast yet");
  // own sensor
  const states = { "sensor.rain_today": { state: "3.25", attributes: { unit_of_measurement: "mm", device_class: "precipitation", friendly_name: "Regen heute" } } };
  assert.deepEqual(extraValue({ entity: "sensor.rain_today" }, s, { ...ctx, states }), { icon: "mdi:weather-pouring", text: "3,3 mm", label: "Regen heute" });
  assert.equal(extraValue({ entity: "sensor.rain_today", decimals: 2, name: "Regen" }, s, { ...ctx, states }).text, "3,25 mm");
  assert.equal(extraValue({ entity: "sensor.gone" }, s, { ...ctx, states }), null);
});

test("extras editor mapping keeps sensor objects", () => {
  const cfg = { entity: "weather.home", extras: ["humidity", { entity: "sensor.rain_today", icon: "mdi:water" }] };
  const form = weatherToForm(cfg);
  assert.deepEqual(form.extras, ["humidity"]);
  assert.deepEqual(form.extra_entities, ["sensor.rain_today"]);
  const out = weatherFromForm(cfg, { ...form, extras: ["humidity", "precipitation"] });
  assert.deepEqual(out.extras, ["humidity", "precipitation", { entity: "sensor.rain_today", icon: "mdi:water" }]);
  const none = weatherFromForm(cfg, { ...form, extras: [], extra_entities: [] });
  assert.equal(none.extras, undefined);
});
