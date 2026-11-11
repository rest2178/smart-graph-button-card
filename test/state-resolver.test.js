import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getStateGroup, compareState, matchCustomState, normalizeThresholdRanges, findThresholdColor, resolveColor, DEFAULT_STATE_MAPPING,
} from "../src/state-resolver.js";

test("on/off state groups (case-insensitive)", () => {
  assert.equal(getStateGroup("on"), "on");
  assert.equal(getStateGroup("ON"), "on");
  assert.equal(getStateGroup("playing"), "on");
  assert.equal(getStateGroup("off"), "off");
  assert.equal(getStateGroup("Closed"), "off");
  assert.equal(getStateGroup("not_home"), "off");
});

test("unavailable, unknown and missing entity", () => {
  assert.equal(getStateGroup("unavailable"), "unavailable");
  assert.equal(getStateGroup("unknown"), "unavailable");
  assert.equal(getStateGroup(undefined), "unavailable");
  assert.equal(getStateGroup(null), "unavailable");
});

test("unmapped states are 'other'; case sensitivity can be enabled", () => {
  assert.equal(getStateGroup("21.5"), "other");
  assert.equal(getStateGroup("ON", DEFAULT_STATE_MAPPING, true), "other");
  assert.equal(getStateGroup("an", { on: ["an"], off: ["aus"], unavailable: [] }), "on");
});

test("operators", () => {
  assert.equal(compareState("==", "on", "ON"), true);
  assert.equal(compareState("==", "7.50", 7.5), true);
  assert.equal(compareState("!=", "off", "on"), true);
  assert.equal(compareState(">", "101", 100), true);
  assert.equal(compareState(">", "abc", 100), false);
  assert.equal(compareState(">=", "100", 100), true);
  assert.equal(compareState("<", "-5", 0), true);
  assert.equal(compareState("<=", "unavailable", 0), false);
  assert.equal(compareState("contains", "heating_eco", "ECO"), true);
  assert.equal(compareState("regex", "mode_3", "^mode_\\d$"), true);
  assert.equal(compareState("regex", "x", "(["), false, "invalid regex never throws");
});

test("custom state: first match wins", () => {
  const rules = [
    { operator: "==", value: "on", class: "active", color: "#22c55e" },
    { operator: ">", value: 100, class: "warning", color: "#ef4444" },
  ];
  assert.equal(matchCustomState("on", rules).class, "active");
  assert.equal(matchCustomState("150", rules).class, "warning");
  assert.equal(matchCustomState("50", rules), null);
});

test("threshold boundaries: from inclusive, to exclusive, last open", () => {
  const ranges = normalizeThresholdRanges([
    { value: 0, color: "green" },
    { value: 10, color: "orange" },
    { value: 100, color: "red" },
  ]);
  assert.equal(findThresholdColor(-0.1, ranges), null);
  assert.equal(findThresholdColor(0, ranges), "green");
  assert.equal(findThresholdColor(9.999, ranges), "green");
  assert.equal(findThresholdColor(10, ranges), "orange");
  assert.equal(findThresholdColor(99.99, ranges), "orange");
  assert.equal(findThresholdColor(100, ranges), "red");
  assert.equal(findThresholdColor(1e9, ranges), "red");
  assert.equal(findThresholdColor("unavailable", ranges), null);
});

test("explicit ranges and unsorted value lists", () => {
  const r = normalizeThresholdRanges({ ranges: [{ from: 0, to: 10, color: "a" }, { from: 10, color: "b" }] });
  assert.equal(findThresholdColor(10, r), "b");
  const u = normalizeThresholdRanges([{ value: 100, color: "red" }, { value: 0, color: "green" }]);
  assert.equal(findThresholdColor(50, u), "green");
});

test("resolveColor lookup order", () => {
  const map = { on: "g", off: "x", warning: "r", default: "d" };
  assert.equal(resolveColor(map, "on"), "g");
  assert.equal(resolveColor(map, "on", "warning"), "r");
  assert.equal(resolveColor(map, "other"), "d");
  assert.equal(resolveColor({ on: "g" }, "other"), "g");
  assert.equal(resolveColor("#fff", "off"), "#fff");
  assert.equal(resolveColor(undefined, "on"), null);
});

test("YAML 1.1 true/false keys are aliases for on/off", () => {
  assert.equal(resolveColor({ true: "g", false: "x" }, "on"), "g");
  assert.equal(resolveColor({ true: "g", false: "x" }, "off"), "x");
});
