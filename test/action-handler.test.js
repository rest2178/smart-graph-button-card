import { test } from "node:test";
import assert from "node:assert/strict";
import { GestureRecognizer, getToggleService, hasAction } from "../src/action-handler.js";

/** Deterministic fake clock. */
function fakeTimers() {
  let now = 0;
  let id = 0;
  const pending = new Map();
  return {
    setTimeout(fn, ms) { pending.set(++id, { fn, at: now + ms }); return id; },
    clearTimeout(i) { pending.delete(i); },
    advance(ms) {
      const target = now + ms;
      for (;;) {
        const next = [...pending.entries()].filter(([, t]) => t.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        pending.delete(next[0]);
        now = next[1].at;
        next[1].fn();
      }
      now = target;
    },
  };
}

function setup({ hold = true, double = false } = {}) {
  const timers = fakeTimers();
  const fired = [];
  const g = new GestureRecognizer({ holdTime: 500, doubleTapWindow: 250, hasHold: () => hold, hasDoubleTap: () => double, onAction: (a) => fired.push(a), timers });
  return { g, timers, fired };
}

test("tap fires immediately without double-tap action", () => {
  const { g, fired } = setup();
  g.down(); g.up();
  assert.deepEqual(fired, ["tap"]);
});

test("hold fires once and suppresses the tap on release", () => {
  const { g, timers, fired } = setup();
  g.down(); timers.advance(600); g.up();
  assert.deepEqual(fired, ["hold"]);
});

test("release before hold time is a tap", () => {
  const { g, timers, fired } = setup();
  g.down(); timers.advance(300); g.up(); timers.advance(1000);
  assert.deepEqual(fired, ["tap"]);
});

test("double tap fires only double_tap (no taps)", () => {
  const { g, timers, fired } = setup({ double: true });
  g.down(); g.up(); timers.advance(100); g.down(); g.up(); timers.advance(1000);
  assert.deepEqual(fired, ["double_tap"]);
});

test("single tap with double-tap configured waits for the window", () => {
  const { g, timers, fired } = setup({ double: true });
  g.down(); g.up();
  assert.deepEqual(fired, []);
  timers.advance(260);
  assert.deepEqual(fired, ["tap"]);
});

test("two taps outside the window are two taps", () => {
  const { g, timers, fired } = setup({ double: true });
  g.down(); g.up(); timers.advance(300); g.down(); g.up(); timers.advance(300);
  assert.deepEqual(fired, ["tap", "tap"]);
});

test("cancel (pointer moved/cancelled) fires nothing", () => {
  const { g, timers, fired } = setup();
  g.down(); g.cancel(); timers.advance(1000); g.up();
  assert.deepEqual(fired, []);
});

test("keyboard activation is a direct tap", () => {
  const { g, fired } = setup({ double: true });
  g.key();
  assert.deepEqual(fired, ["tap"]);
});

test("destroy clears pending timers", () => {
  const { g, timers, fired } = setup({ double: true });
  g.down(); g.up(); g.destroy(); timers.advance(1000);
  assert.deepEqual(fired, []);
});

test("toggle services per domain", () => {
  assert.deepEqual(getToggleService("switch.a"), ["switch", "toggle"]);
  assert.deepEqual(getToggleService("lock.door", { state: "locked" }), ["lock", "unlock"]);
  assert.deepEqual(getToggleService("lock.door", { state: "unlocked" }), ["lock", "lock"]);
  assert.deepEqual(getToggleService("scene.x"), ["scene", "turn_on"]);
  assert.deepEqual(getToggleService("button.x"), ["button", "press"]);
  assert.deepEqual(getToggleService("sensor.x"), ["homeassistant", "toggle"]);
  assert.equal(hasAction({ action: "none" }), false);
  assert.equal(hasAction(undefined), false);
});
