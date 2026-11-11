/**
 * Native SVG graph renderer. Produces an SVG markup string from reduced data.
 * All dynamic values are numbers or escaped strings – no injection possible.
 *
 * Pure module – no DOM access.
 */

import { escapeHtml, isDisplayable } from "./utils.js";

export const GRAPH_TYPES = ["line", "area", "smooth-area", "bar", "column", "stepped", "line-bar", "smooth-line-bar"];

const r2 = (n) => Math.round(n * 100) / 100;
const r4 = (n) => Math.round(n * 10000) / 10000;

/**
 * Compute the y-axis range.
 * - manual min/max win (numbers), "auto" otherwise
 * - constant values get a symmetric padding
 * - bar-like graphs include the zero baseline when auto
 */
export function computeScale(values, { min = "auto", max = "auto", includeZero = false } = {}) {
  const finite = values.filter((v) => Number.isFinite(v));
  const manualMin = typeof min === "number" && Number.isFinite(min);
  const manualMax = typeof max === "number" && Number.isFinite(max);
  let lo = manualMin ? min : finite.length ? Math.min(...finite) : 0;
  let hi = manualMax ? max : finite.length ? Math.max(...finite) : 1;
  if (includeZero) {
    if (!manualMin && lo > 0) lo = 0;
    if (!manualMax && hi < 0) hi = 0;
  }
  if (hi < lo) {
    if (manualMin && !manualMax) hi = lo;
    else if (manualMax && !manualMin) lo = hi;
    else [lo, hi] = [hi, lo];
  }
  if (hi === lo) {
    const pad = lo === 0 ? 1 : Math.abs(lo) * 0.1;
    if (manualMin && !manualMax) hi = lo + pad;
    else if (manualMax && !manualMin) lo = hi - pad;
    else if (!manualMin && !manualMax) {
      lo -= pad;
      hi += pad;
    } else hi = lo + 1;
  } else if (!manualMax) {
    hi += (hi - lo) * 0.05; // small headroom
  }
  return { min: lo, max: hi };
}

/** Split indices into runs of consecutive non-null values. */
function runsOf(values) {
  const runs = [];
  let cur = null;
  values.forEach((v, i) => {
    if (Number.isFinite(v)) {
      if (!cur) {
        cur = [];
        runs.push(cur);
      }
      cur.push(i);
    } else cur = null;
  });
  return runs;
}

/**
 * Smooth SVG path through the points using monotone cubic interpolation
 * (Fritsch–Carlson / Steffen). Peaks and valleys are rounded but the curve
 * never overshoots the real values, so it always stays inside the plot area.
 */
export function smoothPath(pts) {
  const n = pts.length;
  const f = (p) => `${r2(p[0])},${r2(p[1])}`;
  if (n < 3) return pts.map((p, k) => `${k ? "L" : "M"}${f(p)}`).join("");
  const dx = [];
  const m = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0] || 1e-9;
    m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i];
  }
  const t = new Array(n);
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) t[i] = 0; // local peak/valley: flat tangent => rounded tip
    else t[i] = (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  }
  let d = `M${f(pts[0])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${f([pts[i][0] + h, pts[i][1] + t[i] * h])} ${f([pts[i + 1][0] - h, pts[i + 1][1] - t[i + 1] * h])} ${f(pts[i + 1])}`;
  }
  return d;
}

/**
 * Render the graph.
 *
 * @param {object} o
 * @param {Array<{v:number|null}>} o.data        reduced buckets
 * @param {number} o.width, o.height              pixel size of the drawing area
 * @param {string} o.type                         line|area|smooth-area|bar|column|stepped|line-bar|smooth-line-bar
 * @param {{above:string,below:string,at?:number}} [o.sign] one color above, one below a value (default 0)
 * @param {{stops:Array<{value:number,color:string}>,base?:string,smooth?:boolean}} [o.bands]
 *        color by height: each color applies from its value upwards, `base` below the lowest value
 * @param {string} o.color                        base color (already resolved)
 * @param {(v:number)=>string|null} [o.pointColor] per-point color function (thresholds per-point)
 * @param {{from:string,to:string,direction:string}} [o.gradient]
 * @returns {string} SVG markup or "" when nothing can be drawn
 */
export function renderGraphSVG(o) {
  const width = Math.max(0, Math.floor(o.width || 0));
  const height = Math.max(0, Math.floor(o.height || 0));
  const data = Array.isArray(o.data) ? o.data : [];
  const values = data.map((d) => (d && Number.isFinite(d.v) ? d.v : null));
  if (!width || !height || !values.some((v) => v !== null)) return "";

  const type = GRAPH_TYPES.includes(o.type) ? o.type : "line";
  const id = String(o.idPrefix || "sgbc").replace(/[^a-zA-Z0-9_-]/g, "");
  const lineWidth = Math.max(0, Number(o.lineWidth ?? 2));
  const lineBar = type === "line-bar" || type === "smooth-line-bar";
  const barish = type === "bar" || type === "column" || lineBar;
  const smoothArea = type === "smooth-area";
  const filled = type === "area" || smoothArea || type === "stepped" || barish;
  // baseline "bottom": areas/bars grow from the bottom edge and the scale is
  // fitted to the data (e.g. temperature 20–28 °C instead of 0–28 °C)
  const bottomBase = o.baseline === "bottom";
  const scale = computeScale(values, { min: o.min, max: o.max, includeZero: filled && !bottomBase });

  const padTop = type === "bar" || type === "column" ? 0 : Math.ceil(lineWidth / 2) + (o.showPoints ? 2 : 0);
  const padBottom = type === "bar" || type === "column" ? 0 : Math.ceil(lineWidth / 2);
  const plotH = Math.max(1, height - padTop - padBottom);
  const span = scale.max - scale.min || 1;
  const yOf = (v) => {
    const clamped = Math.min(scale.max, Math.max(scale.min, v));
    return padTop + ((scale.max - clamped) / span) * plotH;
  };
  const baseValue = Math.min(scale.max, Math.max(scale.min, 0));
  const yBase = bottomBase ? height : yOf(baseValue);
  const n = values.length;
  const bucketW = width / n;
  // line-bar types: line points sit on the bar centres
  const xLine = (i) => (lineBar ? (i + 0.5) * bucketW : n === 1 ? width / 2 : (i / (n - 1)) * width);

  const color = isDisplayable(o.color) ? String(o.color) : "var(--sgbc-graph-color, var(--primary-color, #03a9f4))";
  const defs = [];
  const body = [];
  let paint = escapeHtml(color);

  // Gradient color mode
  if (o.gradient && isDisplayable(o.gradient.from) && isDisplayable(o.gradient.to)) {
    const horizontal = o.gradient.direction === "horizontal";
    defs.push(
      `<linearGradient id="${id}-grad" gradientUnits="userSpaceOnUse" x1="0" y1="${horizontal ? 0 : height}" x2="${horizontal ? width : 0}" y2="0">` +
        `<stop offset="0" style="stop-color:${escapeHtml(o.gradient.from)}"/>` +
        `<stop offset="1" style="stop-color:${escapeHtml(o.gradient.to)}"/></linearGradient>`
    );
    paint = `url(#${id}-grad)`;
  }

  // Per-point colors for line-like paths: horizontal hard-stop gradient
  const perPoint = typeof o.pointColor === "function";
  const colorAt = (v) => {
    const c = perPoint && v !== null ? o.pointColor(v) : null;
    return isDisplayable(c) ? String(c) : color;
  };
  let linePaint = paint;
  if (perPoint && (!barish || lineBar)) {
    const stops = [];
    let prev = color;
    values.forEach((v, i) => {
      const c = v === null ? prev : colorAt(v);
      prev = c;
      let from;
      let to;
      if (type === "stepped" || lineBar) {
        from = i / n;
        to = (i + 1) / n;
      } else {
        from = n === 1 ? 0 : Math.max(0, (i - 0.5) / (n - 1));
        to = n === 1 ? 1 : Math.min(1, (i + 0.5) / (n - 1));
      }
      stops.push(`<stop offset="${r2(from)}" style="stop-color:${escapeHtml(c)}"/>`, `<stop offset="${r2(to)}" style="stop-color:${escapeHtml(c)}"/>`);
    });
    defs.push(`<linearGradient id="${id}-pp" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${width}" y2="0">${stops.join("")}</linearGradient>`);
    linePaint = `url(#${id}-pp)`;
  }

  // Value bands: the color depends on the height (value) of each part of
  // the graph – e.g. up to 15 °C blue, from 15 °C yellow, from 25 °C red.
  // Used by threshold_mode "vertical" and the sign mode. A vertical gradient
  // in user space switches exactly at the band borders, even in the middle of
  // a line segment or a bar. Coordinates are not clamped, so borders outside
  // the visible range still produce the right colors.
  let bandDef = o.bands && Array.isArray(o.bands.stops) ? o.bands : null;
  if (!bandDef && o.sign && isDisplayable(o.sign.above) && isDisplayable(o.sign.below)) {
    const at = Number(o.sign.at);
    bandDef = { stops: [{ value: Number.isFinite(at) ? at : 0, color: o.sign.above }], base: o.sign.below, smooth: false };
  }
  if (bandDef) {
    const st = bandDef.stops
      .map((b) => ({ v: Number(b?.value), c: b?.color }))
      .filter((b) => Number.isFinite(b.v) && isDisplayable(b.c))
      .sort((a, b) => a.v - b.v);
    if (st.length) {
      const base = isDisplayable(bandDef.base) ? String(bandDef.base) : color;
      const yRaw = (v) => padTop + ((scale.max - v) / span) * plotH;
      let y1 = yRaw(st[st.length - 1].v);
      let y2 = yRaw(st[0].v);
      if (!(y2 - y1 > 0.5)) {
        y1 -= 1;
        y2 += 1;
      }
      const off = (v) => r4((yRaw(v) - y1) / (y2 - y1));
      const stops = [];
      for (let i = st.length - 1; i >= 0; i--) {
        stops.push([off(st[i].v), st[i].c]);
        if (!bandDef.smooth) stops.push([off(st[i].v), i > 0 ? st[i - 1].c : base]);
      }
      defs.push(
        `<linearGradient id="${id}-vert" gradientUnits="userSpaceOnUse" x1="0" y1="${r2(y1)}" x2="0" y2="${r2(y2)}">` +
          stops.map(([f, c]) => `<stop offset="${f}" style="stop-color:${escapeHtml(c)}"/>`).join("") +
          `</linearGradient>`
      );
      paint = `url(#${id}-vert)`;
      linePaint = paint;
    }
  }

  // Grid & axis
  if (o.showGrid) {
    for (const f of [0.25, 0.5, 0.75]) {
      const y = r2(padTop + plotH * f);
      body.push(`<line class="grid" x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" shape-rendering="crispEdges"/>`);
    }
  }

  const fillOpacity = Math.min(1, Math.max(0, Number(o.fillOpacity ?? 0.25)));

  // Bars
  if (barish) {
    const gap = type === "column" ? 0 : Math.max(0, Number(o.barGap ?? 2));
    const requested = Number(o.barWidth);
    const barW = Math.max(1, Number.isFinite(requested) && requested > 0 ? Math.min(requested, bucketW) : bucketW - gap);
    const radius = type === "column" ? 0 : Math.max(0, Math.min(Number(o.barRadius ?? 1), barW / 2));
    const barOpacity = lineBar ? Math.max(fillOpacity, 0.35) : 1;
    values.forEach((v, i) => {
      if (v === null) return;
      const y = yOf(v);
      let top = Math.min(y, yBase);
      let h = Math.abs(yBase - y);
      if (h < 1 && v !== baseValue) {
        h = 1;
        if (y < yBase) top = yBase - 1;
      }
      if (h <= 0) return;
      const x = i * bucketW + (bucketW - barW) / 2;
      const fill = perPoint ? escapeHtml(colorAt(v)) : paint;
      body.push(
        `<rect class="bar" x="${r2(x)}" y="${r2(top)}" width="${r2(barW)}" height="${r2(h)}"${radius ? ` rx="${r2(radius)}"` : ""} style="fill:${fill}"${barOpacity < 1 ? ` fill-opacity="${r2(barOpacity)}"` : ""}/>`
      );
    });
  }

  // Lines / areas / steps
  // smooth-area: the fill fades from full strength (far from the baseline) to
  // almost transparent at the baseline. Done with an opacity mask, so it works
  // together with every color mode (bands, per-point, gradient, fixed).
  const areaFill = linePaint;
  let areaOpacity = fillOpacity;
  let areaMask = "";
  if (smoothArea) {
    const fBase = Math.min(1, Math.max(0, yBase / height));
    const minOp = 0.04;
    const op = (f) => {
      if (f <= fBase) return fBase <= 0 ? minOp : fillOpacity + (minOp - fillOpacity) * (f / fBase);
      return fBase >= 1 ? minOp : minOp + (fillOpacity - minOp) * ((f - fBase) / (1 - fBase));
    };
    const offsets = [...new Set([0, fBase, 1])].sort((a, b) => a - b);
    defs.push(
      `<linearGradient id="${id}-ramp" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${height}">` +
        offsets.map((f) => `<stop offset="${r4(f)}" style="stop-color:#fff;stop-opacity:${r2(op(f))}"/>`).join("") +
        `</linearGradient>`,
      `<mask id="${id}-amask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}">` +
        `<rect x="0" y="0" width="${width}" height="${height}" style="fill:url(#${id}-ramp)"/></mask>`
    );
    areaMask = ` mask="url(#${id}-amask)"`;
    areaOpacity = 1;
  }

  if (type === "line" || type === "area" || smoothArea || type === "stepped" || lineBar) {
    const runs = runsOf(values);
    const linePaths = [];
    const areaPaths = [];
    const isolated = [];
    for (const run of runs) {
      if (type === "stepped") {
        let d = "";
        run.forEach((i, k) => {
          const x0 = r2(i * bucketW);
          const x1 = r2((i + 1) * bucketW);
          const y = r2(yOf(values[i]));
          d += k === 0 ? `M${x0},${y}H${x1}` : `V${y}H${x1}`;
        });
        linePaths.push(d);
        const first = r2(run[0] * bucketW);
        areaPaths.push(`${d}V${r2(yBase)}H${first}Z`);
        continue;
      }
      if (run.length === 1 && n > 1) {
        isolated.push(run[0]);
        continue;
      }
      const pts = n === 1 ? [[0, yOf(values[0])], [width, yOf(values[0])]] : run.map((i) => [xLine(i), yOf(values[i])]);
      const d = type === "smooth-line-bar" || smoothArea ? smoothPath(pts) : pts.map((p, k) => `${k ? "L" : "M"}${r2(p[0])},${r2(p[1])}`).join("");
      linePaths.push(d);
      areaPaths.push(`${d}L${r2(pts[pts.length - 1][0])},${r2(yBase)}L${r2(pts[0][0])},${r2(yBase)}Z`);
    }
    if (type === "area" || type === "stepped" || smoothArea) {
      for (const d of areaPaths) body.push(`<path class="area" d="${d}" style="fill:${areaFill}" fill-opacity="${r2(areaOpacity)}" stroke="none"${areaMask}/>`);
    }
    if (lineWidth > 0) {
      for (const d of linePaths) {
        body.push(`<path class="line" d="${d}" fill="none" style="stroke:${linePaint}" stroke-width="${r2(lineWidth)}" stroke-linejoin="round" stroke-linecap="round"/>`);
      }
    }
    for (const i of isolated) {
      body.push(`<circle class="point" cx="${r2(xLine(i))}" cy="${r2(yOf(values[i]))}" r="${r2(Math.max(1.5, lineWidth))}" style="fill:${perPoint ? escapeHtml(colorAt(values[i])) : paint}"/>`);
    }
    if (o.showPoints) {
      values.forEach((v, i) => {
        if (v === null) return;
        const cx = type === "stepped" ? (i + 0.5) * bucketW : xLine(i);
        body.push(`<circle class="point" cx="${r2(cx)}" cy="${r2(yOf(v))}" r="${r2(Math.max(1.5, lineWidth))}" style="fill:${perPoint ? escapeHtml(colorAt(v)) : paint}"/>`);
      });
    }
  }

  if (o.showAxis) {
    const y = r2(yBase);
    body.push(`<line class="axis" x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="currentColor" stroke-opacity="0.3" stroke-width="1" shape-rendering="crispEdges"/>`);
  }

  if (o.showLabels) {
    const fmt = typeof o.labelFormatter === "function" ? o.labelFormatter : (v) => String(Math.round(v * 100) / 100);
    const maxL = fmt(scale.max);
    const minL = fmt(scale.min);
    if (isDisplayable(maxL)) {
      body.push(`<text class="label" x="${width - 3}" y="10" text-anchor="end" font-size="9" fill="currentColor" fill-opacity="0.7">${escapeHtml(maxL)}</text>`);
    }
    if (isDisplayable(minL)) {
      body.push(`<text class="label" x="${width - 3}" y="${height - 3}" text-anchor="end" font-size="9" fill="currentColor" fill-opacity="0.7">${escapeHtml(minL)}</text>`);
    }
  }

  const opacity = Math.min(1, Math.max(0, Number(o.opacity ?? 1)));
  defs.push(`<clipPath id="${id}-clip"><rect x="0" y="0" width="${width}" height="${height}"/></clipPath>`);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true" focusable="false">` +
    `<defs>${defs.join("")}</defs>` +
    `<g clip-path="url(#${id}-clip)"${opacity < 1 ? ` opacity="${r2(opacity)}"` : ""}>${body.join("")}</g></svg>`
  );
}
