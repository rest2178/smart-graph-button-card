import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCssColor, composite, contrastRatio, ensureContrast, contrastTarget, minContrast } from "../src/contrast.js";

const WHITE = { r: 255, g: 255, b: 255, a: 1 };
const BLACK = { r: 0, g: 0, b: 0, a: 1 };
const HA_DARK_CARD = { r: 28, g: 28, b: 28, a: 1 };

test("parseCssColor handles computed formats", () => {
  assert.deepEqual(parseCssColor("rgb(10, 20, 30)"), { r: 10, g: 20, b: 30, a: 1 });
  assert.deepEqual(parseCssColor("rgba(10, 20, 30, 0.5)"), { r: 10, g: 20, b: 30, a: 0.5 });
  assert.deepEqual(parseCssColor("color(srgb 1 0 0.5 / 0.25)"), { r: 255, g: 0, b: 128, a: 0.25 });
  assert.deepEqual(parseCssColor("transparent"), { r: 0, g: 0, b: 0, a: 0 });
  assert.equal(parseCssColor("oklch(0.5 0.1 200)"), null);
});

test("contrast ratio matches WCAG reference values", () => {
  assert.equal(Math.round(contrastRatio(WHITE, BLACK) * 10) / 10, 21);
  assert.equal(contrastRatio(WHITE, WHITE), 1);
});

test("composite blends with alpha", () => {
  assert.deepEqual(composite({ r: 255, g: 255, b: 255, a: 0.5 }, BLACK), { r: 128, g: 128, b: 128, a: 1 });
});

test("readable color is left alone", () => {
  assert.equal(ensureContrast({ r: 225, g: 225, b: 225, a: 1 }, [HA_DARK_CARD]), null);
});

test("dark text on a dark card becomes light, hue is kept", () => {
  const fixed = ensureContrast({ r: 33, g: 33, b: 33, a: 1 }, [HA_DARK_CARD]);
  assert.ok(fixed);
  assert.ok(contrastRatio(fixed, HA_DARK_CARD) >= 4.5);
});

test("colored text is lightened in dark mode and darkened in light mode", () => {
  const blue = { r: 30, g: 64, b: 175, a: 1 };
  const onDark = ensureContrast(blue, [HA_DARK_CARD]);
  assert.ok(contrastRatio(onDark, HA_DARK_CARD) >= 4.5);
  assert.ok(onDark.b > onDark.r, "still bluish");
  const yellow = { r: 234, g: 179, b: 8, a: 1 };
  const onLight = ensureContrast(yellow, [WHITE]);
  assert.ok(contrastRatio(onLight, WHITE) >= 4.5);
  assert.ok(onLight.r > onLight.b, "still yellowish");
});

test("translucent text is judged after compositing", () => {
  const faint = { r: 255, g: 255, b: 255, a: 0.2 };
  assert.ok(minContrast(faint, [HA_DARK_CARD]) < 4.5);
  assert.ok(ensureContrast(faint, [HA_DARK_CARD]));
});

test("several backgrounds (card + graph) – best compromise", () => {
  const graph = composite({ r: 239, g: 68, b: 68, a: 0.6 }, HA_DARK_CARD);
  const fixed = ensureContrast({ r: 120, g: 120, b: 120, a: 1 }, [HA_DARK_CARD, graph], 4.5);
  assert.ok(fixed);
  assert.ok(minContrast(fixed, [HA_DARK_CARD, graph]) >= 3);
});

test("large text uses the lower target", () => {
  assert.equal(contrastTarget(24, 400), 3);
  assert.equal(contrastTarget(19, 700), 3);
  assert.equal(contrastTarget(14, 600), 4.5);
});
