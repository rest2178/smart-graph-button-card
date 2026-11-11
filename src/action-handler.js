/**
 * Gesture recognition (tap / hold / double-tap) and execution of
 * Home Assistant actions.
 *
 * GestureRecognizer is pure (injectable timers) and unit-tested.
 * bindActionHandler wires it to DOM pointer + keyboard events.
 * handleAction executes an action config using public hass APIs only.
 */

export const ACTIONS = ["more-info", "toggle", "navigate", "url", "perform-action", "call-service", "assist", "fire-dom-event", "none"];

export const DEFAULT_HOLD_TIME = 500;
export const DEFAULT_DOUBLE_TAP_WINDOW = 250;
const MOVE_TOLERANCE = 12; // px – larger movement cancels (scrolling)

export function hasAction(actionConfig) {
  return Boolean(actionConfig && actionConfig.action && actionConfig.action !== "none");
}

/**
 * Pure tap/hold/double-tap state machine.
 *  - hold fires once the hold time elapses while pressed; the following
 *    release does NOT trigger a tap
 *  - when a double-tap action exists, a single tap is delayed by the
 *    double-tap window; a second tap within the window fires only double_tap
 *  - without double-tap action, tap fires immediately on release
 */
export class GestureRecognizer {
  constructor({
    holdTime = DEFAULT_HOLD_TIME,
    doubleTapWindow = DEFAULT_DOUBLE_TAP_WINDOW,
    hasHold = () => true,
    hasDoubleTap = () => false,
    onAction = () => {},
    onHoldStart = () => {},
    timers = { setTimeout: (...a) => setTimeout(...a), clearTimeout: (...a) => clearTimeout(...a) },
  } = {}) {
    this.holdTime = holdTime;
    this.doubleTapWindow = doubleTapWindow;
    this.hasHold = hasHold;
    this.hasDoubleTap = hasDoubleTap;
    this.onAction = onAction;
    this.onHoldStart = onHoldStart;
    this.timers = timers;
    this._pressed = false;
    this._held = false;
    this._holdTimer = null;
    this._tapTimer = null;
  }

  down() {
    this._pressed = true;
    this._held = false;
    this._clearHold();
    if (this.hasHold()) {
      this._holdTimer = this.timers.setTimeout(() => {
        this._holdTimer = null;
        if (!this._pressed) return;
        this._held = true;
        // a pending single tap is superseded by the hold
        this._clearTap();
        this.onHoldStart();
        this.onAction("hold");
      }, this.holdTime);
    }
  }

  up() {
    if (!this._pressed) return;
    this._pressed = false;
    this._clearHold();
    if (this._held) {
      this._held = false;
      return; // suppress tap after hold
    }
    if (this.hasDoubleTap()) {
      if (this._tapTimer !== null) {
        this._clearTap();
        this.onAction("double_tap");
      } else {
        this._tapTimer = this.timers.setTimeout(() => {
          this._tapTimer = null;
          this.onAction("tap");
        }, this.doubleTapWindow);
      }
    } else {
      this.onAction("tap");
    }
  }

  cancel() {
    this._pressed = false;
    this._held = false;
    this._clearHold();
  }

  /** Keyboard activation (Enter / Space) is always a direct tap. */
  key() {
    this.cancel();
    this._clearTap();
    this.onAction("tap");
  }

  destroy() {
    this.cancel();
    this._clearTap();
  }

  _clearHold() {
    if (this._holdTimer !== null) {
      this.timers.clearTimeout(this._holdTimer);
      this._holdTimer = null;
    }
  }

  _clearTap() {
    if (this._tapTimer !== null) {
      this.timers.clearTimeout(this._tapTimer);
      this._tapTimer = null;
    }
  }
}

/**
 * Bind pointer and keyboard events of `element` to a recognizer.
 * Returns an unbind function that removes every listener.
 */
export function bindActionHandler(element, recognizer, { onPressChange = () => {} } = {}) {
  let startX = 0;
  let startY = 0;
  let activePointer = null;
  let spaceDown = false;

  const onPointerDown = (ev) => {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    if (activePointer !== null) return;
    activePointer = ev.pointerId;
    startX = ev.clientX;
    startY = ev.clientY;
    onPressChange(true);
    recognizer.down();
  };
  const onPointerUp = (ev) => {
    if (ev.pointerId !== activePointer) return;
    activePointer = null;
    onPressChange(false);
    recognizer.up();
  };
  const onPointerCancel = (ev) => {
    if (ev.pointerId !== activePointer) return;
    activePointer = null;
    onPressChange(false);
    recognizer.cancel();
  };
  const onPointerMove = (ev) => {
    if (ev.pointerId !== activePointer) return;
    if (Math.abs(ev.clientX - startX) > MOVE_TOLERANCE || Math.abs(ev.clientY - startY) > MOVE_TOLERANCE) {
      onPointerCancel(ev);
    }
  };
  const onContextMenu = (ev) => {
    // Prevent the long-press context menu on touch devices when hold is used.
    if (recognizer.hasHold()) ev.preventDefault();
  };
  const onKeyDown = (ev) => {
    if (ev.target !== element) return;
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (!ev.repeat) recognizer.key();
    } else if (ev.key === " " || ev.key === "Spacebar") {
      ev.preventDefault(); // no page scroll
      spaceDown = true;
      onPressChange(true);
    }
  };
  const onKeyUp = (ev) => {
    if (ev.key === " " || ev.key === "Spacebar") {
      if (!spaceDown) return;
      spaceDown = false;
      ev.preventDefault();
      onPressChange(false);
      recognizer.key();
    }
  };
  const onBlur = () => {
    spaceDown = false;
    onPressChange(false);
  };

  const listeners = [
    ["pointerdown", onPointerDown],
    ["pointerup", onPointerUp],
    ["pointercancel", onPointerCancel],
    ["pointerleave", onPointerCancel],
    ["pointermove", onPointerMove, { passive: true }],
    ["contextmenu", onContextMenu],
    ["keydown", onKeyDown],
    ["keyup", onKeyUp],
    ["blur", onBlur],
  ];
  for (const [type, fn, opts] of listeners) element.addEventListener(type, fn, opts);
  return () => {
    for (const [type, fn, opts] of listeners) element.removeEventListener(type, fn, opts);
    recognizer.destroy();
  };
}

function fireEvent(node, type, detail, target = node) {
  const ev = new CustomEvent(type, { bubbles: true, composed: true, cancelable: false, detail });
  target.dispatchEvent(ev);
  return ev;
}

function haptic(type = "light") {
  try {
    window.dispatchEvent(new CustomEvent("haptic", { detail: type }));
  } catch (_err) {
    /* ignore */
  }
}

const TOGGLE_DOMAINS = new Set([
  "automation", "climate", "cover", "fan", "group", "humidifier", "input_boolean", "light",
  "media_player", "remote", "siren", "switch", "valve", "water_heater",
]);

/** Domain specific toggle service (mirrors the behaviour of native HA cards). */
export function getToggleService(entityId, stateObj) {
  const domain = String(entityId || "").split(".")[0];
  switch (domain) {
    case "lock":
      return ["lock", stateObj?.state === "locked" ? "unlock" : "lock"];
    case "button":
    case "input_button":
      return [domain, "press"];
    case "scene":
    case "script":
      return [domain, "turn_on"];
    default:
      return TOGGLE_DOMAINS.has(domain) ? [domain, "toggle"] : ["homeassistant", "toggle"];
  }
}

export function isToggleableDomain(entityId) {
  const domain = String(entityId || "").split(".")[0];
  return TOGGLE_DOMAINS.has(domain) || ["lock", "button", "input_button", "scene", "script"].includes(domain);
}

function needsConfirmation(actionConfig, hass) {
  const c = actionConfig.confirmation;
  if (!c) return false;
  if (typeof c === "object" && Array.isArray(c.exemptions) && hass?.user?.id) {
    if (c.exemptions.some((e) => e && e.user === hass.user.id)) return false;
  }
  return true;
}

/**
 * Execute the action configured for `gesture` ("tap" | "hold" | "double_tap").
 * @param {HTMLElement} node  card element (event origin)
 * @param {object} hass
 * @param {object} config     full card config (entity + *_action)
 * @param {string} gesture
 */
export async function handleAction(node, hass, config, gesture) {
  const actionConfig = config?.[`${gesture}_action`];
  if (!hasAction(actionConfig) || !hass) return;

  if (needsConfirmation(actionConfig, hass)) {
    const text =
      (typeof actionConfig.confirmation === "object" && actionConfig.confirmation.text) ||
      `Aktion „${actionConfig.action}“ wirklich ausführen?`;
    haptic("warning");
    // eslint-disable-next-line no-alert
    if (!window.confirm(text)) return;
  }

  const entityId = actionConfig.entity || config.entity;
  switch (actionConfig.action) {
    case "more-info": {
      if (!entityId) return;
      fireEvent(node, "hass-more-info", { entityId });
      break;
    }
    case "toggle": {
      if (!entityId) return;
      const [domain, service] = getToggleService(entityId, hass.states?.[entityId]);
      await callService(hass, domain, service, { entity_id: entityId });
      haptic("light");
      break;
    }
    case "navigate": {
      const path = actionConfig.navigation_path;
      if (!path) return;
      if (actionConfig.navigation_replace) window.history.replaceState(window.history.state, "", path);
      else window.history.pushState(null, "", path);
      fireEvent(window, "location-changed", { replace: Boolean(actionConfig.navigation_replace) }, window);
      haptic("light");
      break;
    }
    case "url": {
      const url = actionConfig.url_path;
      if (!url) return;
      window.open(url, actionConfig.new_tab === false ? "_self" : "_blank", "noopener");
      break;
    }
    case "perform-action":
    case "call-service": {
      const name = actionConfig.perform_action || actionConfig.service;
      if (typeof name !== "string" || !name.includes(".")) return;
      const [domain, service] = name.split(".", 2);
      const data = { ...(actionConfig.data || actionConfig.service_data || {}) };
      await callService(hass, domain, service, data, actionConfig.target);
      haptic("light");
      break;
    }
    case "assist": {
      // Version dependent: the native frontend handles the "hass-action" event
      // and opens the Assist dialog. Without a listener nothing happens.
      fireEvent(node, "hass-action", {
        config: { entity: entityId, tap_action: { ...actionConfig } },
        action: "tap",
      });
      break;
    }
    case "fire-dom-event": {
      fireEvent(node, "ll-custom", actionConfig);
      break;
    }
    default:
      break;
  }
}

async function callService(hass, domain, service, data, target) {
  try {
    if (target && typeof target === "object") await hass.callService(domain, service, data, target);
    else await hass.callService(domain, service, data);
  } catch (err) {
    haptic("failure");
    // eslint-disable-next-line no-console
    console.warn(`[smart-graph-button-card] ${domain}.${service} failed:`, err?.message || err);
  }
}
