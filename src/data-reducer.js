/**
 * Data reduction for graph rendering: time-based buckets with
 * average / min / max / last / sum aggregation.
 *
 * Input points: sorted array of { t: epoch ms, v: number | null }.
 * A `null` value marks a gap (unavailable/unknown/non-numeric state).
 *
 * fill = "hold" (default): a sensor value is valid until the next change
 *        (step function, like Home Assistant history). `average` is
 *        time-weighted.
 * fill = "gap":  only samples inside a bucket count; empty buckets are gaps.
 *
 * Pure module – no DOM access.
 */

export const AGGREGATIONS = ["average", "min", "max", "last", "sum"];
export const FILL_MODES = ["hold", "gap"];

/**
 * @param {Array<{t:number,v:number|null}>} points sorted ascending by t
 * @param {{start:number,end:number,buckets:number,aggregation?:string,fill?:string}} opts
 * @returns {Array<{t:number,start:number,end:number,v:number|null}>}
 */
export function reduceSeries(points, { start, end, buckets, aggregation = "average", fill = "hold" } = {}) {
  const n = Math.max(1, Math.floor(Number(buckets) || 0));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
  const list = Array.isArray(points) ? points : [];
  const size = (end - start) / n;
  const out = new Array(n);
  const hold = fill !== "gap";

  let idx = 0;
  let current = null; // value carried into the next bucket (hold mode)
  while (idx < list.length && list[idx].t < start) {
    current = list[idx].v;
    idx++;
  }

  for (let b = 0; b < n; b++) {
    const bs = start + b * size;
    const be = b === n - 1 ? end : bs + size;
    const isLast = b === n - 1;

    let wSum = 0;
    let wTotal = 0;
    let segMin = Infinity;
    let segMax = -Infinity;
    let sSum = 0;
    let sCount = 0;
    let sMin = Infinity;
    let sMax = -Infinity;
    let sLast = null;

    let cursor = bs;
    let segVal = current;

    const addSegment = (val, from, to) => {
      if (val === null || val === undefined || !(to > from)) return;
      wSum += val * (to - from);
      wTotal += to - from;
      if (val < segMin) segMin = val;
      if (val > segMax) segMax = val;
    };

    while (idx < list.length && (list[idx].t < be || (isLast && list[idx].t <= be))) {
      const p = list[idx];
      if (hold) addSegment(segVal, cursor, p.t);
      cursor = p.t;
      segVal = p.v;
      if (p.v !== null && p.v !== undefined) {
        sSum += p.v;
        sCount++;
        if (p.v < sMin) sMin = p.v;
        if (p.v > sMax) sMax = p.v;
        sLast = p.v;
      }
      idx++;
    }

    let v = null;
    if (hold) {
      addSegment(segVal, cursor, be);
      // A sample exactly at the bucket end still counts for min/max.
      if (sCount > 0) {
        if (sMin < segMin) segMin = sMin;
        if (sMax > segMax) segMax = sMax;
      }
      current = segVal;
      switch (aggregation) {
        case "min":
          v = segMin === Infinity ? null : segMin;
          break;
        case "max":
          v = segMax === -Infinity ? null : segMax;
          break;
        case "last":
          v = segVal ?? null;
          break;
        case "sum":
          v = sCount > 0 ? sSum : segVal === null || segVal === undefined ? null : 0;
          break;
        default:
          if (wTotal > 0) v = wSum / wTotal;
          else if (sCount > 0) v = sSum / sCount;
          else v = null;
      }
    } else {
      switch (aggregation) {
        case "min":
          v = sCount ? sMin : null;
          break;
        case "max":
          v = sCount ? sMax : null;
          break;
        case "last":
          v = sLast;
          break;
        case "sum":
          v = sCount ? sSum : null;
          break;
        default:
          v = sCount ? sSum / sCount : null;
      }
    }

    out[b] = { t: bs + (be - bs) / 2, start: bs, end: be, v: Number.isFinite(v) ? v : null };
  }
  return out;
}

/**
 * Append a live point to a sorted series (used between history refreshes).
 * Returns a new array; drops points older than `keepFrom` but keeps the last
 * point before it so that "hold" still knows the value at the window start.
 */
export function appendPoint(points, point, keepFrom) {
  const list = Array.isArray(points) ? points.slice() : [];
  if (point && Number.isFinite(point.t)) {
    const last = list[list.length - 1];
    if (!last || point.t > last.t) list.push(point);
    else if (point.t === last.t) list[list.length - 1] = point;
  }
  if (Number.isFinite(keepFrom)) {
    let firstInside = list.findIndex((p) => p.t >= keepFrom);
    if (firstInside === -1) firstInside = list.length;
    const cut = Math.max(0, firstInside - 1);
    if (cut > 0) list.splice(0, cut);
  }
  return list;
}
