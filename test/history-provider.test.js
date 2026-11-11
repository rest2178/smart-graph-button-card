import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { parseHistoryResponse, fetchHistory, buildCacheKey, clearHistoryCache, computeWindow } from "../src/history-provider.js";

beforeEach(() => clearHistoryCache());

test("parses compressed websocket format and ignores invalid values", () => {
  const raw = {
    "sensor.p": [
      { s: "5", lu: 100 },
      { s: "unavailable", lu: 200 },
      { s: "abc", lu: 250 },
      { s: "7.5", lu: 300, lc: 290 },
    ],
  };
  const pts = parseHistoryResponse(raw, "sensor.p");
  assert.deepEqual(pts, [
    { t: 100000, v: 5 },
    { t: 200000, v: null },
    { t: 250000, v: null },
    { t: 290000, v: 7.5 },
  ]);
});

test("parses REST format and sorts by time", () => {
  const raw = [[
    { entity_id: "sensor.p", state: "2", last_changed: "2026-01-01T00:10:00Z" },
    { entity_id: "sensor.p", state: "1", last_changed: "2026-01-01T00:00:00Z" },
  ]];
  const pts = parseHistoryResponse(raw, "sensor.p");
  assert.deepEqual(pts.map((p) => p.v), [1, 2]);
});

test("attribute graphs", () => {
  const raw = { "climate.x": [{ s: "heat", a: { current_temperature: 20.5 }, lu: 1 }, { s: "heat", a: { current_temperature: "x" }, lu: 2 }] };
  assert.deepEqual(parseHistoryResponse(raw, "climate.x", "current_temperature").map((p) => p.v), [20.5, null]);
});

test("empty / malformed responses", () => {
  assert.deepEqual(parseHistoryResponse(null, "sensor.p"), []);
  assert.deepEqual(parseHistoryResponse({}, "sensor.p"), []);
  assert.deepEqual(parseHistoryResponse({ "sensor.p": [{ s: "1" }] }, "sensor.p"), []);
});

test("cache key contains entity, start, end, period and resolution", () => {
  const key = buildCacheKey({ entityId: "sensor.p", start: 1, end: 2, hours: 6, resolution: "60:average" });
  assert.equal(key, "sensor.p||1|2|6|60:average");
});

test("window aligned to granularity (min 10 s)", () => {
  const w = computeWindow(1, 5, 12345);
  assert.equal(w.ttl, 10000);
  assert.equal(w.end % 10000, 0);
  assert.equal(w.end - w.start, 3600000);
});

test("fetch uses websocket, caches and de-duplicates", async () => {
  let calls = 0;
  const hass = { callWS: async () => { calls++; return { "sensor.p": [{ s: "1", lu: 1 }] }; } };
  const opts = { entityId: "sensor.p", hours: 1, updateInterval: 60, now: 1_000_000 };
  const [a, b] = await Promise.all([fetchHistory(hass, opts), fetchHistory(hass, opts)]);
  assert.equal(calls, 1);
  assert.equal(a.status, "ok");
  assert.equal(b.points.length, 1);
  const c = await fetchHistory(hass, opts);
  assert.equal(c.source, "cache");
  assert.equal(calls, 1);
});

test("falls back to REST, then to an empty error result (never throws)", async () => {
  const rest = { callWS: async () => { throw { code: "unknown_command" }; }, callApi: async () => [[{ entity_id: "sensor.p", state: "3", last_changed: "2026-01-01T00:00:00Z" }]] };
  const r = await fetchHistory(rest, { entityId: "sensor.p", hours: 1, updateInterval: 60, now: 2_000_000 });
  assert.equal(r.source, "rest");
  assert.equal(r.points[0].v, 3);

  clearHistoryCache();
  const broken = { callWS: async () => { throw new Error("connection lost"); }, callApi: async () => { throw new Error("500"); } };
  const e = await fetchHistory(broken, { entityId: "sensor.p", hours: 1, updateInterval: 60, now: 3_000_000 });
  assert.equal(e.status, "error");
  assert.deepEqual(e.points, []);
});
