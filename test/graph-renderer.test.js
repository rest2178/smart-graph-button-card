import { test } from "node:test";
import assert from "node:assert/strict";
import { computeScale, renderGraphSVG, GRAPH_TYPES } from "../src/graph-renderer.js";

const data = (vals) => vals.map((v, i) => ({ t: i, v }));

test("constant values get a usable range", () => {
  const s = computeScale([5, 5, 5]);
  assert.ok(s.min < 5 && s.max > 5);
  const z = computeScale([0, 0]);
  assert.ok(z.max > z.min);
});

test("negative values and zero baseline for bars", () => {
  const s = computeScale([-10, 5], { includeZero: true });
  assert.ok(s.min <= -10 && s.max >= 5);
  const p = computeScale([5, 8], { includeZero: true });
  assert.equal(p.min, 0);
});

test("manual min/max are respected", () => {
  assert.deepEqual(computeScale([1, 200], { min: 0, max: 100 }), { min: 0, max: 100 });
});

test("empty / all-null data renders nothing", () => {
  assert.equal(renderGraphSVG({ data: [], width: 100, height: 40 }), "");
  assert.equal(renderGraphSVG({ data: data([null, null]), width: 100, height: 40 }), "");
  assert.equal(renderGraphSVG({ data: data([1, 2]), width: 0, height: 40 }), "");
});

test("every graph type renders valid SVG with clip-path", () => {
  for (const type of GRAPH_TYPES) {
    const svg = renderGraphSVG({ data: data([1, 3, null, -2, 5]), width: 200, height: 50, type, color: "#06b6d4" });
    assert.match(svg, /^<svg /, type);
    assert.match(svg, /clip-path="url\(#/, type);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/, type);
  }
});

test("single data point and constant line render", () => {
  const one = renderGraphSVG({ data: data([4]), width: 100, height: 20, type: "line" });
  assert.match(one, /<path class="line"/);
  const constant = renderGraphSVG({ data: data([2, 2, 2]), width: 100, height: 20, type: "area" });
  assert.match(constant, /class="area"/);
  assert.doesNotMatch(constant, /NaN/);
});

test("gaps split line paths", () => {
  const svg = renderGraphSVG({ data: data([1, 2, null, 3, 4]), width: 100, height: 20, type: "line" });
  assert.equal((svg.match(/class="line"/g) || []).length, 2);
});

test("per-point colors for bars and lines", () => {
  const pointColor = (v) => (v >= 10 ? "red" : "green");
  const bars = renderGraphSVG({ data: data([1, 20]), width: 100, height: 20, type: "bar", pointColor });
  assert.match(bars, /fill:green/);
  assert.match(bars, /fill:red/);
  const line = renderGraphSVG({ data: data([1, 20]), width: 100, height: 20, type: "line", pointColor });
  assert.match(line, /linearGradient id="sgbc-pp"/);
});

test("colors are escaped (no markup injection)", () => {
  const svg = renderGraphSVG({ data: data([1, 2]), width: 100, height: 20, type: "bar", color: '"><script>x</script>' });
  assert.doesNotMatch(svg, /<script>/);
});
