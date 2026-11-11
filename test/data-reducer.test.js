import { test } from "node:test";
import assert from "node:assert/strict";
import { reduceSeries, appendPoint } from "../src/data-reducer.js";

const H = 3600 * 1000;

test("empty history -> all buckets null", () => {
  const out = reduceSeries([], { start: 0, end: 4 * H, buckets: 4 });
  assert.equal(out.length, 4);
  assert.ok(out.every((b) => b.v === null));
});

test("single data point before window is held across all buckets", () => {
  const out = reduceSeries([{ t: -10, v: 5 }], { start: 0, end: 4 * H, buckets: 4 });
  assert.deepEqual(out.map((b) => b.v), [5, 5, 5, 5]);
});

test("time-weighted average", () => {
  // 0 for the first half hour, 10 for the second half
  const pts = [{ t: 0, v: 0 }, { t: 0.5 * H, v: 10 }];
  const [b] = reduceSeries(pts, { start: 0, end: H, buckets: 1 });
  assert.equal(b.v, 5);
});

test("min / max / last / sum aggregations", () => {
  const pts = [{ t: 0, v: 3 }, { t: 10, v: 9 }, { t: 20, v: 1 }];
  const opts = { start: 0, end: 100, buckets: 1 };
  assert.equal(reduceSeries(pts, { ...opts, aggregation: "min" })[0].v, 1);
  assert.equal(reduceSeries(pts, { ...opts, aggregation: "max" })[0].v, 9);
  assert.equal(reduceSeries(pts, { ...opts, aggregation: "last" })[0].v, 1);
  assert.equal(reduceSeries(pts, { ...opts, aggregation: "sum" })[0].v, 13);
});

test("reduces large data sets to max_points buckets", () => {
  const pts = Array.from({ length: 10000 }, (_, i) => ({ t: i * 1000, v: i % 100 }));
  const out = reduceSeries(pts, { start: 0, end: 10000 * 1000, buckets: 120 });
  assert.equal(out.length, 120);
  assert.ok(out.every((b) => Number.isFinite(b.v)));
});

test("unavailable creates gaps in hold mode", () => {
  const pts = [{ t: 0, v: 5 }, { t: 25, v: null }, { t: 75, v: 7 }];
  const out = reduceSeries(pts, { start: 0, end: 100, buckets: 4, aggregation: "last" });
  assert.deepEqual(out.map((b) => b.v), [5, null, null, 7]);
  const avg = reduceSeries(pts, { start: 0, end: 100, buckets: 4 });
  assert.equal(avg[0].v, 5);
  assert.equal(avg[1].v, null);
});

test("gap fill mode: empty buckets stay empty", () => {
  const out = reduceSeries([{ t: 10, v: 2 }, { t: 90, v: 4 }], { start: 0, end: 100, buckets: 4, fill: "gap" });
  assert.deepEqual(out.map((b) => b.v), [2, null, null, 4]);
});

test("invalid window returns empty array", () => {
  assert.deepEqual(reduceSeries([{ t: 0, v: 1 }], { start: 10, end: 10, buckets: 5 }), []);
});

test("appendPoint keeps order and trims old points but keeps one before window", () => {
  let pts = [{ t: 0, v: 1 }, { t: 10, v: 2 }, { t: 20, v: 3 }];
  pts = appendPoint(pts, { t: 30, v: 4 }, 15);
  assert.deepEqual(pts.map((p) => p.t), [10, 20, 30]);
  pts = appendPoint(pts, { t: 5, v: 9 }, 15);
  assert.deepEqual(pts.map((p) => p.t), [10, 20, 30], "out-of-order point ignored");
});
