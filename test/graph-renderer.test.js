import { test } from "node:test";
import assert from "node:assert/strict";
import { computeScale, renderGraphSVG, smoothPath, GRAPH_TYPES } from "../src/graph-renderer.js";

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

test("smooth-line-bar: bars plus a rounded (cubic) line that never overshoots", () => {
  const vals = [0, 10, 2, 8, 8, 1, 12, 0];
  const svg = renderGraphSVG({ data: data(vals), width: 160, height: 40, type: "smooth-line-bar", min: 0, max: 12 });
  assert.match(svg, /class="bar"/);
  const line = svg.match(/<path class="line" d="([^"]+)"/)[1];
  assert.match(line, /C/, "uses cubic curves");
  const ys = [...line.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => Number(m[2]));
  assert.ok(ys.every((y) => y >= 0 && y <= 40), "all control points inside the plot");
});

test("smoothPath: flat tangent at peaks, straight for two points", () => {
  assert.equal(smoothPath([[0, 0], [10, 10]]), "M0,0L10,10");
  const d = smoothPath([[0, 10], [10, 0], [20, 10]]);
  // control points next to the peak (10,0) have the same y => rounded tip
  assert.match(d, /C[\d.]+,[\d.]+ [\d.]+,0 10,0C[\d.]+,0 /);
});

test("smooth-line-bar with per-point threshold colors (many thresholds)", () => {
  const colors = [[10, "green"], [50, "yellow"], [100, "orange"], [200, "red"]];
  const pointColor = (v) => { let c = null; for (const [t, col] of colors) if (v >= t) c = col; return c; };
  const svg = renderGraphSVG({ data: data([5, 20, 60, 150, 250]), width: 100, height: 20, type: "smooth-line-bar", pointColor, color: "gray" });
  for (const c of ["gray", "green", "yellow", "orange", "red"]) assert.match(svg, new RegExp(`fill:${c}`), c);
  assert.match(svg, /linearGradient id="sgbc-pp"/);
});

test("smooth-area: rounded line, area to zero with fading fill", () => {
  const svg = renderGraphSVG({ data: data([100, 300, -2000, -1800, 1900, 50]), width: 300, height: 80, type: "smooth-area", color: "#0ea5e9", fillOpacity: 0.6 });
  assert.match(svg, /<path class="area"[^>]*fill:url\(#sgbc-afill\)/);
  assert.match(svg, /class="line" d="M[^"]*C/);
  assert.match(svg, /stop-opacity:0.04/, "almost transparent at the zero line");
  assert.match(svg, /stop-opacity:0.6/, "full strength far from zero");
});

test("sign colors: hard switch exactly at the zero line, bars by sign", () => {
  const sign = { above: "purple", below: "green", at: 0 };
  // scale -100..100 (manual) => zero line in the middle (offset 0.5)
  const svg = renderGraphSVG({ data: data([50, -50, 80]), width: 100, height: 100, type: "smooth-area", sign, min: -100, max: 100, lineWidth: 0 });
  assert.match(svg, /id="sgbc-sign"[^>]*>.*offset="0.5" style="stop-color:purple"\/><stop offset="0.5" style="stop-color:green"/);
  assert.match(svg, /fill:url\(#sgbc-afill\)/);
  const bars = renderGraphSVG({ data: data([5, -5]), width: 100, height: 40, type: "bar", sign });
  assert.match(bars, /fill:purple/);
  assert.match(bars, /fill:green/);
});
