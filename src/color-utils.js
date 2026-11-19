/**
 * Color helpers for the editor's color picker.
 * Pure module – no DOM access.
 */

const HEX_RE = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_RE = /^rgba?\(\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i;

function channel(v) {
  const n = v.endsWith("%") ? (parseFloat(v) / 100) * 255 : parseFloat(v);
  return Math.max(0, Math.min(255, Math.round(n)));
}

function alpha(v) {
  if (v === undefined) return 1;
  const n = v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 1;
}

/** Parse #rgb, #rgba, #rrggbb, #rrggbbaa, rgb() and rgba(). Returns {r,g,b,a} or null. */
export function parseColor(value) {
  if (typeof value !== "string") return null;
  const s = value.trim();
  const hex = HEX_RE.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? Math.round((parseInt(h.slice(6, 8), 16) / 255) * 1000) / 1000 : 1,
    };
  }
  const rgb = RGB_RE.exec(s);
  if (rgb) return { r: channel(rgb[1]), g: channel(rgb[2]), b: channel(rgb[3]), a: alpha(rgb[4]) };
  return null;
}

/** #rrggbb for the native color picker (alpha is dropped). */
export function toHex({ r, g, b }) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Value to store after a color was picked with the mouse. A previously
 * configured transparency (rgba / #rrggbbaa) is kept, otherwise #rrggbb.
 */
export function applyPickedColor(previous, pickedHex) {
  const picked = parseColor(pickedHex);
  if (!picked) return previous;
  const old = parseColor(previous);
  if (old && old.a < 1) return `rgba(${picked.r}, ${picked.g}, ${picked.b}, ${old.a})`;
  return toHex(picked);
}

function hsvToRgb(h, s, v) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return { r: f(5), g: f(3), b: f(1), a: 1 };
}

/** Approximate color of a white light with a color temperature (Kelvin). */
function kelvinToRgb(kelvin) {
  const t = Math.max(1000, Math.min(40000, kelvin)) / 100;
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return { r: clamp(r), g: clamp(g), b: clamp(b), a: 1 };
}

/**
 * Current color of a light entity (e.g. a WLED strip) from its attributes:
 * rgb_color, else hs_color, else the color temperature. Returns {r,g,b,a} or
 * null when the light is off or has no color information.
 */
export function lightColor(stateObj) {
  const a = stateObj?.attributes;
  if (!a || stateObj.state !== "on") return null;
  const num = (v) => (typeof v === "number" ? v : Number(v));
  if (Array.isArray(a.rgb_color) && a.rgb_color.length >= 3) {
    const [r, g, b] = a.rgb_color.map(num);
    if ([r, g, b].every(Number.isFinite)) {
      const ch = (v) => Math.max(0, Math.min(255, Math.round(v)));
      return { r: ch(r), g: ch(g), b: ch(b), a: 1 };
    }
  }
  if (Array.isArray(a.hs_color) && a.hs_color.length >= 2) {
    const [h, sat] = a.hs_color.map(num);
    if (Number.isFinite(h) && Number.isFinite(sat)) return hsvToRgb(((h % 360) + 360) % 360, Math.max(0, Math.min(100, sat)) / 100, 1);
  }
  const kelvin = num(a.color_temp_kelvin) || (num(a.color_temp) ? 1e6 / num(a.color_temp) : NaN);
  if (Number.isFinite(kelvin) && kelvin > 0) return kelvinToRgb(kelvin);
  return null;
}
