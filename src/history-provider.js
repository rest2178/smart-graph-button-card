/**
 * History data access – the ONLY place that talks to Home Assistant's
 * history interfaces.
 *
 * Primary source (stable since HA 2022.x, used by HA's own frontend):
 *   WebSocket command "history/history_during_period"
 *   -> { [entity_id]: [ { s, a?, lu, lc? }, ... ] }   (compressed state format,
 *      lu / lc are epoch seconds; lc is omitted when equal to lu)
 *
 * Fallback (REST, documented in the HA REST API docs):
 *   GET /api/history/period/<start>?filter_entity_id=..&end_time=..
 *   -> [ [ { entity_id, state, attributes, last_changed, last_updated }, ... ] ]
 *
 * NOTE: The WebSocket command is used by the official frontend but is not part
 * of a formally versioned public API. Its response shape is therefore parsed
 * defensively, and any failure falls back to REST and finally to an empty
 * series – the card stays usable without a graph.
 *
 * Neither hass.callWS nor hass.callApi support AbortSignal. Stale responses
 * are therefore discarded by the caller (request token), identical requests
 * are de-duplicated (in-flight map) and results are cached.
 */

import { parseNumber, isPlainObject } from "./utils.js";

const CACHE = new Map();
const INFLIGHT = new Map();
const MAX_CACHE_ENTRIES = 60;
let websocketUnsupported = false;

export const MIN_UPDATE_INTERVAL = 10; // seconds

/** Cache key: entity, attribute, start, end, period (hours) and resolution. */
export function buildCacheKey({ entityId, attribute, start, end, hours, resolution }) {
  return [entityId, attribute || "", start, end, hours, resolution || ""].join("|");
}

/**
 * Compute a request window aligned to the refresh granularity so that several
 * cards showing the same entity share one request and one cache entry.
 */
export function computeWindow(hours, granularitySeconds, now = Date.now()) {
  const gran = Math.max(MIN_UPDATE_INTERVAL, Number(granularitySeconds) || MIN_UPDATE_INTERVAL) * 1000;
  const end = Math.ceil(now / gran) * gran;
  const start = end - hours * 3600 * 1000;
  return { start, end, ttl: gran };
}

function toMs(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value * 1000 : NaN;
  if (typeof value === "string") return Date.parse(value);
  return NaN;
}

function valueOf(state, attributes, attribute) {
  if (attribute) return parseNumber(attributes?.[attribute]);
  return parseNumber(state);
}

/**
 * Parse either response format into sorted points [{t, v}].
 * Non-numeric / unavailable / unknown / null values become v = null (gap marker).
 */
export function parseHistoryResponse(raw, entityId, attribute) {
  const points = [];
  if (!raw) return points;

  if (isPlainObject(raw) && Array.isArray(raw[entityId])) {
    // WebSocket compressed format
    let lastAttrs;
    for (const e of raw[entityId]) {
      if (!e) continue;
      if (isPlainObject(e.a)) lastAttrs = e.a;
      const isCompressed = "s" in e || "lu" in e;
      const state = isCompressed ? e.s : e.state;
      const attrs = isCompressed ? (isPlainObject(e.a) ? e.a : lastAttrs) : e.attributes;
      let t;
      if (isCompressed) t = attribute ? toMs(e.lu) : toMs(e.lc ?? e.lu);
      else t = toMs(attribute ? e.last_updated ?? e.last_changed : e.last_changed ?? e.last_updated);
      if (!Number.isFinite(t)) continue;
      points.push({ t, v: valueOf(state, attrs, attribute) });
    }
  } else if (Array.isArray(raw)) {
    // REST format: array of arrays (one per entity)
    let series = raw.find((arr) => Array.isArray(arr) && arr.some((e) => e && e.entity_id === entityId));
    if (!series && raw.length === 1 && Array.isArray(raw[0])) series = raw[0];
    let lastAttrs;
    for (const e of series || []) {
      if (!e) continue;
      if (isPlainObject(e.attributes)) lastAttrs = e.attributes;
      const t = toMs(attribute ? e.last_updated ?? e.last_changed : e.last_changed ?? e.last_updated);
      if (!Number.isFinite(t)) continue;
      points.push({ t, v: valueOf(e.state, e.attributes ?? lastAttrs, attribute) });
    }
  }

  points.sort((a, b) => a.t - b.t);
  return points;
}

async function fetchViaWebsocket(hass, { entityId, attribute, start, end }) {
  const msg = {
    type: "history/history_during_period",
    start_time: new Date(start).toISOString(),
    end_time: new Date(end).toISOString(),
    entity_ids: [entityId],
    minimal_response: !attribute,
    no_attributes: !attribute,
    significant_changes_only: false,
  };
  const raw = await hass.callWS(msg);
  return parseHistoryResponse(raw, entityId, attribute);
}

async function fetchViaRest(hass, { entityId, attribute, start, end }) {
  const params = [
    `filter_entity_id=${encodeURIComponent(entityId)}`,
    `end_time=${encodeURIComponent(new Date(end).toISOString())}`,
    "significant_changes_only=0",
  ];
  if (!attribute) params.push("minimal_response", "no_attributes");
  const path = `history/period/${encodeURIComponent(new Date(start).toISOString())}?${params.join("&")}`;
  const raw = await hass.callApi("GET", path);
  return parseHistoryResponse(raw, entityId, attribute);
}

function isUnknownCommand(err) {
  const code = err?.code ?? err?.error?.code;
  return code === "unknown_command" || /unknown command/i.test(String(err?.message || ""));
}

function storeCache(key, entry) {
  CACHE.set(key, entry);
  while (CACHE.size > MAX_CACHE_ENTRIES) {
    const oldest = CACHE.keys().next().value;
    CACHE.delete(oldest);
  }
}

/**
 * Fetch history points for one entity.
 * Never throws: on failure resolves to { points: [], status: "error" }.
 *
 * @returns {Promise<{points:Array<{t:number,v:number|null}>, status:"ok"|"empty"|"error",
 *                    source:"websocket"|"rest"|"cache"|"none", start:number, end:number, error?:string}>}
 */
export async function fetchHistory(hass, { entityId, attribute, hours, updateInterval, resolution, now } = {}) {
  const { start, end, ttl } = computeWindow(hours, updateInterval, now);
  const result = (points, status, source, error) => ({ points, status, source, start, end, error });

  if (!hass || !entityId || !(hours > 0)) return result([], "error", "none", "missing hass/entity");

  const key = buildCacheKey({ entityId, attribute, start, end, hours, resolution });
  const cached = CACHE.get(key);
  const nowMs = now ?? Date.now();
  if (cached && nowMs - cached.time < ttl) {
    return result(cached.points, cached.points.length ? "ok" : "empty", "cache");
  }
  if (INFLIGHT.has(key)) return INFLIGHT.get(key);

  const request = (async () => {
    let points = null;
    let source = "none";
    let lastError;
    if (!websocketUnsupported && typeof hass.callWS === "function") {
      try {
        points = await fetchViaWebsocket(hass, { entityId, attribute, start, end });
        source = "websocket";
      } catch (err) {
        lastError = err;
        if (isUnknownCommand(err)) websocketUnsupported = true;
      }
    }
    if (points === null && typeof hass.callApi === "function") {
      try {
        points = await fetchViaRest(hass, { entityId, attribute, start, end });
        source = "rest";
      } catch (err) {
        lastError = err;
      }
    }
    if (points === null) {
      return result([], "error", "none", String(lastError?.message || lastError || "history unavailable"));
    }
    storeCache(key, { time: Date.now(), points });
    return result(points, points.length ? "ok" : "empty", source);
  })();

  INFLIGHT.set(key, request);
  try {
    return await request;
  } finally {
    INFLIGHT.delete(key);
  }
}

/** Test/maintenance helper. */
export function clearHistoryCache() {
  CACHE.clear();
  INFLIGHT.clear();
  websocketUnsupported = false;
}
