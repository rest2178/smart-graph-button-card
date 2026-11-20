/*! Smart Graph Button Card v1.18.0 | MIT License | no external dependencies */

// ---- src/styles.js
const __m_styles_js = (() => {
/**
 * Card styles. Layer order (z-index):
 *   0  base background (ha-card background)
 *   1/2 state background / graph (swappable via layers.graph_above_state_background)
 *   3  readability overlay
 *   4  content (icon, name, values)
 *   5  focus / hover / pressed effects
 */
const CARD_STYLES = `
:host {
  display: block;
  min-width: 0;
}

ha-card.sgbc {
  position: relative;
  display: block;
  box-sizing: border-box;
  height: var(--sgbc-height, 64px);
  min-width: min(var(--sgbc-min-width, 180px), 100%);
  max-width: 100%;
  overflow: var(--sgbc-overflow, hidden);
  border-radius: var(--sgbc-border-radius, var(--ha-card-border-radius, 14px));
  border: var(--sgbc-border-width, 1px) solid var(--sgbc-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
  background: var(--sgbc-background, var(--ha-card-background, var(--card-background-color, #fff)));
  color: var(--primary-text-color);
  cursor: pointer;
  isolation: isolate;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: box-shadow 160ms ease;
}
ha-card.sgbc.no-action { cursor: default; }
ha-card.sgbc.auto-height { height: auto; min-height: 48px; }

.layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
}
.state-bg {
  z-index: var(--sgbc-z-state, 1);
  background: var(--sgbc-state-background, transparent);
  transition: background-color 240ms ease;
}
.graph {
  z-index: var(--sgbc-z-graph, 2);
  overflow: hidden;
  opacity: var(--sgbc-graph-opacity, 0.6);
  color: var(--secondary-text-color);
}
.graph svg, .icon-graph svg { display: block; width: 100%; height: 100%; overflow: hidden; }
.graph.pos-full { inset: 0; }
.graph.pos-left { inset: 0 auto 0 0; width: var(--sgbc-graph-width, 50%); border-radius: inherit; border-top-right-radius: 0; border-bottom-right-radius: 0; }
.graph.pos-after-icon {
  inset: 0 0 0 auto;
  left: calc(var(--sgbc-graph-pad, 12px) + var(--sgbc-icon-area-size, 42px) + var(--sgbc-graph-icon-offset, 0px));
  border-radius: inherit;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.graph.pos-after-icon.mirror {
  inset: 0 auto 0 0;
  left: 0;
  right: calc(var(--sgbc-graph-pad, 12px) + var(--sgbc-icon-area-size, 42px) + var(--sgbc-graph-icon-offset, 0px));
  border-radius: inherit;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.graph.pos-right { inset: 0 0 0 auto; width: var(--sgbc-graph-width, 50%); border-radius: inherit; border-top-left-radius: 0; border-bottom-left-radius: 0; }
.graph.pos-bottom { inset: auto 0 0 0; height: var(--sgbc-graph-height, 35%); border-top-left-radius: 0; border-top-right-radius: 0; }
.graph.pos-custom {
  inset: auto;
  left: var(--sgbc-graph-left, 0%);
  top: var(--sgbc-graph-top, 0%);
  width: var(--sgbc-graph-width, 100%);
  height: var(--sgbc-graph-height, 100%);
  border-radius: 0;
}
.graph.pos-icon-area, .graph.hidden { display: none; }
/* soft fade of the graph start (left) and end (right) into the background */
.graph.fade, .icon-graph.fade {
  --sgbc-fade-mask: linear-gradient(to right,
    transparent 0,
    rgba(0, 0, 0, 0.12) calc(var(--sgbc-fade-start, 0%) * 0.3),
    rgba(0, 0, 0, 0.5) calc(var(--sgbc-fade-start, 0%) * 0.6),
    #000 var(--sgbc-fade-start, 0%),
    #000 calc(100% - var(--sgbc-fade-end, 0%)),
    rgba(0, 0, 0, 0.5) calc(100% - var(--sgbc-fade-end, 0%) * 0.6),
    rgba(0, 0, 0, 0.12) calc(100% - var(--sgbc-fade-end, 0%) * 0.3),
    transparent 100%);
  -webkit-mask-image: var(--sgbc-fade-mask);
  mask-image: var(--sgbc-fade-mask);
}

.overlay { z-index: 3; background: var(--sgbc-overlay-color, transparent); }
.overlay.hidden { display: none; }

.content {
  position: relative;
  z-index: 4;
  box-sizing: border-box;
  height: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--sgbc-gap, 10px);
  padding: var(--sgbc-padding, 8px 12px);
  min-width: 0;
}
.content.icon-right { grid-template-columns: minmax(0, 1fr) auto; }
.content.icon-right .icon-wrap { order: 2; }
.content.no-icon { grid-template-columns: minmax(0, 1fr); }

.icon-wrap { position: relative; flex: none; line-height: 0; }
.icon-area {
  position: relative;
  box-sizing: border-box;
  width: var(--sgbc-icon-area-size, 42px);
  height: var(--sgbc-icon-area-size, 42px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: var(--sgbc-icon-background, transparent);
  color: var(--sgbc-icon-color, var(--state-icon-color, var(--secondary-text-color)));
  transition: background-color 240ms ease, color 240ms ease;
}
.icon-area.shape-rounded-square { border-radius: 28%; }
.icon-area.shape-square { border-radius: 0; }
.icon-area.shape-none { background: transparent; border-radius: 0; }
.icon-area .icon-graph { position: absolute; inset: 0; z-index: 0; opacity: var(--sgbc-graph-opacity, 0.6); }
.icon-area .icon-graph.hidden { display: none; }
.icon-area .glyph { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; line-height: 0; }
.icon-area ha-icon, .icon-area ha-state-icon {
  --mdc-icon-size: var(--sgbc-icon-size, 22px);
  width: var(--sgbc-icon-size, 22px);
  height: var(--sgbc-icon-size, 22px);
  color: var(--sgbc-icon-color, var(--state-icon-color, var(--secondary-text-color)));
  display: inline-flex;
}
.icon-area .svg-icon { width: var(--sgbc-icon-size, 22px); height: var(--sgbc-icon-size, 22px); color: var(--sgbc-icon-color, var(--state-icon-color, var(--secondary-text-color))); }
.icon-area .svg-icon svg { width: 100%; height: 100%; fill: currentColor; }
.icon-area img.picture { width: 100%; height: 100%; object-fit: cover; display: block; }
.icon-area.has-picture { background: transparent; }
.badge {
  position: absolute;
  right: -3px;
  bottom: -3px;
  z-index: 2;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  background: var(--sgbc-background, var(--ha-card-background, var(--card-background-color, #fff)));
  color: var(--error-color, #db4437);
  box-shadow: 0 0 0 1px var(--sgbc-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
  --mdc-icon-size: 14px;
}
.badge.visible { display: flex; }

.info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  overflow: hidden;
}
.name {
  min-width: 0;
  font-size: var(--sgbc-name-size, 14px);
  font-weight: var(--sgbc-name-weight, 600);
  line-height: 1.25;
  color: var(--sgbc-name-color, var(--primary-text-color));
  text-align: var(--sgbc-name-align, left);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
}
.name.overflow-clip { text-overflow: clip; }
.name.hidden { display: none; }
.name.multiline {
  white-space: normal;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--sgbc-name-lines, 2);
  line-clamp: var(--sgbc-name-lines, 2);
}
.values {
  min-width: 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: var(--sgbc-values-gap, 4px);
  font-size: var(--sgbc-values-size, 12px);
  line-height: 1.3;
  color: var(--sgbc-value-color, var(--secondary-text-color));
  overflow: hidden;
  white-space: nowrap;
  text-align: var(--sgbc-name-align, left);
}
.values.stacked { flex-direction: column; align-items: flex-start; gap: 0; }
.values.hidden { display: none; }
.value { display: inline-flex; align-items: center; gap: 3px; min-width: 0; max-width: 100%; }
.value.hidden, .sep.hidden { display: none; }
.value .value-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.value ha-icon { --mdc-icon-size: 14px; width: 14px; height: 14px; flex: none; display: inline-flex; }
.value ha-icon.hidden { display: none; }
.value-1 { color: var(--sgbc-value-1-color, var(--sgbc-value-color, var(--secondary-text-color))); font-size: var(--sgbc-value-1-size, inherit); font-weight: var(--sgbc-value-1-weight, inherit); }
.value-2 { color: var(--sgbc-value-2-color, var(--sgbc-value-color, var(--secondary-text-color))); font-size: var(--sgbc-value-2-size, inherit); font-weight: var(--sgbc-value-2-weight, inherit); flex-shrink: 0; }
.sep { flex: none; white-space: pre; opacity: 0.8; }

.state-unavailable .info, .state-unavailable .glyph { opacity: 0.6; }

/* ---- info variant: [icon name] on top, large value + small unit below */
.value .unit { flex: none; font-size: 0.5em; margin-left: 3px; color: var(--secondary-text-color); font-weight: 400; }
.value .unit.hidden { display: none; }
/* font sizes follow the card width, so 4 cards side by side still fit */
ha-card.sgbc.variant-info { container-type: inline-size; }
.info-layout .name { font-size: var(--sgbc-name-size, clamp(11px, 11cqi, 13px)); }
.content.info-layout {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 0;
}
.info-layout .info { justify-content: flex-start; gap: 1px; }
.info-layout .value-1 .unit { margin-left: 0; }
/* value position (info card) */
.info-layout .info { flex: 1 1 auto; min-height: 0; }
.vpos-v-middle .values { margin-top: auto; margin-bottom: auto; }
.vpos-v-bottom .values { margin-top: auto; }
.vpos-h-center .values { align-self: center; max-width: 100%; }
.vpos-h-right .values { align-self: flex-end; max-width: 100%; }
.info-head .values { flex: 0 0 auto; margin-left: auto; max-width: 65%; }
.info-head .name { min-width: 0; flex: 1 1 0; }
.info-layout .values { transform: translate(var(--sgbc-value-dx, 0px), var(--sgbc-value-dy, 0px)); }
.info-head.hidden { display: none; }
/* icon position (info card) */
.info-layout .icon-wrap { transform: translate(var(--sgbc-icon-dx, 0px), var(--sgbc-icon-dy, 0px)); }
.info-head .name + .icon-wrap, .info-head .values + .icon-wrap { margin-left: auto; }
.info-head .name + .values + .icon-wrap { margin-left: 6px; }
.info-layout .icon-wrap.icon-abs { position: absolute; z-index: 1; }
.ipos-top-right .info-head { padding-right: calc(var(--sgbc-icon-area-size, 18px) + 4px); }
.ipos-top-left .info-head { padding-left: calc(var(--sgbc-icon-area-size, 18px) + 4px); }
.icon-abs.ipos-v-top { top: var(--sgbc-pad-top, 8px); }
.icon-abs.ipos-v-bottom { bottom: var(--sgbc-pad-bottom, 8px); }
.icon-abs.ipos-v-middle { top: 50%; margin-top: calc(var(--sgbc-icon-area-size, 18px) / -2); }
.icon-abs.ipos-h-left { left: var(--sgbc-pad-left, 10px); }
.icon-abs.ipos-h-right { right: var(--sgbc-pad-right, 10px); }
.icon-abs.ipos-h-center { left: 50%; margin-left: calc(var(--sgbc-icon-area-size, 18px) / -2); }
.info-head { display: flex; align-items: center; gap: 6px; min-width: 0; }
.info-head .name { flex: 1; }
.info-layout .icon-area { overflow: visible; }
.info-layout .badge { width: 9px; height: 9px; right: -3px; bottom: -1px; --mdc-icon-size: 9px; box-shadow: none; }
.info-layout .values { align-items: baseline; overflow: hidden; }
.info-layout .value-1 {
  align-items: baseline;
  font-size: var(--sgbc-value-1-size, clamp(13px, 19cqi, 24px));
  font-weight: var(--sgbc-value-1-weight, 400);
  line-height: 1.15;
  color: var(--sgbc-value-1-color, var(--sgbc-value-color, var(--primary-text-color)));
}
.info-layout .value-2 { font-size: var(--sgbc-value-2-size, var(--sgbc-values-size, 12px)); }

/* ---- info designs: tile (modern mini tile), ring (status ring), compact (status tile) */
.content.idesign {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 0;
  padding: var(--sgbc-padding, 12px 14px);
}
.idesign .info.hidden { display: none; }
.idesign .i-titles { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1 1 auto; }
.idesign .name { font-size: var(--sgbc-name-size, clamp(12px, 9cqi, 14px)); line-height: 1.2; }
.idesign .values { overflow: hidden; align-items: baseline; }
.idesign .value-1 {
  align-items: baseline;
  font-weight: var(--sgbc-value-1-weight, 700);
  letter-spacing: -0.01em;
  line-height: 1.1;
  color: var(--sgbc-value-1-color, var(--sgbc-value-color, var(--primary-text-color)));
}
.idesign .value-1 .unit { font-size: 0.55em; font-weight: 500; margin-left: 4px; }
.idesign .icon-area { overflow: visible; }
.idesign .badge { width: 10px; height: 10px; right: -2px; bottom: -1px; --mdc-icon-size: 10px; box-shadow: none; }
.status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  font-size: 12px;
  line-height: 1.2;
  color: var(--secondary-text-color);
  white-space: nowrap;
}
.status.hidden { display: none; }
.status .status-label { overflow: hidden; text-overflow: ellipsis; }
.status-dot-mark { flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--sgbc-level-color, var(--sgbc-accent)); }
.status-dot-mark.hidden, .status-icon.hidden { display: none; }
.status-icon { flex: none; display: inline-flex; --mdc-icon-size: 12px; width: 12px; height: 12px; color: var(--sgbc-level-color, var(--sgbc-accent)); }

/* tile: [icon | name + status] on top, large value below, graph at the bottom */
.idesign-tile .i-top { display: flex; align-items: center; gap: clamp(8px, 4cqi, 12px); min-width: 0; }
.idesign-tile .values { margin-top: clamp(4px, 3cqi, 10px); padding-left: 2px; }
.idesign-tile .value-1 { font-size: var(--sgbc-value-1-size, clamp(20px, 13cqi, 34px)); }

/* ring: icon inside a ring that fills with the value */
.idesign-ring .i-row { display: flex; align-items: center; gap: clamp(8px, 5cqi, 14px); min-width: 0; }
.idesign-ring .icon-wrap { padding: 5px; }
.idesign-ring .ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; }
.idesign-ring .ring circle { fill: none; stroke-width: 7; }
.idesign-ring .ring-track { stroke: color-mix(in srgb, var(--sgbc-accent) 18%, transparent); }
.idesign-ring .ring-arc { stroke: var(--sgbc-accent); stroke-linecap: round; transition: stroke-dasharray 400ms ease; }
.idesign-ring .i-titles { gap: 1px; }
.idesign-ring .name { font-size: var(--sgbc-name-size, clamp(11px, 7.5cqi, 13px)); }
.idesign-ring .value-1 { font-size: var(--sgbc-value-1-size, clamp(17px, 10cqi, 24px)); }
.idesign-ring .status { display: none; }

/* compact: everything centered, background follows the status color */
.content.idesign-compact { align-items: center; text-align: center; gap: 3px; }
.idesign-compact .name { font-size: var(--sgbc-name-size, 12px); text-align: center; max-width: 100%; }
.idesign-compact .icon-area.shape-rounded-square { border-radius: 8px; }
.idesign-compact .values { justify-content: center; max-width: 100%; margin-top: 2px; }
.idesign-compact .value-1 { font-size: var(--sgbc-value-1-size, clamp(14px, 15cqi, 20px)); }
.idesign-compact .value-1 .unit { margin-left: 2px; }
.idesign-compact .status { font-size: 11px; justify-content: center; max-width: 100%; }
ha-card.sgbc.design-compact.variant-info { border-color: color-mix(in srgb, var(--sgbc-accent) 22%, var(--divider-color, transparent)); }

/* ---- large value on the right (hero) */
ha-card.sgbc.design-subtle, ha-card.sgbc.design-split, ha-card.sgbc.design-badge, ha-card.sgbc.design-sparkline, ha-card.sgbc.design-panel { container-type: inline-size; }
.content.has-hero { grid-template-columns: auto minmax(0, 1fr) auto; }
.content.has-hero.no-icon { grid-template-columns: minmax(0, 1fr) auto; }
.hero {
  max-width: 48cqi;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 0;
  line-height: 1.1;
  text-align: right;
}
.hero.hidden, .hero-caption.hidden { display: none; }
.hero-value {
  font-size: var(--sgbc-hero-size, clamp(15px, 5.2cqi, 21px));
  font-weight: 700;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
  white-space: nowrap;
  color: var(--sgbc-hero-color, var(--sgbc-accent, var(--primary-color)));
}
.hero-caption { margin-top: 1px; font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; }
.hero.hero-badge {
  align-items: center;
  padding: 4px clamp(8px, 2.8cqi, 12px) 3px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--sgbc-hero-color, var(--sgbc-accent, var(--primary-color))) 68%, #000);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--sgbc-accent, #000) 25%, transparent);
}
.hero.hero-badge .hero-value { color: #fff; font-size: var(--sgbc-hero-size, clamp(14px, 4.6cqi, 18px)); }
.hero.hero-badge .hero-caption { color: rgba(255, 255, 255, 0.92); margin-top: 0; }
/* value in a softly tinted box ("11 W") */
.hero.hero-box {
  align-items: center;
  padding: 6px clamp(8px, 3cqi, 14px);
  border-radius: 10px;
  background: color-mix(in srgb, var(--sgbc-hero-color, var(--sgbc-accent, var(--primary-color))) 14%, transparent);
}
.hero.hero-box .hero-value {
  font-size: var(--sgbc-hero-size, clamp(14px, 4.8cqi, 18px));
  color: var(--sgbc-hero-color, color-mix(in srgb, var(--sgbc-accent, var(--primary-color)) 62%, var(--primary-text-color)));
}
.hero.hero-box .hero-caption { margin-top: 0; }
ha-card.sgbc.design-double .hero.hero-box { padding: 10px clamp(12px, 3.6cqi, 18px); border-radius: 12px; }
ha-card.sgbc.design-double .hero.hero-box .hero-value { font-size: var(--sgbc-hero-size, clamp(16px, 5.6cqi, 24px)); }
/* double height: larger value */
ha-card.sgbc.design-double .hero-value { font-size: var(--sgbc-hero-size, clamp(17px, 6.4cqi, 28px)); }
ha-card.sgbc.design-double .hero-caption { margin-top: 2px; font-size: 13px; }
ha-card.sgbc.design-double .hero.hero-badge { padding: 7px clamp(10px, 3.4cqi, 16px) 6px; border-radius: 12px; }
ha-card.sgbc.design-double .hero.hero-badge .hero-value { font-size: var(--sgbc-hero-size, clamp(16px, 5.4cqi, 24px)); }
ha-card.sgbc.design-double .hero.hero-badge .hero-caption { margin-top: 1px; }

/* ---- status dot in front of the first value ("● Ein") */
.values.status-dot .value-1::before {
  content: "";
  flex: none;
  width: 7px;
  height: 7px;
  margin-right: 2px;
  border-radius: 50%;
  background: var(--sgbc-accent, var(--primary-color));
}
ha-card.sgbc.design-double .values.status-dot .value-1::before { width: 8px; height: 8px; margin-right: 3px; }
/* status line: the state ("● Aus") keeps its width, the second value gives way */
.values.status-dot .value-1 { flex-shrink: 0; }
.values.status-dot .value-2 { flex-shrink: 1; min-width: 0; }
.values.status-dot.stacked .value { max-width: 100%; }

/* ---- designs */
.divider { display: none; z-index: 3; }
ha-card.sgbc.design-subtle .info, ha-card.sgbc.design-badge .info, ha-card.sgbc.design-split .info { gap: 2px; }
/* normal height: content uses the whole card, the graph lies behind its lower half */
/* double height: content in the upper part, graph below */
ha-card.sgbc.design-double.design-subtle .content,
ha-card.sgbc.design-double.design-badge .content { height: var(--sgbc-content-height, 76px); }
ha-card.sgbc.design-double .info { gap: 4px; }

/* 2: separate graph area under a thin line that starts below the name */
ha-card.sgbc.design-split .content { height: var(--sgbc-content-height, 44px); padding-bottom: 0; }
ha-card.sgbc.design-split .divider {
  display: block;
  inset: auto;
  top: calc(var(--sgbc-content-height, 44px) + 1px);
  left: calc(var(--sgbc-pad-left, 12px) + var(--sgbc-icon-area-size, 42px) + var(--sgbc-gap, 10px));
  right: 12px;
  height: 1px;
  border-radius: 0;
  background: var(--divider-color, rgba(127, 127, 127, 0.25));
}
ha-card.sgbc.design-split.no-icon .divider { left: var(--sgbc-pad-left, 12px); }
ha-card.sgbc.design-split .graph.pos-bottom { top: calc(var(--sgbc-content-height, 44px) + 3px); height: auto; }
/* in the flat split layout the icon sits a bit higher, aligned with name + status */
ha-card.sgbc.design-split:not(.design-double) .icon-area { width: min(var(--sgbc-icon-area-size, 42px), 34px); height: min(var(--sgbc-icon-area-size, 42px), 34px); }
ha-card.sgbc.design-split:not(.design-double) .divider { left: calc(var(--sgbc-pad-left, 12px) + min(var(--sgbc-icon-area-size, 42px), 34px) + var(--sgbc-gap, 10px)); }
ha-card.sgbc.design-split:not(.design-double) .hero-caption { display: none; }
ha-card.sgbc.design-double.design-split .content { height: var(--sgbc-content-height, 80px); padding-bottom: var(--sgbc-pad-bottom, 12px); }
ha-card.sgbc.design-double.design-split .divider {
  top: calc(var(--sgbc-content-height, 80px) + 2px);
  left: calc(var(--sgbc-pad-left, 16px) + var(--sgbc-icon-area-size, 50px) + var(--sgbc-gap, 14px));
  right: 16px;
}
ha-card.sgbc.design-double.design-split .graph.pos-bottom { top: calc(var(--sgbc-content-height, 80px) + 8px); }

/* 4: content left, thin vertical line, sparkline on the right */
ha-card.sgbc.design-sparkline .content { padding-right: calc(var(--sgbc-graph-width, 34%) + 32px); }
ha-card.sgbc.design-sparkline .info { gap: 1px; }
ha-card.sgbc.design-sparkline .graph.pos-right {
  top: 10px;
  bottom: 10px;
  right: 12px;
  width: var(--sgbc-graph-width, 34%);
  border-radius: 0;
}
ha-card.sgbc.design-sparkline .divider {
  display: block;
  inset: auto;
  top: 10px;
  bottom: 10px;
  right: calc(var(--sgbc-graph-width, 34%) + 22px);
  width: 1px;
  border-radius: 0;
  background: var(--divider-color, rgba(127, 127, 127, 0.25));
}
ha-card.sgbc.design-sparkline .values.stacked { gap: var(--sgbc-values-gap, 0px); line-height: 1.25; }
ha-card.sgbc.design-double.design-sparkline .content { padding-right: calc(var(--sgbc-graph-width, 34%) + 44px); }
ha-card.sgbc.design-double.design-sparkline .info { gap: 4px; }
ha-card.sgbc.design-double.design-sparkline .graph.pos-right { top: 18px; bottom: 18px; right: 16px; }
ha-card.sgbc.design-double.design-sparkline .divider { top: 16px; bottom: 16px; right: calc(var(--sgbc-graph-width, 34%) + 30px); }
/* 6: accent bar on the left, icon tile, name + status, line graph, value box */
ha-card.sgbc.design-panel .divider {
  display: block;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: 0;
  background: var(--sgbc-accent, var(--primary-color));
  transition: background-color 240ms ease;
}
ha-card.sgbc.design-panel .content { padding-left: calc(var(--sgbc-pad-left, 12px) + 4px); }
ha-card.sgbc.design-panel .info { gap: 2px; }
ha-card.sgbc.design-panel .icon-area.shape-rounded-square { border-radius: 10px; }
/* grid: the name spans info + graph column, so a long name runs into the graph */
.content.panel-row {
  grid-template-columns: auto minmax(0, 1fr) minmax(40px, var(--sgbc-graph-width, 34%)) auto;
  grid-template-rows: auto auto;
  align-content: center;
  row-gap: 2px;
}
.content.panel-row .info { display: contents; }
.content.panel-row .icon-wrap { grid-column: 1; grid-row: 1 / 3; }
.content.panel-row .name { grid-column: 2 / 4; grid-row: 1; align-self: end; position: relative; z-index: 1; }
.content.panel-row .values { grid-column: 2; grid-row: 2; align-self: start; position: relative; z-index: 1; }
.content.panel-row .graph.inline { grid-column: 3; grid-row: 1 / 3; }
.content.panel-row .hero { grid-column: 4; grid-row: 1 / 3; }
/* without icon / icon on the right */
.content.panel-row.no-icon, .content.panel-row.icon-right { grid-template-columns: minmax(0, 1fr) minmax(40px, var(--sgbc-graph-width, 34%)) auto auto; }
.content.panel-row.no-icon .name, .content.panel-row.icon-right .name { grid-column: 1 / 3; }
.content.panel-row.no-icon .values, .content.panel-row.icon-right .values { grid-column: 1; }
.content.panel-row.no-icon .graph.inline, .content.panel-row.icon-right .graph.inline { grid-column: 2; }
.content.panel-row.no-icon .hero, .content.panel-row.icon-right .hero { grid-column: 3; }
.content.panel-row.icon-right .icon-wrap { grid-column: 4; }
.content.panel-row .graph.inline {
  position: relative;
  inset: auto;
  width: auto;
  min-width: 0;
  height: var(--sgbc-panel-graph-height, 26px);
  border-radius: 0;
  align-self: center;
}
/* graph behind a long name: transparent in the text band, soft edge */
.content.panel-row .graph.inline.under-text {
  --sgbc-under-mask: linear-gradient(to right, rgba(0, 0, 0, 0.28) 0, rgba(0, 0, 0, 0.28) calc(var(--sgbc-text-x, 0px) - 4px), #000 calc(var(--sgbc-text-x, 0px) + 10px));
  -webkit-mask-image: var(--sgbc-under-mask), linear-gradient(#000, #000);
  mask-image: var(--sgbc-under-mask), linear-gradient(#000, #000);
  -webkit-mask-size: 100% var(--sgbc-text-y, 50%), 100% calc(100% - var(--sgbc-text-y, 50%));
  mask-size: 100% var(--sgbc-text-y, 50%), 100% calc(100% - var(--sgbc-text-y, 50%));
  -webkit-mask-position: top left, bottom left;
  mask-position: top left, bottom left;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
ha-card.sgbc.design-double .content.panel-row .graph.inline { height: var(--sgbc-panel-graph-height, 56px); }
@container (max-width: 250px) {
  .content.panel-row .graph.inline { display: none; }
  .content.panel-row { grid-template-columns: auto minmax(0, 1fr) 0 auto; }
  .content.panel-row.no-icon, .content.panel-row.icon-right { grid-template-columns: minmax(0, 1fr) 0 auto auto; }
  .content.panel-row .name, .content.panel-row .values { grid-column: 2 / 4; }
  .content.panel-row.no-icon .name, .content.panel-row.icon-right .name,
  .content.panel-row.no-icon .values, .content.panel-row.icon-right .values { grid-column: 1 / 3; }
}
.probe { display: none; }
/* readable text over a graph: soft halo in the card background color */
ha-card.sgbc.text-halo .name,
ha-card.sgbc.text-halo .values,
ha-card.sgbc.text-halo .status,
ha-card.sgbc.text-halo .hero-text .hero-value,
ha-card.sgbc.text-halo .hero-text .hero-caption {
  text-shadow: 0 0 2px var(--sgbc-halo-color, transparent), 0 0 6px var(--sgbc-halo-color, transparent);
}
.effects { z-index: 5; transition: background-color 120ms ease, box-shadow 120ms ease; }
@media (hover: hover) {
  ha-card.sgbc:not(.no-action):hover .effects { background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
}
ha-card.sgbc.pressed .effects { background: color-mix(in srgb, var(--primary-text-color) 11%, transparent); }
ha-card.sgbc:focus-visible .effects { box-shadow: inset 0 0 0 2px var(--primary-color, #03a9f4); }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.anim-pulse { animation: sgbc-pulse var(--sgbc-anim-duration, 1.5s) ease-in-out infinite; }
.anim-rotate { animation: sgbc-rotate var(--sgbc-anim-duration, 1.5s) linear infinite; }
.anim-blink { animation: sgbc-blink var(--sgbc-anim-duration, 1.5s) steps(2, start) infinite; }
@keyframes sgbc-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.86); opacity: 0.7; } }
@keyframes sgbc-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes sgbc-blink { to { visibility: hidden; } }

@media (prefers-reduced-motion: reduce) {
  .anim-pulse, .anim-rotate, .anim-blink { animation: none !important; }
  ha-card.sgbc, .state-bg, .icon-area, .effects { transition: none !important; }
}

ha-card.sgbc-error {
  display: block;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: var(--ha-card-border-radius, 12px);
  border: 1px solid var(--error-color, #db4437);
  background: color-mix(in srgb, var(--error-color, #db4437) 10%, var(--card-background-color, #fff));
  color: var(--primary-text-color);
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
ha-card.sgbc-error .title { font-weight: 600; color: var(--error-color, #db4437); margin-bottom: 4px; }
`;
return { CARD_STYLES };
})();

// ---- src/utils.js
const __m_utils_js = (() => {
/**
 * Small shared helpers without DOM dependencies.
 */

const NUMERIC_RE = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;

/**
 * Strictly parse a value to a finite number.
 * Returns null for null/undefined/booleans/objects, non-numeric strings,
 * "unavailable", "unknown", NaN and ±Infinity.
 */
function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (s === "" || !NUMERIC_RE.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** True when a value can be shown to the user without leaking undefined/null/NaN/Infinity. */
function isDisplayable(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "object") return false;
  const s = String(value).trim();
  if (s === "") return false;
  return !/^(undefined|null|nan|[-+]?infinity)$/i.test(s);
}

/** Escape text for safe use inside HTML/SVG markup (text and attribute values). */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CSS_LENGTH_RE = /^-?(\d+\.?\d*|\.\d+)(px|%|em|rem|vh|vw|vmin|vmax|ch|ex)?$/i;
const CSS_FUNC_RE = /^(var|calc|min|max|clamp)\(.*\)$/i;

/** Validate/normalise a CSS length. Numbers become px. Returns null when invalid. */
function toCssLength(value) {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (CSS_LENGTH_RE.test(s)) return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? `${s}px` : s;
  if (CSS_FUNC_RE.test(s) && !/[;{}<>]/.test(s)) return s;
  return null;
}

/** Validate a CSS shorthand made of up to 4 lengths (e.g. padding "8px 12px"). */
function toCssBoxLength(value) {
  if (typeof value === "number") return toCssLength(value);
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (CSS_FUNC_RE.test(s) && !/[;{}<>]/.test(s)) return s;
  const parts = s.split(/\s+/);
  if (parts.length < 1 || parts.length > 4) return null;
  const out = parts.map(toCssLength);
  return out.every(Boolean) ? out.join(" ") : null;
}

/**
 * Left/right part of a CSS padding shorthand ("8px 12px" -> right "12px",
 * left "12px"). Function values (var/calc) are returned unchanged.
 */
function paddingSide(padding, side) {
  if (typeof padding !== "string" || padding.trim() === "") return "0px";
  const s = padding.trim();
  if (s.includes("(")) return s;
  const p = s.split(/\s+/);
  if (side === "left") return p[3] ?? p[1] ?? p[0];
  if (side === "top") return p[0];
  if (side === "bottom") return p[2] ?? p[0];
  return p[1] ?? p[0];
}

/** Parse a CSS length in px (only px or unitless). Returns null otherwise. */
function cssLengthToPx(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const m = /^(-?\d+\.?\d*|-?\.\d+)(px)?$/i.exec(value.trim());
  return m ? Number(m[1]) : null;
}

/** Very small check that a value is usable as a CSS color/token (no injection characters). */
function isSafeCssValue(value) {
  return typeof value === "string" && value.trim() !== "" && !/[;{}<>]/.test(value) && value.length < 300;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Deep clone of plain objects and arrays (other values are returned as-is). */
function deepClone(value) {
  if (Array.isArray(value)) return value.map(deepClone);
  if (isPlainObject(value)) {
    const out = {};
    for (const key of Object.keys(value)) out[key] = deepClone(value[key]);
    return out;
  }
  return value;
}

/**
 * Deep merge for plain objects; arrays and primitives from `override` replace
 * `base`. Always returns a fresh structure (inputs are never mutated/shared).
 */
function mergeDeep(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return deepClone(override === undefined ? base : override);
  const out = deepClone(base);
  for (const key of Object.keys(override)) {
    const v = override[key];
    if (v === undefined) continue;
    out[key] = isPlainObject(v) && isPlainObject(out[key]) ? mergeDeep(out[key], v) : deepClone(v);
  }
  return out;
}

/** Clamp a number into [min, max]. */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
return { parseNumber, isDisplayable, escapeHtml, toCssLength, toCssBoxLength, paddingSide, cssLengthToPx, isSafeCssValue, isPlainObject, deepClone, mergeDeep, clamp };
})();

// ---- src/state-resolver.js
const __m_state_resolver_js = (() => {
/**
 * State evaluation: state groups (on/off/unavailable), custom state rules,
 * threshold ranges and color resolution.
 *
 * Pure module – no DOM access, fully testable in Node.
 */
const { parseNumber } = __m_utils_js;

const DEFAULT_STATE_MAPPING = Object.freeze({
  on: ["on", "open", "opening", "playing", "home", "heating", "cooling", "unlocked", "active", "cleaning"],
  off: ["off", "closed", "closing", "idle", "not_home", "locked", "paused", "standby", "docked"],
  unavailable: ["unavailable", "unknown"],
});

const STATE_GROUPS = ["on", "off", "unavailable", "other"];

const OPERATORS = ["==", "!=", ">", ">=", "<", "<=", "contains", "regex"];

const regexCache = new Map();

/** Normalise any state value to a comparable string. */
function normalizeState(value, caseSensitive = false) {
  if (value === null || value === undefined) return "";
  const s = String(value).trim();
  return caseSensitive ? s : s.toLowerCase();
}

/**
 * Determine the state group of a raw state.
 * Missing state (entity not found) => "unavailable".
 * States not contained in any group => "other".
 */
function getStateGroup(state, mapping = DEFAULT_STATE_MAPPING, caseSensitive = false) {
  if (state === null || state === undefined) return "unavailable";
  const s = normalizeState(state, caseSensitive);
  const map = mapping || DEFAULT_STATE_MAPPING;
  for (const group of ["unavailable", "on", "off"]) {
    const list = Array.isArray(map[group]) ? map[group] : [];
    for (const entry of list) {
      if (normalizeState(entry, caseSensitive) === s) return group;
    }
  }
  return "other";
}

function isUnavailableState(state) {
  if (state === null || state === undefined) return true;
  const s = normalizeState(state);
  return s === "unavailable" || s === "unknown";
}

function getRegex(pattern, caseSensitive) {
  const key = `${caseSensitive ? "s" : "i"}:${pattern}`;
  if (regexCache.has(key)) return regexCache.get(key);
  let re = null;
  try {
    re = new RegExp(String(pattern), caseSensitive ? "" : "i");
  } catch (_err) {
    re = null;
  }
  if (regexCache.size > 200) regexCache.clear();
  regexCache.set(key, re);
  return re;
}

/**
 * Compare a state against a value with the given operator.
 * ==, != compare numerically when both sides are numeric, otherwise as strings.
 * >, >=, <, <= require both sides to be numeric (otherwise false).
 */
function compareState(operator, state, value, caseSensitive = false) {
  const a = parseNumber(state);
  const b = parseNumber(value);
  const bothNumeric = a !== null && b !== null;
  switch (operator) {
    case "==":
      return bothNumeric ? a === b : normalizeState(state, caseSensitive) === normalizeState(value, caseSensitive);
    case "!=":
      return bothNumeric ? a !== b : normalizeState(state, caseSensitive) !== normalizeState(value, caseSensitive);
    case ">":
      return bothNumeric && a > b;
    case ">=":
      return bothNumeric && a >= b;
    case "<":
      return bothNumeric && a < b;
    case "<=":
      return bothNumeric && a <= b;
    case "contains":
      return normalizeState(state, caseSensitive).includes(normalizeState(value, caseSensitive));
    case "regex": {
      if (state === null || state === undefined) return false;
      const re = getRegex(value, caseSensitive);
      return re ? re.test(String(state)) : false;
    }
    default:
      return false;
  }
}

/**
 * Return the first custom state rule that matches, or null.
 * Rule: { operator, value, class?, color?, attribute?, entity? }
 * `resolveSource(rule)` may return a different raw value (entity/attribute).
 */
function matchCustomState(state, rules, { caseSensitive = false, resolveSource } = {}) {
  if (!Array.isArray(rules)) return null;
  for (const rule of rules) {
    if (!rule) continue;
    const source = typeof resolveSource === "function" ? resolveSource(rule, state) : state;
    if (compareState(rule.operator || "==", source, rule.value, caseSensitive)) return rule;
  }
  return null;
}

/**
 * Normalise threshold definitions into ranges [{from, to, color}].
 * Accepted inputs:
 *   - [{ value, color }, ...]          (value list, sorted ascending; from = value, to = next value)
 *   - [{ from, to, color }, ...]       (explicit ranges)
 *   - { ranges: [...] }                (top-level `thresholds` block)
 * Semantics: `from` inclusive, `to` exclusive, missing `to` = open upwards,
 * missing `from` = open downwards. First matching range wins.
 */
function normalizeThresholdRanges(input) {
  const list = Array.isArray(input) ? input : Array.isArray(input?.ranges) ? input.ranges : [];
  if (list.length === 0) return [];
  const isValueList = list.every((t) => t && t.value !== undefined && t.from === undefined && t.to === undefined);
  if (isValueList) {
    const sorted = list
      .map((t) => ({ value: parseNumber(t.value), color: t.color }))
      .filter((t) => t.value !== null)
      .sort((x, y) => x.value - y.value);
    return sorted.map((t, i) => ({
      from: t.value,
      to: i < sorted.length - 1 ? sorted[i + 1].value : null,
      color: t.color,
    }));
  }
  return list
    .filter(Boolean)
    .map((t) => ({
      from: t.from === undefined || t.from === null ? null : parseNumber(t.from),
      to: t.to === undefined || t.to === null ? null : parseNumber(t.to),
      color: t.color,
    }));
}

/** Return the color of the first range containing `value`, or null. */
function findThresholdColor(value, ranges) {
  const n = parseNumber(value);
  if (n === null || !Array.isArray(ranges)) return null;
  for (const r of ranges) {
    const fromOk = r.from === null || r.from === undefined || n >= r.from;
    const toOk = r.to === null || r.to === undefined || n < r.to;
    if (fromOk && toOk) return r.color ?? null;
  }
  return null;
}

/**
 * Resolve a color from a map keyed by state group / custom class.
 * Lookup order: custom class -> group -> (other => default -> on) -> default.
 * A plain string is returned as-is.
 */
function resolveColor(map, group, customClass) {
  if (map === null || map === undefined) return null;
  if (typeof map === "string") return map;
  if (typeof map !== "object") return null;
  if (customClass && map[customClass] !== undefined) return map[customClass];
  if (group && map[group] !== undefined) return map[group];
  // YAML 1.1 turns unquoted on/off keys into true/false
  if (group === "on" && map.true !== undefined) return map.true;
  if (group === "off" && map.false !== undefined) return map.false;
  if (group === "other") return map.default ?? map.on ?? null;
  return map.default ?? null;
}
return { DEFAULT_STATE_MAPPING, STATE_GROUPS, OPERATORS, normalizeState, getStateGroup, isUnavailableState, compareState, matchCustomState, normalizeThresholdRanges, findThresholdColor, resolveColor };
})();

// ---- src/graph-renderer.js
const __m_graph_renderer_js = (() => {
/**
 * Native SVG graph renderer. Produces an SVG markup string from reduced data.
 * All dynamic values are numbers or escaped strings – no injection possible.
 *
 * Pure module – no DOM access.
 */
const { escapeHtml, isDisplayable } = __m_utils_js;

const GRAPH_TYPES = ["line", "area", "smooth-area", "bar", "column", "stepped", "line-bar", "smooth-line-bar"];

const r2 = (n) => Math.round(n * 100) / 100;
const r4 = (n) => Math.round(n * 10000) / 10000;

/**
 * Compute the y-axis range.
 * - manual min/max win (numbers), "auto" otherwise
 * - constant values get a symmetric padding
 * - bar-like graphs include the zero baseline when auto
 */
function computeScale(values, { min = "auto", max = "auto", includeZero = false, headroom = 0.05 } = {}) {
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
  } else {
    const span = hi - lo;
    const room = Number.isFinite(headroom) ? Math.max(0, Math.min(2, headroom)) : 0.05;
    if (!manualMax) hi += span * room; // space above the highest value
    // a little space below the lowest value as well when there is more headroom
    if (!manualMin && !includeZero && room > 0.05) lo -= span * room * 0.25;
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
function smoothPath(pts) {
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
function renderGraphSVG(o) {
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
  const scale = computeScale(values, { min: o.min, max: o.max, includeZero: filled && !bottomBase, headroom: o.headroom });

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
return { GRAPH_TYPES, computeScale, smoothPath, renderGraphSVG };
})();

// ---- src/data-reducer.js
const __m_data_reducer_js = (() => {
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

const AGGREGATIONS = ["average", "min", "max", "last", "sum"];
const FILL_MODES = ["hold", "gap"];

/**
 * @param {Array<{t:number,v:number|null}>} points sorted ascending by t
 * @param {{start:number,end:number,buckets:number,aggregation?:string,fill?:string}} opts
 * @returns {Array<{t:number,start:number,end:number,v:number|null}>}
 */
function reduceSeries(points, { start, end, buckets, aggregation = "average", fill = "hold" } = {}) {
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
function appendPoint(points, point, keepFrom) {
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
return { AGGREGATIONS, FILL_MODES, reduceSeries, appendPoint };
})();

// ---- src/action-handler.js
const __m_action_handler_js = (() => {
/**
 * Gesture recognition (tap / hold / double-tap) and execution of
 * Home Assistant actions.
 *
 * GestureRecognizer is pure (injectable timers) and unit-tested.
 * bindActionHandler wires it to DOM pointer + keyboard events.
 * handleAction executes an action config using public hass APIs only.
 */

const ACTIONS = ["more-info", "toggle", "navigate", "url", "perform-action", "call-service", "assist", "fire-dom-event", "none"];

const DEFAULT_HOLD_TIME = 500;
const DEFAULT_DOUBLE_TAP_WINDOW = 250;
const MOVE_TOLERANCE = 12; // px – larger movement cancels (scrolling)

function hasAction(actionConfig) {
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
class GestureRecognizer {
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
function bindActionHandler(element, recognizer, { onPressChange = () => {} } = {}) {
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
function getToggleService(entityId, stateObj) {
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

function isToggleableDomain(entityId) {
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
async function handleAction(node, hass, config, gesture) {
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
return { ACTIONS, DEFAULT_HOLD_TIME, DEFAULT_DOUBLE_TAP_WINDOW, hasAction, GestureRecognizer, bindActionHandler, getToggleService, isToggleableDomain, handleAction };
})();

// ---- src/value-formatter.js
const __m_value_formatter_js = (() => {
/**
 * Value formatting: numbers, dates, units, state mapping and a safe,
 * restricted template syntax. No eval(), no Function().
 *
 * Pure module – no DOM access.
 */
const { parseNumber, isDisplayable } = __m_utils_js;
const { isUnavailableState, normalizeThresholdRanges, findThresholdColor, resolveColor, normalizeState } = __m_state_resolver_js;

const DEFAULT_FALLBACK = "–";

const VALUE_TYPES = ["state", "attribute", "text", "name", "last_changed", "last_updated", "template"];
const VALUE_FORMATS = ["number", "integer", "duration", "relative", "datetime", "date", "time"];

const numberFormatCache = new Map();

/**
 * Determine the locale used for number formatting from the hass object,
 * honouring the user's "number format" profile setting where possible.
 */
function getNumberLocale(hass) {
  const language = hass?.locale?.language || hass?.language || undefined;
  switch (hass?.locale?.number_format) {
    case "comma_decimal":
      return "en-US";
    case "decimal_comma":
      return "de-DE";
    case "space_comma":
      return "fr-FR";
    case "system":
      return undefined;
    default:
      return language;
  }
}

function getLanguage(hass) {
  return hass?.locale?.language || hass?.language || undefined;
}

/**
 * Format a number. Returns null when the value is not a finite number.
 * decimals: integer => fixed digits; undefined => up to 2 digits.
 */
function formatNumber(value, { decimals, locale } = {}) {
  let n = parseNumber(value);
  if (n === null) return null;
  const fixed = Number.isInteger(decimals) && decimals >= 0 && decimals <= 20;
  const key = `${locale || ""}|${fixed ? decimals : "a"}`;
  let nf = numberFormatCache.get(key);
  if (!nf) {
    const opts = fixed
      ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
      : { maximumFractionDigits: 2 };
    try {
      nf = new Intl.NumberFormat(locale || undefined, opts);
    } catch (_err) {
      nf = new Intl.NumberFormat(undefined, opts);
    }
    numberFormatCache.set(key, nf);
  }
  // Avoid "-0" / "-0,00" after rounding.
  const digits = fixed ? decimals : 2;
  if (Number(n.toFixed(digits)) === 0) n = 0;
  const out = nf.format(n);
  return isDisplayable(out) ? out : null;
}

/** Format seconds as h:mm:ss (or m:ss below one hour). */
function formatDuration(seconds) {
  const n = parseNumber(seconds);
  if (n === null) return null;
  const neg = n < 0;
  let s = Math.round(Math.abs(n));
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  const pad = (x) => String(x).padStart(2, "0");
  const body = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  return neg ? `-${body}` : body;
}

function toDate(value) {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  if (typeof value !== "string" || value.trim() === "") return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? new Date(t) : null;
}

/** Relative time ("vor 5 Minuten"). */
function formatRelative(value, locale, now = Date.now()) {
  const d = toDate(value);
  if (!d) return null;
  const diff = (d.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  let rtf;
  try {
    rtf = new Intl.RelativeTimeFormat(locale || undefined, { numeric: "auto" });
  } catch (_err) {
    rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  }
  for (const [unit, secs] of units) {
    if (abs >= secs || unit === "second") {
      return rtf.format(Math.round(diff / secs), unit);
    }
  }
  return null;
}

/** Absolute date/time formatting. kind: datetime | date | time */
function formatDate(value, kind, locale) {
  const d = toDate(value);
  if (!d) return null;
  const opts =
    kind === "date"
      ? { dateStyle: "medium" }
      : kind === "time"
        ? { timeStyle: "short" }
        : { dateStyle: "medium", timeStyle: "short" };
  try {
    return new Intl.DateTimeFormat(locale || undefined, opts).format(d);
  } catch (_err) {
    return new Intl.DateTimeFormat(undefined, opts).format(d);
  }
}

const TEMPLATE_RE = /\{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*:\s*([^{}]*?))?\s*\}/g;

/**
 * Render a restricted template. Only `{variable}` and `{variable:argument}`
 * placeholders are replaced via the supplied resolver (object or function).
 * Unknown/empty placeholders become an empty string. No code execution.
 */
function renderTemplate(template, resolver) {
  if (typeof template !== "string") return "";
  return template.replace(TEMPLATE_RE, (_match, key, arg) => {
    const k = key.toLowerCase();
    let v;
    if (typeof resolver === "function") v = resolver(k, arg === undefined ? undefined : arg.trim());
    else if (resolver && Object.prototype.hasOwnProperty.call(resolver, k)) v = resolver[k];
    return isDisplayable(v) ? String(v) : "";
  });
}

/** True when a template string contains at least one placeholder. */
function isTemplate(value) {
  if (typeof value !== "string") return false;
  TEMPLATE_RE.lastIndex = 0;
  const result = TEMPLATE_RE.test(value);
  TEMPLATE_RE.lastIndex = 0;
  return result;
}

/** Look up a state mapping case-insensitively. Returns undefined when absent. */
function lookupStateMapping(mapping, raw, caseSensitive = false) {
  if (!mapping || typeof mapping !== "object" || raw === null || raw === undefined) return undefined;
  const key = normalizeState(raw, caseSensitive);
  for (const k of Object.keys(mapping)) {
    if (normalizeState(k, caseSensitive) === key) return mapping[k];
  }
  return undefined;
}

function joinUnit(text, unit) {
  if (!isDisplayable(unit)) return text;
  return `${text} ${unit}`;
}

function attributeToText(value) {
  if (Array.isArray(value)) {
    const parts = value.filter(isDisplayable).map(String);
    return parts.length ? parts.join(", ") : null;
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  return isDisplayable(value) ? String(value) : null;
}

function resolveUnit(cfg, stateObj) {
  const entityUnit = cfg.type === "attribute" ? undefined : stateObj?.attributes?.unit_of_measurement;
  if (cfg.use_entity_unit === true) return isDisplayable(entityUnit) ? entityUnit : cfg.unit;
  if (cfg.use_entity_unit === false) return cfg.unit;
  return cfg.unit !== undefined ? cfg.unit : entityUnit;
}

/**
 * Resolve a value definition (value_1 / value_2) to display data.
 *
 * @param {object} cfg    normalised value config
 * @param {object} hass   Home Assistant object
 * @param {object} ctx    { entityId, group, unavailableText, unknownText, now }
 * @returns {{hidden:boolean, text:string, color:string|null, numeric:number|null,
 *            unavailable:boolean, aria:string, entityId:string|undefined, isState:boolean}}
 */
function resolveValue(cfg, hass, ctx = {}) {
  const fallback = isDisplayable(cfg?.fallback) || cfg?.fallback === "" ? String(cfg.fallback) : DEFAULT_FALLBACK;
  const empty = (extra = {}) => ({
    hidden: false,
    text: fallback,
    color: null,
    numeric: null,
    unavailable: true,
    aria: cfg?.label ? `${cfg.label} ${fallback}` : fallback,
    entityId: undefined,
    isState: false,
    ...extra,
  });
  if (!cfg) return empty({ hidden: true });

  const type = cfg.type || "state";
  const entityId = cfg.entity || ctx.entityId;
  const stateObj = entityId ? hass?.states?.[entityId] : undefined;
  const locale = getNumberLocale(hass);
  const language = getLanguage(hass);
  const entityBased = type !== "text";
  const rawState = stateObj?.state;
  const unavailable = entityBased && (!stateObj || isUnavailableState(rawState));

  if (cfg.hide_if_unavailable && unavailable) return empty({ hidden: true, entityId });

  let raw;
  switch (type) {
    case "text":
      raw = cfg.text;
      break;
    case "name":
      raw = stateObj ? stateObj.attributes?.friendly_name ?? entityId : undefined;
      break;
    case "last_changed":
      raw = stateObj?.last_changed;
      break;
    case "last_updated":
      raw = stateObj?.last_updated;
      break;
    case "attribute":
      raw = stateObj?.attributes?.[cfg.attribute];
      break;
    case "template":
      raw = cfg.attribute ? stateObj?.attributes?.[cfg.attribute] : rawState;
      break;
    default:
      raw = rawState;
  }

  const numeric = parseNumber(raw);
  const unit = resolveUnit(cfg, stateObj);
  let valueText = null; // formatted value without unit
  let withUnit = null; // formatted value with unit (when applicable)

  const mapped = lookupStateMapping(cfg.state_mapping, raw);
  if (mapped !== undefined && isDisplayable(mapped)) {
    valueText = String(mapped);
    withUnit = valueText;
  } else if (type === "text") {
    valueText = isDisplayable(raw) ? String(raw) : null;
    withUnit = valueText;
  } else if (type === "name") {
    valueText = isDisplayable(raw) ? String(raw) : null;
    withUnit = valueText;
  } else if (type === "last_changed" || type === "last_updated" || ["relative", "datetime", "date", "time"].includes(cfg.format)) {
    const kind = cfg.format && cfg.format !== "number" && cfg.format !== "integer" && cfg.format !== "duration" ? cfg.format : "relative";
    valueText = kind === "relative" ? formatRelative(raw, language, ctx.now) : formatDate(raw, kind, language);
    withUnit = valueText;
  } else if (unavailable && (type === "state" || type === "template")) {
    const s = normalizeState(rawState);
    if (!stateObj) valueText = null;
    else if (s === "unknown" && isDisplayable(cfg.unknown_text ?? ctx.unknownText)) valueText = String(cfg.unknown_text ?? ctx.unknownText);
    else if (s === "unavailable" && isDisplayable(cfg.unavailable_text ?? ctx.unavailableText)) valueText = String(cfg.unavailable_text ?? ctx.unavailableText);
    else if (typeof hass?.formatEntityState === "function") valueText = safeCall(() => hass.formatEntityState(stateObj));
    else valueText = isDisplayable(rawState) ? String(rawState) : null;
    withUnit = valueText;
  } else if (numeric !== null) {
    if (cfg.format === "duration") {
      valueText = formatDuration(numeric);
      withUnit = valueText;
    } else {
      let decimals = cfg.format === "integer" ? 0 : cfg.decimals;
      if (decimals === undefined && type === "state") {
        const precision = hass?.entities?.[entityId]?.display_precision;
        if (Number.isInteger(precision)) decimals = precision;
      }
      valueText = formatNumber(numeric, { decimals, locale });
      withUnit = valueText === null ? null : joinUnit(valueText, unit);
    }
  } else if (type === "attribute") {
    if (raw !== undefined && typeof hass?.formatEntityAttributeValue === "function" && cfg.raw !== true) {
      valueText = safeCall(() => hass.formatEntityAttributeValue(stateObj, cfg.attribute));
    }
    if (!isDisplayable(valueText)) valueText = attributeToText(raw);
    withUnit = valueText === null ? null : joinUnit(valueText, cfg.unit);
  } else if (stateObj) {
    if (cfg.raw !== true && typeof hass?.formatEntityState === "function") {
      valueText = safeCall(() => hass.formatEntityState(stateObj));
    }
    if (!isDisplayable(valueText)) valueText = isDisplayable(raw) ? String(raw) : null;
    withUnit = valueText;
  }

  let text;
  if (cfg.template) {
    const vars = (key, arg) => {
      switch (key) {
        case "value":
          return valueText;
        case "unit":
          return unit;
        case "state": {
          const m = lookupStateMapping(cfg.state_mapping, rawState);
          if (m !== undefined) return m;
          if (stateObj && typeof hass?.formatEntityState === "function") return safeCall(() => hass.formatEntityState(stateObj));
          return rawState;
        }
        case "raw":
          return raw;
        case "name":
        case "friendly_name":
          return stateObj?.attributes?.friendly_name ?? entityId;
        case "entity_id":
          return entityId;
        case "attribute":
          return attributeToText(stateObj?.attributes?.[cfg.attribute]);
        case "attr":
          return arg ? attributeToText(stateObj?.attributes?.[arg]) : null;
        case "last_changed":
          return formatRelative(stateObj?.last_changed, language, ctx.now);
        case "last_updated":
          return formatRelative(stateObj?.last_updated, language, ctx.now);
        default:
          return null;
      }
    };
    const rendered = renderTemplate(cfg.template, vars).trim();
    text = rendered === "" ? null : rendered;
  } else {
    text = isDisplayable(withUnit) ? withUnit : null;
  }

  if (!isDisplayable(text)) return empty({ entityId, hidden: false, isState: type === "state" });

  const full = `${cfg.prefix ?? ""}${text}${cfg.suffix ?? ""}`;

  let color = null;
  if (cfg.thresholds) {
    color = findThresholdColor(numeric, normalizeThresholdRanges(cfg.thresholds));
  }
  if (!color && cfg.color) color = resolveColor(cfg.color, ctx.group, ctx.customClass);

  return {
    hidden: false,
    text: full,
    color,
    numeric,
    unavailable,
    aria: cfg.label ? `${cfg.label} ${full}` : full,
    entityId,
    isState: type === "state" && !cfg.template,
  };
}

function safeCall(fn) {
  try {
    const v = fn();
    return isDisplayable(v) ? String(v) : null;
  } catch (_err) {
    return null;
  }
}
return { DEFAULT_FALLBACK, VALUE_TYPES, VALUE_FORMATS, getNumberLocale, getLanguage, formatNumber, formatDuration, formatRelative, formatDate, renderTemplate, isTemplate, lookupStateMapping, resolveValue };
})();

// ---- src/history-provider.js
const __m_history_provider_js = (() => {
/**
 * History data access – the ONLY place that talks to Home Assistant's
 * history interfaces.
 *
 * Primary source (stable since HA 2022.x, used by HA's own frontend):
 *   WebSocket command "history/history_during_period"
 *   -> { [entity_id]: [ { s, a?, lu, lc? }, ... ] }   (compressed state format,
 *      lu / lc are epoch seconds; lc is omitted when equal to lu)
 *
 * Fallback (REST, documented in the HA REST API docs):
 *   GET /api/history/period/<start>?filter_entity_id=..&end_time=..
 *   -> [ [ { entity_id, state, attributes, last_changed, last_updated }, ... ] ]
 *
 * NOTE: The WebSocket command is used by the official frontend but is not part
 * of a formally versioned public API. Its response shape is therefore parsed
 * defensively, and any failure falls back to REST and finally to an empty
 * series – the card stays usable without a graph.
 *
 * Neither hass.callWS nor hass.callApi support AbortSignal. Stale responses
 * are therefore discarded by the caller (request token), identical requests
 * are de-duplicated (in-flight map) and results are cached.
 */
const { parseNumber, isPlainObject } = __m_utils_js;

const CACHE = new Map();
const INFLIGHT = new Map();
const MAX_CACHE_ENTRIES = 60;
let websocketUnsupported = false;

const MIN_UPDATE_INTERVAL = 10; // seconds

/** Cache key: entity, attribute, start, end, period (hours) and resolution. */
function buildCacheKey({ entityId, attribute, start, end, hours, resolution }) {
  return [entityId, attribute || "", start, end, hours, resolution || ""].join("|");
}

/**
 * Compute a request window aligned to the refresh granularity so that several
 * cards showing the same entity share one request and one cache entry.
 */
function computeWindow(hours, granularitySeconds, now = Date.now()) {
  const gran = Math.max(MIN_UPDATE_INTERVAL, Number(granularitySeconds) || MIN_UPDATE_INTERVAL) * 1000;
  const end = Math.ceil(now / gran) * gran;
  const start = end - hours * 3600 * 1000;
  return { start, end, ttl: gran };
}

function toMs(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value * 1000 : NaN;
  if (typeof value === "string") return Date.parse(value);
  return NaN;
}

function valueOf(state, attributes, attribute) {
  if (attribute) return parseNumber(attributes?.[attribute]);
  return parseNumber(state);
}

/**
 * Parse either response format into sorted points [{t, v}].
 * Non-numeric / unavailable / unknown / null values become v = null (gap marker).
 */
function parseHistoryResponse(raw, entityId, attribute) {
  const points = [];
  if (!raw) return points;

  if (isPlainObject(raw) && Array.isArray(raw[entityId])) {
    // WebSocket compressed format
    let lastAttrs;
    for (const e of raw[entityId]) {
      if (!e) continue;
      if (isPlainObject(e.a)) lastAttrs = e.a;
      const isCompressed = "s" in e || "lu" in e;
      const state = isCompressed ? e.s : e.state;
      const attrs = isCompressed ? (isPlainObject(e.a) ? e.a : lastAttrs) : e.attributes;
      let t;
      if (isCompressed) t = attribute ? toMs(e.lu) : toMs(e.lc ?? e.lu);
      else t = toMs(attribute ? e.last_updated ?? e.last_changed : e.last_changed ?? e.last_updated);
      if (!Number.isFinite(t)) continue;
      points.push({ t, v: valueOf(state, attrs, attribute) });
    }
  } else if (Array.isArray(raw)) {
    // REST format: array of arrays (one per entity)
    let series = raw.find((arr) => Array.isArray(arr) && arr.some((e) => e && e.entity_id === entityId));
    if (!series && raw.length === 1 && Array.isArray(raw[0])) series = raw[0];
    let lastAttrs;
    for (const e of series || []) {
      if (!e) continue;
      if (isPlainObject(e.attributes)) lastAttrs = e.attributes;
      const t = toMs(attribute ? e.last_updated ?? e.last_changed : e.last_changed ?? e.last_updated);
      if (!Number.isFinite(t)) continue;
      points.push({ t, v: valueOf(e.state, e.attributes ?? lastAttrs, attribute) });
    }
  }

  points.sort((a, b) => a.t - b.t);
  return points;
}

async function fetchViaWebsocket(hass, { entityId, attribute, start, end }) {
  const msg = {
    type: "history/history_during_period",
    start_time: new Date(start).toISOString(),
    end_time: new Date(end).toISOString(),
    entity_ids: [entityId],
    minimal_response: !attribute,
    no_attributes: !attribute,
    significant_changes_only: false,
  };
  const raw = await hass.callWS(msg);
  return parseHistoryResponse(raw, entityId, attribute);
}

async function fetchViaRest(hass, { entityId, attribute, start, end }) {
  const params = [
    `filter_entity_id=${encodeURIComponent(entityId)}`,
    `end_time=${encodeURIComponent(new Date(end).toISOString())}`,
    "significant_changes_only=0",
  ];
  if (!attribute) params.push("minimal_response", "no_attributes");
  const path = `history/period/${encodeURIComponent(new Date(start).toISOString())}?${params.join("&")}`;
  const raw = await hass.callApi("GET", path);
  return parseHistoryResponse(raw, entityId, attribute);
}

function isUnknownCommand(err) {
  const code = err?.code ?? err?.error?.code;
  return code === "unknown_command" || /unknown command/i.test(String(err?.message || ""));
}

function storeCache(key, entry) {
  CACHE.set(key, entry);
  while (CACHE.size > MAX_CACHE_ENTRIES) {
    const oldest = CACHE.keys().next().value;
    CACHE.delete(oldest);
  }
}

/**
 * Fetch history points for one entity.
 * Never throws: on failure resolves to { points: [], status: "error" }.
 *
 * @returns {Promise<{points:Array<{t:number,v:number|null}>, status:"ok"|"empty"|"error",
 *                    source:"websocket"|"rest"|"cache"|"none", start:number, end:number, error?:string}>}
 */
async function fetchHistory(hass, { entityId, attribute, hours, updateInterval, resolution, now } = {}) {
  const { start, end, ttl } = computeWindow(hours, updateInterval, now);
  const result = (points, status, source, error) => ({ points, status, source, start, end, error });

  if (!hass || !entityId || !(hours > 0)) return result([], "error", "none", "missing hass/entity");

  const key = buildCacheKey({ entityId, attribute, start, end, hours, resolution });
  const cached = CACHE.get(key);
  const nowMs = now ?? Date.now();
  if (cached && nowMs - cached.time < ttl) {
    return result(cached.points, cached.points.length ? "ok" : "empty", "cache");
  }
  if (INFLIGHT.has(key)) return INFLIGHT.get(key);

  const request = (async () => {
    let points = null;
    let source = "none";
    let lastError;
    if (!websocketUnsupported && typeof hass.callWS === "function") {
      try {
        points = await fetchViaWebsocket(hass, { entityId, attribute, start, end });
        source = "websocket";
      } catch (err) {
        lastError = err;
        if (isUnknownCommand(err)) websocketUnsupported = true;
      }
    }
    if (points === null && typeof hass.callApi === "function") {
      try {
        points = await fetchViaRest(hass, { entityId, attribute, start, end });
        source = "rest";
      } catch (err) {
        lastError = err;
      }
    }
    if (points === null) {
      return result([], "error", "none", String(lastError?.message || lastError || "history unavailable"));
    }
    storeCache(key, { time: Date.now(), points });
    return result(points, points.length ? "ok" : "empty", source);
  })();

  INFLIGHT.set(key, request);
  try {
    return await request;
  } finally {
    INFLIGHT.delete(key);
  }
}

/** Test/maintenance helper. */
function clearHistoryCache() {
  CACHE.clear();
  INFLIGHT.clear();
  websocketUnsupported = false;
}
return { MIN_UPDATE_INTERVAL, buildCacheKey, computeWindow, parseHistoryResponse, fetchHistory, clearHistoryCache };
})();

// ---- src/levels.js
const __m_levels_js = (() => {
/**
 * Status levels ("Optimal", "Zu warm", "Erhöht" …) with colors, presets per
 * sensor type (device_class) and an overall rating for several sensors.
 * Pure module – no DOM access.
 */
const { parseNumber, isPlainObject, isSafeCssValue } = __m_utils_js;

const LEVEL_COLORS = Object.freeze({
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
});

/** Color per sensor type: icon, graph and tint of the info designs. */
const TYPE_COLORS = Object.freeze({
  temperature: "#f59e0b",
  humidity: "#3b82f6",
  moisture: "#3b82f6",
  carbon_dioxide: "#22c55e",
  carbon_monoxide: "#ef4444",
  pm25: "#8b5cf6",
  pm10: "#a855f7",
  pm1: "#8b5cf6",
  volatile_organic_compounds: "#14b8a6",
  volatile_organic_compounds_parts: "#14b8a6",
  nitrogen_dioxide: "#f97316",
  ozone: "#06b6d4",
  aqi: "#22c55e",
  illuminance: "#eab308",
  pressure: "#06b6d4",
  atmospheric_pressure: "#06b6d4",
  power: "#f59e0b",
  energy: "#f59e0b",
  battery: "#22c55e",
});

const TYPE_ICONS = Object.freeze({
  temperature: "mdi:thermometer",
  humidity: "mdi:water",
  moisture: "mdi:water",
  carbon_dioxide: "mdi:leaf",
  carbon_monoxide: "mdi:molecule-co",
  pm25: "mdi:blur",
  pm10: "mdi:blur",
  pm1: "mdi:blur",
  volatile_organic_compounds: "mdi:molecule",
  volatile_organic_compounds_parts: "mdi:molecule",
  nitrogen_dioxide: "mdi:molecule",
  ozone: "mdi:weather-windy",
  aqi: "mdi:air-filter",
  illuminance: "mdi:brightness-5",
  pressure: "mdi:gauge",
  atmospheric_pressure: "mdi:gauge",
  power: "mdi:flash",
  energy: "mdi:lightning-bolt",
  battery: "mdi:battery",
});

/** Short German names (overview card, missing friendly names). */
const TYPE_NAMES = Object.freeze({
  temperature: "Temperatur",
  humidity: "Luftfeuchtigkeit",
  carbon_dioxide: "CO₂",
  pm25: "Feinstaub (PM2.5)",
  pm10: "Feinstaub (PM10)",
  pm1: "Feinstaub (PM1)",
  volatile_organic_compounds: "VOC",
  volatile_organic_compounds_parts: "VOC",
});

const { blue, green, amber, red } = LEVEL_COLORS;
// severity: 0 = good, 1 = moderate, 2 = bad (used for the overall rating)
const L = (value, label, color, severity, icon) => ({ value, label, color, severity, ...(icon ? { icon } : {}) });

/** Presets: each level applies from `value` upwards (first level: everything below). */
const LEVEL_PRESETS = Object.freeze({
  // slight deviations ("Eher kühl") do not lower the overall air rating
  temperature: [
    L(null, "Zu kalt", blue, 1, "mdi:snowflake"),
    L(15, "Eher kühl", amber, 0),
    L(19, "Optimal", green, 0),
    L(24, "Eher warm", amber, 0),
    L(26, "Zu warm", red, 1),
  ],
  humidity: [
    L(null, "Zu trocken", red, 1),
    L(30, "Eher trocken", amber, 0),
    L(40, "Optimal", green, 0),
    L(60, "Eher feucht", amber, 0),
    L(70, "Zu feucht", red, 1),
  ],
  carbon_dioxide: [L(null, "Gut", green, 0), L(800, "Erhöht", amber, 1, "mdi:diamond"), L(1400, "Kritisch", red, 2)],
  pm25: [L(null, "Sehr gut", green, 0), L(5, "Gut", green, 0), L(15, "Erhöht", amber, 1), L(25, "Schlecht", red, 2), L(50, "Sehr schlecht", red, 2)],
  pm10: [L(null, "Sehr gut", green, 0), L(15, "Gut", green, 0), L(45, "Erhöht", amber, 1), L(75, "Schlecht", red, 2)],
  pm1: [L(null, "Sehr gut", green, 0), L(5, "Gut", green, 0), L(15, "Erhöht", amber, 1), L(25, "Schlecht", red, 2)],
  volatile_organic_compounds: [L(null, "Gut", green, 0), L(300, "Erhöht", amber, 1), L(1000, "Schlecht", red, 2)],
  volatile_organic_compounds_parts: [L(null, "Gut", green, 0), L(300, "Erhöht", amber, 1), L(1000, "Schlecht", red, 2)],
});

/** Range of the status ring per sensor type (value → ring fill). */
const RING_RANGES = Object.freeze({
  temperature: [0, 40],
  humidity: [0, 100],
  moisture: [0, 100],
  carbon_dioxide: [400, 2000],
  pm25: [0, 75],
  pm10: [0, 150],
  pm1: [0, 75],
  volatile_organic_compounds: [0, 2000],
  battery: [0, 100],
  illuminance: [0, 1000],
});

/** Overall rating of several sensors by the worst severity. */
const RATINGS = Object.freeze([
  { label: "Gut", text: "Angenehme Raumluft", color: green },
  { label: "Mäßig", text: "Lüften empfohlen", color: amber },
  { label: "Schlecht", text: "Bitte lüften", color: red },
]);

/**
 * Normalise a level list: [{ value?, label, color, severity?, icon? }].
 * `auto`/true → preset for the device class (or null), false → null.
 * Returns a list sorted by value (a level without value comes first) or null.
 */
function resolveLevels(config, deviceClass) {
  if (config === false || config === null) return null;
  if (config === undefined || config === true || config === "auto") {
    return LEVEL_PRESETS[deviceClass] ? LEVEL_PRESETS[deviceClass].map((l) => ({ ...l })) : null;
  }
  if (typeof config === "string") return LEVEL_PRESETS[config] ? LEVEL_PRESETS[config].map((l) => ({ ...l })) : null;
  if (!Array.isArray(config)) return null;
  const list = config
    .filter(isPlainObject)
    .map((l) => {
      const v = l.value === undefined || l.value === null || l.value === "" ? null : parseNumber(l.value);
      const severity = parseNumber(l.severity);
      return {
        value: v,
        label: l.label === undefined || l.label === null ? "" : String(l.label),
        color: isSafeCssValue(l.color) ? l.color : green,
        severity: severity === null ? null : Math.max(0, Math.min(2, Math.round(severity))),
        ...(typeof l.icon === "string" && l.icon ? { icon: l.icon } : {}),
      };
    });
  list.sort((a, b) => (a.value === null ? -Infinity : a.value) - (b.value === null ? -Infinity : b.value));
  // severity not given: guess from the color (green good, red bad, else moderate)
  for (const l of list) {
    if (l.severity !== null) continue;
    const c = String(l.color).toLowerCase();
    l.severity = c === green || c.includes("green") || c === "#16a34a" ? 0 : c === red || c.includes("red") || c === "#dc2626" ? 2 : 1;
  }
  return list.length ? list : null;
}

/** Level for a value: the last level whose `value` is ≤ the value. */
function findLevel(value, levels) {
  const v = parseNumber(value);
  if (v === null || !Array.isArray(levels) || !levels.length) return null;
  let found = null;
  for (const l of levels) {
    if (l.value === null || v >= l.value) found = l;
  }
  return found ?? levels[0];
}

/** Ring fill 0…1 for a value. */
function ringFraction(value, deviceClass, range) {
  const v = parseNumber(value);
  if (v === null) return 0;
  const [lo, hi] = Array.isArray(range) && range.length === 2 ? range.map(Number) : RING_RANGES[deviceClass] || [0, 100];
  if (!(hi > lo)) return 0;
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
}

/** Overall rating for a list of levels (null entries are ignored). */
function overallRating(levels, ratings = RATINGS) {
  const sev = levels.filter(Boolean).map((l) => l.severity ?? 0);
  if (!sev.length) return null;
  const worst = Math.max(...sev);
  return { severity: worst, ...ratings[Math.min(worst, ratings.length - 1)] };
}
return { LEVEL_COLORS, TYPE_COLORS, TYPE_ICONS, TYPE_NAMES, LEVEL_PRESETS, RING_RANGES, RATINGS, resolveLevels, findLevel, ringFraction, overallRating };
})();

// ---- src/config-validator.js
const __m_config_validator_js = (() => {
/**
 * Configuration validation and normalisation.
 * validateConfig() returns a fully populated config object or throws a
 * ConfigError that lists every problem in a human readable way.
 *
 * Pure module – no DOM access.
 */
const { parseNumber, toCssLength, toCssBoxLength, isSafeCssValue, isPlainObject, mergeDeep, deepClone, clamp } = __m_utils_js;
const { DEFAULT_STATE_MAPPING, OPERATORS } = __m_state_resolver_js;
const { GRAPH_TYPES } = __m_graph_renderer_js;
const { AGGREGATIONS, FILL_MODES } = __m_data_reducer_js;
const { ACTIONS, DEFAULT_HOLD_TIME, DEFAULT_DOUBLE_TAP_WINDOW, isToggleableDomain } = __m_action_handler_js;
const { VALUE_TYPES, VALUE_FORMATS } = __m_value_formatter_js;
const { MIN_UPDATE_INTERVAL } = __m_history_provider_js;
const { LEVEL_PRESETS } = __m_levels_js;

const GRAPH_POSITIONS = ["full", "after-icon", "left", "right", "bottom", "icon-area", "custom"];
const COLOR_MODES = ["fixed", "state", "thresholds", "gradient", "sign"];
const THRESHOLD_MODES = ["current", "per-point", "vertical"];
const THRESHOLD_BLENDS = ["hard", "smooth"];
/** Position of the large value in the info card ("top" = directly below the name). */
const VALUE_POSITIONS = [
  "top-left", "top-center", "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
  "name-right",
];
/** Position of the icon in the info card. */
const INFO_ICON_POSITIONS = [
  "name-left", "name-right",
  "top-left", "top-center", "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];
const ICON_COLOR_SOURCES = ["fixed", "light"];
const ICON_SHAPES = ["circle", "rounded-square", "square", "none"];
const ICON_POSITIONS = ["left", "right"];
const ANIMATIONS = ["none", "pulse", "rotate", "blink"];
const VALUE_LAYOUTS = ["inline", "stacked"];
const COLOR_TARGETS = ["icon", "icon-background", "graph", "card-background", "name", "value-1", "value-2"];
const NAME_OVERFLOW = ["ellipsis", "clip", "wrap"];
const MAX_HOURS = 8760;
const VARIANTS = ["button", "info"];
const TEXT_CONTRAST_MODES = ["auto", "off"];
const DESIGNS = ["standard", "subtle", "split", "badge", "sparkline", "panel"];
const HERO_STYLES = ["text", "badge", "box"];
const GRAPH_BASELINES = ["zero", "bottom"];

class ConfigError extends Error {
  constructor(errors) {
    const list = Array.isArray(errors) ? errors : [String(errors)];
    super(list.length === 1 ? list[0] : `Ungültige Konfiguration:\n• ${list.join("\n• ")}`);
    this.name = "ConfigError";
    this.errors = list;
  }
}

const ENTITY_RE = /^[a-z0-9_]+\.[a-zA-Z0-9_]+$/;

const DEFAULTS = Object.freeze({
  entity: undefined,
  state_entity: undefined,
  name: undefined,
  icon: undefined,
  picture: undefined,
  icon_svg: undefined,
  use_entity_picture: false,
  case_sensitive: false,
  state_mapping: DEFAULT_STATE_MAPPING,
  states: [],
  color_targets: ["icon", "icon-background"],
  unavailable_text: undefined,
  unknown_text: undefined,
  show_unavailable_badge: true,
  show_name: true,
  text_contrast: "auto",
  design: "standard",
  /** Accent per state: status dot, large value, design graphs and tints. */
  accent_color: {
    on: "#22c55e",
    off: "var(--secondary-text-color, #9ca3af)",
    unavailable: "var(--disabled-text-color, #6b7280)",
    other: "#22c55e",
  },
  hero: undefined,
  value_position: "top-left",
  value_offset: { x: "0px", y: "0px" },
  icon_position: "name-left",
  icon_offset: { x: "0px", y: "0px" },
  icon_area: {
    enabled: true,
    /** fixed: configured colors; light: current color of a light (e.g. WLED) while on */
    color_source: "fixed",
    shape: "circle",
    size: "42px",
    icon_size: "22px",
    position: "left",
    color: {
      on: "var(--state-icon-active-color, var(--primary-color))",
      off: "var(--state-icon-color, var(--secondary-text-color))",
      unavailable: "var(--disabled-text-color, #6b7280)",
    },
    background: {
      on: "color-mix(in srgb, var(--sgbc-icon-color) 16%, transparent)",
      off: "color-mix(in srgb, var(--sgbc-icon-color) 12%, transparent)",
      unavailable: "color-mix(in srgb, var(--sgbc-icon-color) 10%, transparent)",
    },
    animation: { on: "none", off: "none", unavailable: "none", other: "none", duration: "1.5s" },
  },
  name_style: {
    font_size: "14px",
    font_weight: 600,
    color: "var(--primary-text-color)",
    overflow: "ellipsis",
    max_lines: 1,
    align: "left",
  },
  value_1: undefined,
  value_2: undefined,
  values: { layout: "inline", separator: " · ", gap: "4px", font_size: "12px", status_dot: false },
  graph: {
    enabled: false,
    entity: undefined,
    attribute: undefined,
    type: "line",
    position: "full",
    width: "50%",
    height: "35%",
    bounds: { left: "0%", top: "0%", width: "100%", height: "100%" },
    icon_offset: "0px",
    baseline: "zero",
    hours_to_show: 24,
    max_points: 60,
    aggregation: "average",
    fill: "hold",
    min: "auto",
    max: "auto",
    line_width: 2,
    bar_width: undefined,
    bar_gap: 2,
    bar_radius: 1,
    opacity: 0.6,
    fill_opacity: 0.25,
    show_points: false,
    show_grid: false,
    show_axis: false,
    show_labels: false,
    fade: undefined,
    fade_start: undefined,
    fade_end: undefined,
    headroom: 0.05,
    color_mode: "state",
    color: "var(--sgbc-graph-color, var(--primary-color, #03a9f4))",
    colors: {
      on: "var(--state-icon-active-color, var(--primary-color))",
      off: "var(--secondary-text-color)",
      unavailable: "var(--disabled-text-color, #6b7280)",
    },
    thresholds: [],
    threshold_mode: "current",
    threshold_blend: "hard",
    gradient: { from: "#22c55e", to: "#ef4444", direction: "vertical" },
    positive_color: "#a855f7",
    negative_color: "#22c55e",
    split_at: 0,
    update_interval: 300,
  },
  state_background: {
    enabled: false,
    colors: {
      on: "rgba(34, 197, 94, 0.14)",
      off: "transparent",
      unavailable: "rgba(107, 114, 128, 0.10)",
    },
  },
  layers: {
    graph_above_state_background: true,
    overlay: { enabled: false, color: "rgba(0, 0, 0, 0.04)" },
  },
  thresholds: undefined,
  layout: {
    height: "64px",
    min_width: "180px",
    padding: "8px 12px",
    gap: "10px",
    border_radius: "14px",
    border_width: "1px",
    border_color: "var(--divider-color)",
    overflow: "hidden",
    background: undefined,
  },
  tap_action: undefined,
  hold_action: { action: "more-info" },
  double_tap_action: { action: "none" },
  hold_time: DEFAULT_HOLD_TIME,
  double_tap_window: DEFAULT_DOUBLE_TAP_WINDOW,
});

/**
 * Defaults of the info variant (pure display card, e.g. temperature or
 * humidity): small icon + name on top, large value, graph at the bottom.
 * User values always win over these.
 */
const INFO_DEFAULTS = Object.freeze({
  icon_area: {
    shape: "none",
    size: "18px",
    icon_size: "16px",
    color: {
      on: "var(--secondary-text-color)",
      off: "var(--secondary-text-color)",
      other: "var(--secondary-text-color)",
      unavailable: "var(--disabled-text-color, #6b7280)",
    },
    background: { on: "transparent", off: "transparent", unavailable: "transparent" },
  },
  name_style: { font_weight: 500 },
  values: { font_size: "12px" },
  graph: {
    type: "smooth-area",
    position: "bottom",
    height: "40%",
    baseline: "bottom",
    color_mode: "fixed",
    color: "auto",
    line_width: 1.5,
    fill_opacity: 0.35,
    opacity: 1,
    max_points: 60,
  },
  layout: { padding: "8px 10px", min_width: "0px" },
  tap_action: { action: "more-info" },
  hold_action: { action: "none" },
});

/**
 * Defaults of the button designs (design: subtle | split | badge | sparkline | panel).
 * User values always win over these.
 */
const DESIGN_BASE = {
  values: { status_dot: true },
  graph: {
    type: "smooth-area",
    position: "bottom",
    baseline: "bottom",
    color_mode: "fixed",
    color: "var(--sgbc-accent)",
    line_width: 1.5,
    fill_opacity: 0.22,
    opacity: 1,
    max_points: 40,
    headroom: 0.45,
  },
};
const ACCENT_TINT = {
  on: "color-mix(in srgb, var(--sgbc-accent) 9%, transparent)",
  off: "transparent",
  unavailable: "transparent",
  other: "color-mix(in srgb, var(--sgbc-accent) 9%, transparent)",
};
/** Designs in the normal button height (64 px). */
const DESIGN_DEFAULTS = Object.freeze({
  subtle: mergeDeep(DESIGN_BASE, {
    graph: { height: "42%", fade_start: 4, fade_end: 4 },
    state_background: { enabled: true, colors: ACCENT_TINT },
  }),
  split: mergeDeep(DESIGN_BASE, {
    graph: { height: "30%", fill_opacity: 0.16, headroom: 0.3 },
  }),
  badge: mergeDeep(DESIGN_BASE, {
    graph: { height: "42%", fade_start: 4, fade_end: 4 },
    state_background: { enabled: true, colors: ACCENT_TINT },
  }),
  sparkline: mergeDeep(DESIGN_BASE, {
    values: { layout: "stacked", gap: "0px" },
    graph: { position: "right", width: "34%", fill_opacity: 0.2, max_points: 36, headroom: 0.15 },
  }),
  // accent bar on the left, icon tile, name + status, line graph, value in a tinted box
  panel: mergeDeep(DESIGN_BASE, {
    icon_area: { shape: "rounded-square", size: "40px" },
    graph: { type: "line", position: "right", width: "34%", fill_opacity: 0, line_width: 1.5, max_points: 48, headroom: 0.15 },
  }),
});
const DESIGN_SIZES = ["normal", "double"];
const INFO_DESIGNS = ["standard", "tile", "ring", "compact"];

const ACCENT_ALL = (pct) => {
  const v = `color-mix(in srgb, var(--sgbc-accent) ${pct}%, transparent)`;
  return { on: v, off: v, unavailable: v, other: v };
};
const INFO_DESIGN_BASE = {
  levels: "auto",
  accent_color: "auto",
  icon_area: {
    shape: "circle",
    size: "40px",
    icon_size: "22px",
    color: { on: "var(--sgbc-accent)", off: "var(--sgbc-accent)", other: "var(--sgbc-accent)", unavailable: "var(--disabled-text-color, #6b7280)" },
    background: ACCENT_ALL(16),
  },
  name_style: { font_size: "14px", font_weight: 600 },
  layout: { height: "128px", padding: "12px 14px", border_radius: "16px" },
  state_background: { enabled: true, colors: ACCENT_ALL(7) },
  graph: {
    type: "smooth-area",
    position: "bottom",
    height: "40%",
    baseline: "bottom",
    color_mode: "fixed",
    color: "var(--sgbc-accent)",
    line_width: 1.5,
    fill_opacity: 0.3,
    opacity: 1,
    max_points: 48,
    headroom: 0.35,
  },
};
/** Info card designs (pictures: modern tile, status ring, compact status tile). */
const INFO_DESIGN_DEFAULTS = Object.freeze({
  tile: INFO_DESIGN_BASE,
  ring: mergeDeep(INFO_DESIGN_BASE, {
    icon_area: { size: "50px", icon_size: "24px", background: ACCENT_ALL(10) },
    graph: { height: "34%" },
  }),
  compact: mergeDeep(INFO_DESIGN_BASE, {
    accent_color: "level",
    show_name: false,
    icon_area: { shape: "rounded-square", size: "28px", icon_size: "18px" },
    layout: { padding: "10px 8px", min_width: "0px" },
    state_background: { colors: ACCENT_ALL(10) },
    graph: { height: "30%", max_points: 36 },
  }),
});
/** design_size: double – twice the button height, larger icon and text. */
const DESIGN_DOUBLE = {
  icon_area: { size: "50px", icon_size: "28px" },
  name_style: { font_size: "16px" },
  values: { font_size: "13px" },
  layout: { height: "128px", padding: "12px 16px", gap: "14px", border_radius: "16px" },
  graph: { line_width: 1.75 },
};
const DESIGN_DOUBLE_EXTRA = {
  subtle: { graph: { height: "50%" } },
  badge: { graph: { height: "50%" } },
  split: { graph: { height: "42%" } },
  sparkline: { values: { gap: "2px" } },
  panel: { icon_area: { size: "50px" }, graph: { width: "28%" } },
};

/** Defaults a design brings along (normal or double height). */
function designDefaults(design, size = "normal", info = false) {
  if (info) return INFO_DESIGN_DEFAULTS[design] || {};
  if (!DESIGN_DEFAULTS[design]) return {};
  if (size !== "double") return DESIGN_DEFAULTS[design];
  return mergeDeep(mergeDeep(DESIGN_DEFAULTS[design], DESIGN_DOUBLE), DESIGN_DOUBLE_EXTRA[design] || {});
}

const VALUE_DEFAULTS = Object.freeze({
  type: "state",
  prefix: "",
  suffix: "",
  fallback: "–",
  hide_if_unavailable: false,
});

/**
 * Validate and normalise a raw YAML config. Throws ConfigError.
 */
function validateConfig(raw) {
  const errors = [];
  const err = (msg) => errors.push(msg);

  if (!isPlainObject(raw)) throw new ConfigError("Die Konfiguration muss ein Objekt sein.");
  if (!raw.entity || typeof raw.entity !== "string") {
    throw new ConfigError("„entity“ fehlt. Bitte ein Haupt-Entity angeben, z. B. entity: switch.schreibtisch_1");
  }

  if (raw.variant !== undefined && !VARIANTS.includes(raw.variant)) {
    throw new ConfigError(`variant „${raw.variant}“ ist ungültig. Erlaubt: button, info.`);
  }
  const isInfo = raw.variant === "info";
  const design = raw.design === undefined ? "standard" : raw.design;
  const allowedDesigns = isInfo ? INFO_DESIGNS : DESIGNS;
  if (!allowedDesigns.includes(design)) throw new ConfigError(`design „${raw.design}“ ist ungültig. Erlaubt: ${allowedDesigns.join(", ")}.`);
  const isInfoDesign = isInfo && design !== "standard";
  const isDesign = !isInfo && design !== "standard";
  const designSize = raw.design_size === undefined ? "normal" : raw.design_size;
  if (!DESIGN_SIZES.includes(designSize)) throw new ConfigError(`design_size „${raw.design_size}“ ist ungültig. Erlaubt: ${DESIGN_SIZES.join(", ")}.`);
  const base = isInfo ? mergeDeep(mergeDeep(DEFAULTS, INFO_DEFAULTS), isInfoDesign ? INFO_DESIGN_DEFAULTS[design] : {}) : isDesign ? mergeDeep(DEFAULTS, designDefaults(design, designSize)) : DEFAULTS;
  const c = mergeDeep(base, raw);
  c.variant = isInfo ? "info" : "button";
  c.design = design;
  c.design_size = isDesign ? designSize : "normal";
  // entity whose measurement the designs show (power sensor next to a switch)
  const graphEntity = isPlainObject(raw.graph) && raw.graph.entity ? raw.graph.entity : raw.entity;
  const extraEntity = graphEntity && graphEntity !== raw.entity ? graphEntity : null;
  // arrays / maps that must not be deep-merged with defaults
  const userMapping = isPlainObject(raw.state_mapping) ? { ...raw.state_mapping } : {};
  // YAML 1.1 turns unquoted on/off keys into true/false
  if (userMapping.true !== undefined && userMapping.on === undefined) userMapping.on = userMapping.true;
  if (userMapping.false !== undefined && userMapping.off === undefined) userMapping.off = userMapping.false;
  delete userMapping.true;
  delete userMapping.false;
  c.state_mapping = { ...DEFAULT_STATE_MAPPING, ...userMapping };

  // sections that must be objects
  for (const key of ["icon_area", "name_style", "values", "state_background", "layers", "layout"]) {
    if (!isPlainObject(c[key])) {
      if (key === "icon_area" && c[key] === false) c[key] = { ...deepClone(DEFAULTS.icon_area), enabled: false };
      else if (key === "state_background" && typeof c[key] === "boolean") c[key] = { ...deepClone(DEFAULTS.state_background), enabled: c[key] };
      else {
        err(`„${key}“ muss ein Objekt sein.`);
        c[key] = deepClone(DEFAULTS[key]);
      }
    }
  }
  if (!isPlainObject(c.layers.overlay)) c.layers.overlay = { ...deepClone(DEFAULTS.layers.overlay), enabled: Boolean(c.layers.overlay) };
  if (!isPlainObject(c.state_background.colors)) c.state_background.colors = deepClone(DEFAULTS.state_background.colors);

  checkEntity(c.entity, "entity", err);
  if (c.state_entity !== undefined) checkEntity(c.state_entity, "state_entity", err);

  for (const key of ["on", "off", "unavailable"]) {
    if (c.state_mapping[key] !== undefined && !Array.isArray(c.state_mapping[key])) {
      err(`state_mapping.${key} muss eine Liste von Zuständen sein.`);
    } else if (Array.isArray(c.state_mapping[key])) {
      c.state_mapping[key] = c.state_mapping[key].map((s) => String(s));
    }
  }

  // ---- name
  if (c.name !== undefined && typeof c.name !== "string") {
    if (!isPlainObject(c.name)) err("„name“ muss ein Text oder ein Objekt (entity/attribute/template) sein.");
    else if (c.name.entity !== undefined) checkEntity(c.name.entity, "name.entity", err);
  }
  if (!NAME_OVERFLOW.includes(c.name_style.overflow)) err(`name_style.overflow „${c.name_style.overflow}“ ist ungültig. Erlaubt: ${NAME_OVERFLOW.join(", ")}.`);
  c.name_style.max_lines = clamp(Math.floor(parseNumber(c.name_style.max_lines) ?? 1), 1, 5);
  c.name_style.font_size = cssLen(c.name_style.font_size, "name_style.font_size", err);
  if (!["left", "center", "right"].includes(c.name_style.align)) err("name_style.align muss left, center oder right sein.");

  // ---- custom states
  if (!Array.isArray(c.states)) err("„states“ muss eine Liste sein.");
  else {
    c.states.forEach((s, i) => {
      if (!isPlainObject(s)) return err(`states[${i}] muss ein Objekt sein.`);
      const op = s.operator ?? "==";
      if (!OPERATORS.includes(op)) err(`states[${i}].operator „${op}“ ist ungültig. Erlaubt: ${OPERATORS.join(", ")}.`);
      if (s.value === undefined) err(`states[${i}].value fehlt.`);
      if ([">", ">=", "<", "<="].includes(op) && parseNumber(s.value) === null) err(`states[${i}].value muss für „${op}“ eine Zahl sein.`);
      if (op === "regex") {
        try {
          new RegExp(String(s.value));
        } catch (_e) {
          err(`states[${i}].value ist kein gültiger regulärer Ausdruck.`);
        }
      }
      if (s.entity !== undefined) checkEntity(s.entity, `states[${i}].entity`, err);
      if (s.class !== undefined && !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(String(s.class))) err(`states[${i}].class darf nur Buchstaben, Ziffern, - und _ enthalten.`);
      if (s.color !== undefined && !isSafeCssValue(s.color)) err(`states[${i}].color ist keine gültige Farbe.`);
    });
  }

  // ---- color targets
  if (!Array.isArray(c.color_targets)) err("color_targets muss eine Liste sein.");
  else c.color_targets.forEach((t) => !COLOR_TARGETS.includes(t) && err(`color_targets: „${t}“ ist unbekannt. Erlaubt: ${COLOR_TARGETS.join(", ")}.`));

  // ---- icon area
  const ia = c.icon_area;
  if (!ICON_SHAPES.includes(ia.shape)) err(`icon_area.shape „${ia.shape}“ ist ungültig. Erlaubt: ${ICON_SHAPES.join(", ")}.`);
  if (!ICON_COLOR_SOURCES.includes(ia.color_source)) err(`icon_area.color_source „${ia.color_source}“ ist ungültig. Erlaubt: ${ICON_COLOR_SOURCES.join(", ")}.`);
  if (!ICON_POSITIONS.includes(ia.position)) err(`icon_area.position „${ia.position}“ ist ungültig. Erlaubt: left, right.`);
  ia.size = cssLen(ia.size, "icon_area.size", err);
  ia.icon_size = cssLen(ia.icon_size, "icon_area.icon_size", err);
  if (isPlainObject(ia.animation)) {
    for (const [k, v] of Object.entries(ia.animation)) {
      if (k === "duration") continue;
      if (!ANIMATIONS.includes(v)) err(`icon_area.animation.${k} „${v}“ ist ungültig. Erlaubt: ${ANIMATIONS.join(", ")}.`);
    }
    if (!/^\d*\.?\d+m?s$/.test(String(ia.animation.duration))) err("icon_area.animation.duration muss z. B. „1.5s“ oder „800ms“ sein.");
  } else if (ia.animation !== undefined) {
    err("icon_area.animation muss ein Objekt sein (z. B. on: pulse).");
  }
  if (c.icon_svg !== undefined && (typeof c.icon_svg !== "string" || !/^\s*<svg[\s>]/i.test(c.icon_svg))) {
    err("icon_svg muss mit <svg beginnen.");
  }

  // ---- values
  for (const key of ["value_1", "value_2"]) {
    if (isInfo && key === "value_1" && raw[key] === undefined) {
      c[key] = normalizeValue({ type: "state" }, key, err); // info card shows the main state
      continue;
    }
    if (isDesign && raw[key] === undefined) {
      // designs: "● Ein · 9 W" / "● Ein · seit 08:14 Uhr" / "● Ein" + "9 W aktuell"
      let def = null;
      if (key === "value_1") def = { type: "state" };
      else if (design === "split") def = { type: "last_changed", format: "time", prefix: "seit ", suffix: " Uhr" };
      else if (extraEntity && design !== "panel") def = { entity: extraEntity, type: "state", ...(design === "sparkline" ? { suffix: " aktuell" } : {}) };
      c[key] = def ? normalizeValue(def, key, err) : undefined;
      continue;
    }
    if (raw[key] === undefined || raw[key] === null || raw[key] === false) {
      c[key] = undefined;
      continue;
    }
    c[key] = normalizeValue(raw[key], key, err);
  }
  if (!VALUE_LAYOUTS.includes(c.values.layout)) err(`values.layout „${c.values.layout}“ ist ungültig. Erlaubt: inline, stacked.`);
  c.values.gap = cssLen(c.values.gap, "values.gap", err);
  c.values.font_size = cssLen(c.values.font_size, "values.font_size", err);
  if (typeof c.values.separator !== "string") c.values.separator = String(c.values.separator ?? "");
  checkColor(raw.name_style?.color, "name_style.color", err);
  checkColor(raw.values?.color, "values.color", err);
  for (const key of ["value_1", "value_2"]) if (isPlainObject(raw[key])) checkColor(raw[key].color, `${key}.color`, err);

  // ---- graph
  c.graph = normalizeGraph((isInfo || isDesign) && raw.graph === undefined ? {} : raw.graph, c, err);

  // ---- large value on the right ("9 W / aktuell")
  c.values.status_dot = Boolean(c.values.status_dot);
  c.hero = isInfo ? undefined : normalizeHero(raw.hero, design, c, err);
  // ---- status levels ("Optimal", "Zu warm" …) and status ring
  if (c.levels === undefined) c.levels = false;
  if (Array.isArray(c.levels)) {
    c.levels.forEach((l, i) => {
      if (!isPlainObject(l)) return err(`levels[${i}] muss ein Objekt sein (value, label, color).`);
      if (!isSafeCssValue(l.color)) err(`levels[${i}].color fehlt oder ist ungültig.`);
      if (l.value !== undefined && l.value !== null && parseNumber(l.value) === null) err(`levels[${i}].value muss eine Zahl sein.`);
    });
  } else if (![true, false, "auto", ...Object.keys(LEVEL_PRESETS)].includes(c.levels)) {
    err(`levels muss auto, false, eine Liste oder ein Sensortyp (${Object.keys(LEVEL_PRESETS).join(", ")}) sein.`);
  }
  if (c.ring !== undefined) {
    if (!isPlainObject(c.ring) || parseNumber(c.ring.min) === null || parseNumber(c.ring.max) === null || parseNumber(c.ring.max) <= parseNumber(c.ring.min)) {
      err("ring benötigt min und max (Zahlen, max > min).");
    }
  }
  if (!isPlainObject(c.accent_color) && !isSafeCssValue(c.accent_color)) err("accent_color ist keine gültige Farbe.");

  // ---- state background / layers
  c.state_background.enabled = Boolean(c.state_background.enabled);
  c.layers.graph_above_state_background = c.layers.graph_above_state_background !== false;
  c.layers.overlay.enabled = Boolean(c.layers.overlay.enabled);

  // ---- top-level thresholds
  if (raw.thresholds !== undefined) c.thresholds = normalizeTopThresholds(raw.thresholds, err);

  // ---- layout
  const l = c.layout;
  l.height = l.height === "auto" ? "auto" : cssLen(l.height, "layout.height", err);
  l.min_width = cssLen(l.min_width, "layout.min_width", err);
  l.gap = cssLen(l.gap, "layout.gap", err);
  l.border_radius = cssLen(l.border_radius, "layout.border_radius", err);
  l.border_width = cssLen(l.border_width, "layout.border_width", err);
  const pad = toCssBoxLength(l.padding);
  if (!pad) err(`layout.padding „${l.padding}“ ist ungültig (z. B. „8px 12px“).`);
  else l.padding = pad;
  if (!["hidden", "visible", "clip"].includes(l.overflow)) err("layout.overflow muss hidden, visible oder clip sein.");

  // ---- actions
  if (!c.tap_action) c.tap_action = { action: isToggleableDomain(c.entity) ? "toggle" : "more-info" };
  for (const key of ["tap_action", "hold_action", "double_tap_action"]) {
    const a = c[key];
    if (!isPlainObject(a)) {
      err(`${key} muss ein Objekt mit „action“ sein.`);
      continue;
    }
    if (!ACTIONS.includes(a.action)) err(`${key}.action „${a.action}“ ist ungültig. Erlaubt: ${ACTIONS.join(", ")}.`);
    if (a.action === "navigate" && !a.navigation_path) err(`${key}: navigation_path fehlt.`);
    if (a.action === "url" && !a.url_path) err(`${key}: url_path fehlt.`);
    if ((a.action === "perform-action" || a.action === "call-service") && !/^[a-z0-9_]+\.[a-z0-9_]+$/.test(String(a.perform_action || a.service || ""))) {
      err(`${key}: perform_action muss im Format „domain.aktion“ angegeben werden.`);
    }
    if (a.entity !== undefined) checkEntity(a.entity, `${key}.entity`, err);
  }
  c.show_name = c.show_name !== false;
  if (c.text_contrast === true) c.text_contrast = "auto";
  if (c.text_contrast === false) c.text_contrast = "off";
  if (!TEXT_CONTRAST_MODES.includes(c.text_contrast)) err(`text_contrast „${c.text_contrast}“ ist ungültig. Erlaubt: ${TEXT_CONTRAST_MODES.join(", ")}.`);
  if (!isPlainObject(c.value_offset)) {
    err("value_offset muss ein Objekt mit x und y sein (z. B. x: 4, y: -6).");
    c.value_offset = { x: "0px", y: "0px" };
  } else {
    c.value_offset.x = cssLen(c.value_offset.x ?? 0, "value_offset.x", err);
    c.value_offset.y = cssLen(c.value_offset.y ?? 0, "value_offset.y", err);
  }
  for (const key of ["icon_offset"]) {
    if (!isPlainObject(c[key])) {
      err(`${key} muss ein Objekt mit x und y sein (z. B. x: 4, y: -6).`);
      c[key] = { x: "0px", y: "0px" };
    } else {
      c[key].x = cssLen(c[key].x ?? 0, `${key}.x`, err);
      c[key].y = cssLen(c[key].y ?? 0, `${key}.y`, err);
    }
  }
  if (!INFO_ICON_POSITIONS.includes(c.icon_position)) err(`icon_position „${c.icon_position}“ ist ungültig. Erlaubt: ${INFO_ICON_POSITIONS.join(", ")}.`);
  if (!VALUE_POSITIONS.includes(c.value_position)) err(`value_position „${c.value_position}“ ist ungültig. Erlaubt: ${VALUE_POSITIONS.join(", ")}.`);
  c.hold_time = clamp(parseNumber(c.hold_time) ?? DEFAULT_HOLD_TIME, 200, 5000);
  c.double_tap_window = clamp(parseNumber(c.double_tap_window) ?? DEFAULT_DOUBLE_TAP_WINDOW, 100, 1000);

  if (errors.length) throw new ConfigError(errors);
  return c;
}

/** A text color: CSS color string, or a map per state/class ({on, off, …}). */
function checkColor(value, path, err) {
  if (value === undefined || value === null) return;
  if (typeof value === "string") {
    if (!isSafeCssValue(value)) err(`${path} „${value}“ ist keine gültige Farbe.`);
    return;
  }
  if (!isPlainObject(value)) return err(`${path} muss eine Farbe oder eine Zuordnung je Zustand sein (z. B. "on": "#22c55e").`);
  for (const [k, v] of Object.entries(value)) {
    if (!isSafeCssValue(String(v))) err(`${path}.${k} „${v}“ ist keine gültige Farbe.`);
  }
  return undefined;
}

function checkEntity(value, path, err) {
  if (typeof value !== "string" || !ENTITY_RE.test(value)) err(`${path} „${value}“ ist keine gültige Entity-ID (Format: domain.objekt_id).`);
}

function cssLen(value, path, err) {
  const v = toCssLength(value);
  if (v === null) {
    err(`${path} „${value}“ ist keine gültige CSS-Länge (z. B. 42px, 50%).`);
    return undefined;
  }
  return v;
}

function normalizeValue(input, key, err) {
  let v;
  if (typeof input === "string") v = { ...VALUE_DEFAULTS, type: "text", text: input };
  else if (isPlainObject(input)) v = { ...VALUE_DEFAULTS, ...input };
  else {
    err(`${key} muss ein Objekt oder Text sein.`);
    return undefined;
  }
  if (input.type === undefined) {
    if (typeof input === "object" && input.text !== undefined && input.entity === undefined) v.type = "text";
    else if (typeof input === "object" && input.attribute !== undefined && !input.template) v.type = "attribute";
  }
  if (!VALUE_TYPES.includes(v.type)) err(`${key}.type „${v.type}“ ist ungültig. Erlaubt: ${VALUE_TYPES.join(", ")}.`);
  if (v.entity !== undefined) checkEntity(v.entity, `${key}.entity`, err);
  if (v.type === "attribute" && !v.attribute) err(`${key}.attribute fehlt (type: attribute).`);
  if (v.type === "text" && v.text === undefined) err(`${key}.text fehlt (type: text).`);
  if (v.type === "template" && typeof v.template !== "string") err(`${key}.template fehlt (type: template).`);
  if (v.template !== undefined && typeof v.template !== "string") err(`${key}.template muss ein Text sein.`);
  if (v.decimals !== undefined) {
    const d = parseNumber(v.decimals);
    if (d === null || !Number.isInteger(d) || d < 0 || d > 10) err(`${key}.decimals muss eine ganze Zahl von 0 bis 10 sein.`);
    else v.decimals = d;
  }
  if (v.format !== undefined && !VALUE_FORMATS.includes(v.format)) err(`${key}.format „${v.format}“ ist ungültig. Erlaubt: ${VALUE_FORMATS.join(", ")}.`);
  if (v.state_mapping !== undefined && !isPlainObject(v.state_mapping)) err(`${key}.state_mapping muss ein Objekt sein (z. B. "on": Ein).`);
  if (v.thresholds !== undefined) checkThresholdList(v.thresholds, `${key}.thresholds`, err);
  if (v.font_size !== undefined) v.font_size = cssLen(v.font_size, `${key}.font_size`, err);
  if (v.unit !== undefined && v.unit !== null) v.unit = String(v.unit);
  if (v.fallback === null || v.fallback === undefined) v.fallback = "–";
  else v.fallback = String(v.fallback);
  v.prefix = v.prefix === null || v.prefix === undefined ? "" : String(v.prefix);
  v.suffix = v.suffix === null || v.suffix === undefined ? "" : String(v.suffix);
  return v;
}

const HERO_DESIGNS = { subtle: "text", split: "text", badge: "badge", panel: "box" };
/** Caption under the large value when none is configured. */
const HERO_CAPTIONS = { panel: "" };

function normalizeHero(rawHero, design, c, err) {
  if (rawHero === false || rawHero === null) return undefined;
  if (rawHero === undefined && !HERO_DESIGNS[design]) return undefined;
  const input = rawHero === undefined || rawHero === true ? {} : rawHero;
  if (!isPlainObject(input)) {
    err("hero muss ein Objekt sein (z. B. caption: aktuell).");
    return undefined;
  }
  const { caption, style, ...valueCfg } = input;
  if (valueCfg.entity === undefined && valueCfg.type !== "text") valueCfg.entity = c.graph?.entity || c.entity;
  const v = normalizeValue(valueCfg, "hero", err);
  if (!v) return undefined;
  v.caption = caption === undefined ? HERO_CAPTIONS[design] ?? "aktuell" : caption === null || caption === false ? "" : String(caption);
  v.style = style === undefined ? HERO_DESIGNS[design] || "text" : style;
  if (!HERO_STYLES.includes(v.style)) err(`hero.style „${v.style}“ ist ungültig. Erlaubt: ${HERO_STYLES.join(", ")}.`);
  checkColor(input.color, "hero.color", err);
  return v;
}

function checkThresholdList(list, path, err) {
  if (!Array.isArray(list)) return err(`${path} muss eine Liste sein.`);
  list.forEach((t, i) => {
    if (!isPlainObject(t)) return err(`${path}[${i}] muss ein Objekt sein.`);
    if (!isSafeCssValue(t.color)) err(`${path}[${i}].color fehlt oder ist ungültig.`);
    const hasValue = t.value !== undefined;
    const hasRange = t.from !== undefined || t.to !== undefined;
    if (!hasValue && !hasRange) err(`${path}[${i}] benötigt „value“ oder „from“/„to“.`);
    if (hasValue && parseNumber(t.value) === null) err(`${path}[${i}].value muss eine Zahl sein.`);
    if (t.from !== undefined && parseNumber(t.from) === null) err(`${path}[${i}].from muss eine Zahl sein.`);
    if (t.to !== undefined && parseNumber(t.to) === null) err(`${path}[${i}].to muss eine Zahl sein.`);
    if (t.from !== undefined && t.to !== undefined && parseNumber(t.from) !== null && parseNumber(t.to) !== null && parseNumber(t.from) >= parseNumber(t.to)) {
      err(`${path}[${i}]: „from“ (${t.from}) muss kleiner als „to“ (${t.to}) sein.`);
    }
  });
  return undefined;
}

function normalizeTopThresholds(input, err) {
  if (!isPlainObject(input)) {
    err("thresholds muss ein Objekt mit „ranges“ sein.");
    return undefined;
  }
  const t = { entity: undefined, attribute: undefined, ranges: [], apply_to: ["icon", "graph"], ...input };
  if (t.entity !== undefined) checkEntity(t.entity, "thresholds.entity", err);
  checkThresholdList(t.ranges, "thresholds.ranges", err);
  if (!Array.isArray(t.apply_to)) err("thresholds.apply_to muss eine Liste sein.");
  else t.apply_to.forEach((x) => !COLOR_TARGETS.includes(x) && err(`thresholds.apply_to: „${x}“ ist unbekannt. Erlaubt: ${COLOR_TARGETS.join(", ")}.`));
  return t;
}

/**
 * Width of the soft fade at the start/end of the graph.
 * Number = percent of the graph width (0–50), or a string like "15%" / "40px".
 */
function fadeLength(value, path, err) {
  if (value === undefined || value === null || value === false) return "0%";
  const s = String(value).trim();
  const m = /^(\d*\.?\d+)(%|px)?$/.exec(s);
  if (!m) {
    err(`${path} „${value}“ ist ungültig (z. B. 15, 15% oder 40px).`);
    return "0%";
  }
  const n = Number(m[1]);
  const unit = m[2] || "%";
  if (unit === "%" && n > 50) {
    err(`${path} darf höchstens 50 (%) sein.`);
    return "0%";
  }
  return `${n}${unit}`;
}

function normalizeGraph(rawGraph, c, err) {
  const g = isPlainObject(c.graph) ? c.graph : deepClone(DEFAULTS.graph);
  if (rawGraph === undefined || rawGraph === null || rawGraph === false) {
    g.enabled = false;
    return g;
  }
  if (rawGraph === true) {
    g.enabled = true;
  } else if (!isPlainObject(rawGraph)) {
    err("graph muss ein Objekt sein.");
    return g;
  } else {
    g.enabled = rawGraph.enabled === undefined ? true : Boolean(rawGraph.enabled);
    g.thresholds = Array.isArray(rawGraph.thresholds) ? rawGraph.thresholds : [];
    if (isPlainObject(rawGraph.colors)) g.colors = { ...DEFAULTS.graph.colors, ...rawGraph.colors };
  }
  if (!g.entity) g.entity = c.entity;
  checkEntity(g.entity, "graph.entity", err);
  if (!GRAPH_TYPES.includes(g.type)) err(`graph.type „${g.type}“ ist ungültig. Erlaubt: ${GRAPH_TYPES.join(", ")}.`);
  if (!GRAPH_POSITIONS.includes(g.position)) err(`graph.position „${g.position}“ ist unbekannt. Erlaubt: ${GRAPH_POSITIONS.join(", ")}.`);
  if (!AGGREGATIONS.includes(g.aggregation)) err(`graph.aggregation „${g.aggregation}“ ist ungültig. Erlaubt: ${AGGREGATIONS.join(", ")}.`);
  if (!FILL_MODES.includes(g.fill)) err(`graph.fill „${g.fill}“ ist ungültig. Erlaubt: ${FILL_MODES.join(", ")}.`);
  if (!COLOR_MODES.includes(g.color_mode)) err(`graph.color_mode „${g.color_mode}“ ist ungültig. Erlaubt: ${COLOR_MODES.join(", ")}.`);
  if (!THRESHOLD_MODES.includes(g.threshold_mode)) err(`graph.threshold_mode „${g.threshold_mode}“ ist ungültig. Erlaubt: current, per-point, vertical.`);
  if (!THRESHOLD_BLENDS.includes(g.threshold_blend)) err(`graph.threshold_blend „${g.threshold_blend}“ ist ungültig. Erlaubt: hard, smooth.`);

  const hours = parseNumber(g.hours_to_show);
  if (hours === null || hours <= 0) err("graph.hours_to_show muss größer als 0 sein.");
  else if (hours > MAX_HOURS) err(`graph.hours_to_show darf höchstens ${MAX_HOURS} (1 Jahr) sein.`);
  else g.hours_to_show = hours;

  const points = parseNumber(g.max_points);
  if (points === null || !Number.isInteger(points) || points < 2 || points > 1000) err("graph.max_points muss eine ganze Zahl von 2 bis 1000 sein.");
  else g.max_points = points;

  const interval = parseNumber(g.update_interval);
  if (interval === null || interval <= 0) err("graph.update_interval muss eine positive Zahl (Sekunden) sein.");
  else g.update_interval = Math.max(MIN_UPDATE_INTERVAL, interval);

  for (const key of ["min", "max"]) {
    if (g[key] === "auto" || g[key] === undefined || g[key] === null) g[key] = "auto";
    else {
      const n = parseNumber(g[key]);
      if (n === null) err(`graph.${key} muss eine Zahl oder „auto“ sein.`);
      else g[key] = n;
    }
  }
  if (typeof g.min === "number" && typeof g.max === "number" && g.min >= g.max) err(`Ungültiger Zahlenbereich: graph.min (${g.min}) muss kleiner als graph.max (${g.max}) sein.`);

  for (const [key, lo, hi] of [["line_width", 0, 20], ["bar_gap", 0, 50], ["bar_radius", 0, 50], ["opacity", 0, 1], ["fill_opacity", 0, 1]]) {
    const n = parseNumber(g[key]);
    if (n === null || n < lo || n > hi) err(`graph.${key} muss eine Zahl von ${lo} bis ${hi} sein.`);
    else g[key] = n;
  }
  if (g.bar_width !== undefined && g.bar_width !== null) {
    const n = parseNumber(g.bar_width);
    if (n === null || n <= 0) err("graph.bar_width muss eine positive Zahl (px) sein.");
    else g.bar_width = n;
  }

  g.fade_start = fadeLength(g.fade_start ?? g.fade, "graph.fade_start", err);
  g.fade_end = fadeLength(g.fade_end ?? g.fade, "graph.fade_end", err);
  g.width = cssLen(g.width, "graph.width", err);
  g.height = cssLen(g.height, "graph.height", err);
  g.icon_offset = cssLen(g.icon_offset, "graph.icon_offset", err);
  if (g.position === "custom") {
    if (!isPlainObject(g.bounds)) err("graph.bounds muss bei position: custom angegeben werden (left, top, width, height).");
    else for (const k of ["left", "top", "width", "height"]) g.bounds[k] = cssLen(g.bounds[k], `graph.bounds.${k}`, err);
  }

  if (g.color_mode === "thresholds") {
    if (!Array.isArray(g.thresholds) || g.thresholds.length === 0) err("graph.thresholds wird für color_mode: thresholds benötigt.");
    else checkThresholdList(g.thresholds, "graph.thresholds", err);
  }
  if (g.color_mode === "gradient") {
    if (!isPlainObject(g.gradient) || !isSafeCssValue(g.gradient.from) || !isSafeCssValue(g.gradient.to)) err("graph.gradient benötigt „from“ und „to“ (Farben).");
    else if (!["vertical", "horizontal"].includes(g.gradient.direction)) err("graph.gradient.direction muss vertical oder horizontal sein.");
  }
  if (g.color_mode === "fixed" && !isSafeCssValue(g.color)) err("graph.color ist ungültig.");
  if (g.color_mode === "sign") {
    if (!isSafeCssValue(g.positive_color)) err("graph.positive_color ist keine gültige Farbe.");
    if (!isSafeCssValue(g.negative_color)) err("graph.negative_color ist keine gültige Farbe.");
    const at = parseNumber(g.split_at);
    if (at === null) err("graph.split_at muss eine Zahl sein.");
    else g.split_at = at;
  }
  // the faded smooth-area looks best with a stronger fill
  if (g.type === "smooth-area" && c.variant !== "info" && c.design === "standard" && (!isPlainObject(rawGraph) || rawGraph.fill_opacity === undefined)) g.fill_opacity = 0.6;
  const room = parseNumber(g.headroom);
  if (room === null || room < 0 || room > 2) err("graph.headroom muss eine Zahl von 0 bis 2 sein (Anteil Luft über dem höchsten Wert).");
  else g.headroom = room;
  if (!GRAPH_BASELINES.includes(g.baseline)) err(`graph.baseline „${g.baseline}“ ist ungültig. Erlaubt: zero, bottom.`);
  for (const k of ["show_points", "show_grid", "show_axis", "show_labels"]) g[k] = Boolean(g[k]);
  return g;
}
return { GRAPH_POSITIONS, COLOR_MODES, THRESHOLD_MODES, THRESHOLD_BLENDS, VALUE_POSITIONS, INFO_ICON_POSITIONS, ICON_COLOR_SOURCES, ICON_SHAPES, ICON_POSITIONS, ANIMATIONS, VALUE_LAYOUTS, COLOR_TARGETS, NAME_OVERFLOW, MAX_HOURS, VARIANTS, TEXT_CONTRAST_MODES, DESIGNS, HERO_STYLES, GRAPH_BASELINES, ConfigError, DEFAULTS, INFO_DEFAULTS, DESIGN_DEFAULTS, DESIGN_SIZES, INFO_DESIGNS, INFO_DESIGN_DEFAULTS, designDefaults, validateConfig, fadeLength };
})();

// ---- src/color-utils.js
const __m_color_utils_js = (() => {
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
function parseColor(value) {
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
function toHex({ r, g, b }) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Value to store after a color was picked with the mouse. A previously
 * configured transparency (rgba / #rrggbbaa) is kept, otherwise #rrggbb.
 */
function applyPickedColor(previous, pickedHex) {
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
function lightColor(stateObj) {
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
return { parseColor, toHex, applyPickedColor, lightColor };
})();

// ---- src/smart-graph-button-card-editor.js
const __m_smart_graph_button_card_editor_js = (() => {
/**
 * Visual Lovelace editor for the Smart Graph Button Card.
 *
 * Uses Home Assistant's native <ha-form> for standard fields (built into the
 * HA frontend, not a custom card) plus own controls for colors (text field +
 * mouse color picker) and the graph threshold list. Every key the editor does
 * not manage is preserved.
 */
const { parseColor, toHex, applyPickedColor } = __m_color_utils_js;

const EDITOR_TAG = "smart-graph-button-card-editor";

const VARIANTS = [
  ["button", "Button (schaltbar)"],
  ["info", "Info-Karte (nur Anzeige)"],
];

const DESIGNS = [
  ["standard", "Standard"],
  ["subtle", "Dezenter Graph im Hintergrund"],
  ["split", "Zwei Bereiche mit separatem Graph"],
  ["badge", "Farbiger Status mit Verbrauchsbereich"],
  ["sparkline", "Minimalistisch mit Sparkline"],
  ["panel", "Akzentleiste mit Wertfeld"],
];
const INFO_DESIGNS = [
  ["standard", "Standard"],
  ["tile", "Moderne Kachel (Wert, Status, Graph)"],
  ["ring", "Kachel mit Zustandsring"],
  ["compact", "Kompakte Statuskachel (Farbe nach Messwert)"],
];
const ICON_COLOR_SOURCES = [
  ["fixed", "Vorgegebene Farbe"],
  ["light", "Aktuelle Farbe des Lichts (z. B. LED-Streifen)"],
];
const HERO_DESIGNS = ["subtle", "split", "badge", "panel"];
/** Designs that show the second value in the large value box instead. */
const NO_VALUE_2_DESIGNS = ["panel"];
const TINT_DESIGNS = ["subtle", "badge", "tile", "ring", "compact"];
const NAMELESS_DESIGNS = ["compact"];

const VALUE_POSITIONS = [
  ["top-left", "Oben links (unter dem Namen)"],
  ["top-center", "Oben mittig"],
  ["top-right", "Oben rechts"],
  ["middle-left", "Mitte links"],
  ["middle-center", "Mitte"],
  ["middle-right", "Mitte rechts"],
  ["bottom-left", "Unten links"],
  ["bottom-center", "Unten mittig"],
  ["bottom-right", "Unten rechts"],
  ["name-right", "Neben dem Namen (rechts)"],
];

const INFO_ICON_POSITIONS = [
  ["name-left", "Vor dem Namen (Standard)"],
  ["name-right", "Hinter dem Namen (rechts)"],
  ["top-left", "Oben links"],
  ["top-center", "Oben mittig"],
  ["top-right", "Oben rechts"],
  ["middle-left", "Mitte links"],
  ["middle-center", "Mitte"],
  ["middle-right", "Mitte rechts"],
  ["bottom-left", "Unten links"],
  ["bottom-center", "Unten mittig"],
  ["bottom-right", "Unten rechts"],
];

const GRAPH_TYPES = [
  ["line", "Linie"],
  ["area", "Fläche"],
  ["smooth-area", "Abgerundete Fläche (bis Null)"],
  ["bar", "Balken"],
  ["column", "Säulen"],
  ["stepped", "Stufen"],
  ["line-bar", "Linie + Balken"],
  ["smooth-line-bar", "Abgerundete Linie + Balken"],
];
const GRAPH_POSITIONS = [
  ["full", "Ganze Karte"],
  ["after-icon", "Nach dem Symbol"],
  ["left", "Links"],
  ["right", "Rechts"],
  ["bottom", "Unten"],
  ["icon-area", "Hinter dem Symbol"],
  ["custom", "Benutzerdefiniert"],
];
const COLOR_MODES = [
  ["state", "Nach Zustand (Ein/Aus)"],
  ["thresholds", "Nach Grenzwerten"],
  ["fixed", "Feste Farbe"],
  ["gradient", "Farbverlauf"],
  ["sign", "Über/Unter Null (z. B. Bezug/Einspeisung)"],
];
const THRESHOLD_MODES = [
  ["per-point", "Jeder Wert in eigener Farbe"],
  ["vertical", "Nach Höhe im Graph (Farbbänder)"],
  ["current", "Ganzer Graph nach aktuellem Wert"],
];
const THRESHOLD_BLENDS = [
  ["hard", "Harte Grenze"],
  ["smooth", "Weicher Verlauf"],
];
const GRADIENT_DIRECTIONS = [
  ["vertical", "Vertikal (unten → oben)"],
  ["horizontal", "Horizontal (links → rechts)"],
];

/** Pre-filled threshold list when "Nach Grenzwerten" is chosen in the editor. */
const DEFAULT_THRESHOLDS = [
  { value: 10, color: "#22c55e" },
  { value: 50, color: "#eab308" },
  { value: 100, color: "#f97316" },
  { value: 200, color: "#ef4444" },
];
const PALETTE = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#dc2626", "#a855f7", "#3b82f6"];

const LABELS = {
  entity: "Entity",
  variant: "Darstellung",
  design: "Design",
  design_double: "Doppelte Höhe (2 × Button-Höhe)",
  levels_enabled: "Zustand anzeigen (z. B. „Optimal“, „Zu warm“)",
  hero_enabled: "Großen Wert rechts anzeigen",
  hero_caption: "Beschriftung unter dem großen Wert",
  icon_color_source: "Symbolfarbe bei eingeschaltetem Licht",
  name: "Name",
  icon: "Symbol",
  value_1_entity: "Wert 1 – Entity (leer = Haupt-Entity)",
  value_1_attribute: "Wert 1 – Attribut (optional)",
  value_1_enabled: "Wert 1 anzeigen",
  value_2_enabled: "Wert 2 anzeigen",
  value_2_entity: "Wert 2 – Entity",
  value_2_decimals: "Wert 2 – Dezimalstellen",
  value_2_unit: "Wert 2 – Einheit",
  graph_enabled: "Graph aktivieren",
  graph_entity: "Graph-Entity",
  graph_type: "Graph-Typ",
  graph_position: "Graph-Position",
  graph_hours_to_show: "Zeitraum (Stunden)",
  graph_fade_start: "Weicher Übergang am Beginn (links)",
  graph_fade_end: "Weicher Übergang am Ende (rechts)",
  graph_color_mode: "Farbmodus",
  graph_threshold_mode: "Anwendung",
  graph_threshold_blend: "Übergang zwischen den Farben",
  show_name: "Name anzeigen",
  value_position: "Position des Werts",
  value_offset_x: "Wert verschieben – horizontal",
  value_offset_y: "Wert verschieben – vertikal",
  icon_position: "Position des Symbols",
  icon_offset_x: "Symbol verschieben – horizontal",
  icon_offset_y: "Symbol verschieben – vertikal",
  graph_gradient_direction: "Richtung",
  state_background_enabled: "Statushintergrund aktivieren",
  text_contrast_auto: "Schriftfarbe automatisch lesbar halten (Hell-/Dunkelmodus)",
  tap_action: "Tap-Aktion",
  hold_action: "Hold-Aktion",
  double_tap_action: "Double-Tap-Aktion",
};

const options = (list) => list.map(([value, label]) => ({ value, label }));

function mainSchema(cfg) {
  // the info card element always uses variant "info"
  const variant = cfg?.type === "custom:smart-graph-info-card"
    ? []
    : [{ name: "variant", selector: { select: { mode: "dropdown", options: options(VARIANTS) } } }];
  return [
    { name: "entity", required: true, selector: { entity: {} } },
    ...variant,
    {
      type: "grid",
      name: "",
      schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ],
    },
    { name: "show_name", selector: { boolean: {} } },
    ...(String(cfg?.entity || "").startsWith("light.") || get(cfg, "icon_area.color_source") === "light"
      ? [{ name: "icon_color_source", selector: { select: { mode: "dropdown", options: options(ICON_COLOR_SOURCES) } } }]
      : []),
    ...(isInfoConfig(cfg)
      ? [
          { name: "design", selector: { select: { mode: "dropdown", options: options(INFO_DESIGNS) } } },
          ...(designOf(cfg) !== "standard" ? [{ name: "levels_enabled", selector: { boolean: {} } }] : []),
        ]
      : [
          { name: "design", selector: { select: { mode: "dropdown", options: options(DESIGNS) } } },
          ...(isDesign(cfg) ? [{ name: "design_double", selector: { boolean: {} } }] : []),
          {
            type: "grid",
            name: "",
            schema: [
              { name: "hero_enabled", selector: { boolean: {} } },
              { name: "hero_caption", selector: { text: {} } },
            ],
          },
        ]),
    ...(isInfoConfig(cfg)
      ? [
          { name: "value_position", selector: { select: { mode: "dropdown", options: options(VALUE_POSITIONS) } } },
          {
            type: "grid",
            name: "",
            schema: [
              { name: "value_offset_x", selector: { number: { min: -60, max: 60, step: 1, mode: "slider", unit_of_measurement: "px" } } },
              { name: "value_offset_y", selector: { number: { min: -30, max: 30, step: 1, mode: "slider", unit_of_measurement: "px" } } },
            ],
          },
          { name: "icon_position", selector: { select: { mode: "dropdown", options: options(INFO_ICON_POSITIONS) } } },
          {
            type: "grid",
            name: "",
            schema: [
              { name: "icon_offset_x", selector: { number: { min: -60, max: 60, step: 1, mode: "slider", unit_of_measurement: "px" } } },
              { name: "icon_offset_y", selector: { number: { min: -30, max: 30, step: 1, mode: "slider", unit_of_measurement: "px" } } },
            ],
          },
        ]
      : []),
    {
      type: "expandable",
      name: "values_section",
      flatten: true,
      title: "Werte",
      icon: "mdi:numeric",
      schema: [
        { name: "value_1_enabled", selector: { boolean: {} } },
        { name: "value_1_entity", selector: { entity: {} } },
        { name: "value_1_attribute", selector: { text: {} } },
        { name: "value_2_enabled", selector: { boolean: {} } },
        { name: "value_2_entity", selector: { entity: {} } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "value_2_decimals", selector: { number: { min: 0, max: 6, mode: "box" } } },
            { name: "value_2_unit", selector: { text: {} } },
          ],
        },
      ],
    },
    {
      type: "expandable",
      name: "graph_section",
      flatten: true,
      title: "Graph",
      icon: "mdi:chart-bar",
      schema: [
        { name: "graph_enabled", selector: { boolean: {} } },
        { name: "graph_entity", selector: { entity: {} } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "graph_type", selector: { select: { mode: "dropdown", options: options(GRAPH_TYPES) } } },
            { name: "graph_position", selector: { select: { mode: "dropdown", options: options(GRAPH_POSITIONS) } } },
          ],
        },
        { name: "graph_hours_to_show", selector: { number: { min: 1, max: 168, step: 1, mode: "box", unit_of_measurement: "h" } } },
        { name: "graph_fade_start", selector: { number: { min: 0, max: 50, step: 1, mode: "slider", unit_of_measurement: "%" } } },
        { name: "graph_fade_end", selector: { number: { min: 0, max: 50, step: 1, mode: "slider", unit_of_measurement: "%" } } },
      ],
    },
  ];
}

function graphColorSchema(mode, thresholdMode) {
  const extra = [];
  if (mode === "thresholds") extra.push({ name: "graph_threshold_mode", selector: { select: { mode: "dropdown", options: options(THRESHOLD_MODES) } } });
  if (mode === "thresholds" && thresholdMode === "vertical") extra.push({ name: "graph_threshold_blend", selector: { select: { mode: "dropdown", options: options(THRESHOLD_BLENDS) } } });
  if (mode === "gradient") extra.push({ name: "graph_gradient_direction", selector: { select: { mode: "dropdown", options: options(GRADIENT_DIRECTIONS) } } });
  return [{ type: "grid", name: "", schema: [{ name: "graph_color_mode", selector: { select: { mode: "dropdown", options: options(COLOR_MODES) } } }, ...extra] }];
}

const stateBackgroundSchema = () => [{ name: "state_background_enabled", selector: { boolean: {} } }];
const textContrastSchema = () => [{ name: "text_contrast_auto", selector: { boolean: {} } }];

const actionsSchema = () => [
  {
    type: "expandable",
    name: "actions_section",
    flatten: true,
    title: "Interaktionen",
    icon: "mdi:gesture-tap",
    schema: [
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ],
  },
];

const get = (obj, path) => path.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), obj);

function setPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]] || typeof cur[keys[i]] !== "object" || Array.isArray(cur[keys[i]])) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  const last = keys[keys.length - 1];
  if (value === undefined || value === "" || value === null) delete cur[last];
  else cur[last] = value;
}

function pruneEmpty(obj, path) {
  const keys = path.split(".");
  for (let depth = keys.length - 1; depth >= 1; depth--) {
    const parentPath = keys.slice(0, depth).join(".");
    const parent = get(obj, parentPath);
    if (parent && typeof parent === "object" && !Array.isArray(parent) && Object.keys(parent).length === 0) {
      setPath(obj, parentPath, undefined);
    }
  }
}

const clone = (v) => JSON.parse(JSON.stringify(v ?? {}));

/** Info cards have the graph enabled by default and other graph defaults. */
const isInfoConfig = (c) => c?.variant === "info" || c?.type === "custom:smart-graph-info-card";
const designOf = (c) => c?.design || "standard";
/** Button designs (subtle, split, badge, sparkline) – info designs are handled separately. */
const isDesign = (c) => !isInfoConfig(c) && designOf(c) !== "standard";
const defaultColorMode = (c) => (isInfoConfig(c) || isDesign(c) ? "fixed" : "state");
const heroOn = (c) => (c?.hero === undefined ? HERO_DESIGNS.includes(designOf(c)) : c.hero !== false && c.hero !== null);

/** Offset in px as number for the slider (0 when unset, undefined for other units). */
function pxNumber(value) {
  if (value === undefined || value === null) return 0;
  const m = /^(-?\d*\.?\d+)(px)?$/.exec(String(value).trim());
  return m ? Number(m[1]) : undefined;
}

/** Fade value as percent number for the slider (px values are left to YAML). */
function fadePercent(value) {
  if (value === undefined || value === null || value === false) return 0;
  const m = /^(\d*\.?\d+)%?$/.exec(String(value).trim());
  return m ? Number(m[1]) : undefined;
}

/** Map a (YAML) config to the flat data object used by ha-form. */
function configToForm(config) {
  const c = config || {};
  return {
    entity: c.entity,
    variant: c.variant || "button",
    name: typeof c.name === "string" ? c.name : undefined,
    icon: typeof c.icon === "string" ? c.icon : undefined,
    design: designOf(c),
    icon_color_source: get(c, "icon_area.color_source") || "fixed",
    design_double: c.design_size === "double",
    levels_enabled: c.levels !== false,
    hero_enabled: heroOn(c),
    hero_caption: c.hero && typeof c.hero === "object" && c.hero.caption !== undefined ? String(c.hero.caption ?? "") : undefined,
    value_1_enabled: c.value_1 === undefined ? isDesign(c) : Boolean(c.value_1),
    value_1_entity: get(c, "value_1.entity"),
    value_1_attribute: get(c, "value_1.attribute"),
    value_2_enabled: c.value_2 === undefined ? isDesign(c) && !NO_VALUE_2_DESIGNS.includes(designOf(c)) : Boolean(c.value_2),
    value_2_entity: get(c, "value_2.entity"),
    value_2_decimals: get(c, "value_2.decimals"),
    value_2_unit: get(c, "value_2.unit"),
    graph_enabled: c.graph ? get(c, "graph.enabled") !== false : isInfoConfig(c) || isDesign(c),
    graph_entity: get(c, "graph.entity"),
    graph_type: get(c, "graph.type") || (designOf(c) === "panel" && !isInfoConfig(c) ? "line" : isInfoConfig(c) || isDesign(c) ? "smooth-area" : "line"),
    graph_position: get(c, "graph.position") || (["sparkline", "panel"].includes(designOf(c)) ? "right" : isInfoConfig(c) || isDesign(c) ? "bottom" : "full"),
    graph_hours_to_show: get(c, "graph.hours_to_show") ?? 24,
    graph_fade_start: fadePercent(get(c, "graph.fade_start") ?? get(c, "graph.fade")),
    graph_fade_end: fadePercent(get(c, "graph.fade_end") ?? get(c, "graph.fade")),
    graph_color_mode: get(c, "graph.color_mode") || defaultColorMode(c),
    graph_threshold_mode: get(c, "graph.threshold_mode") || "current",
    graph_threshold_blend: get(c, "graph.threshold_blend") || "hard",
    show_name: isInfoConfig(c) && NAMELESS_DESIGNS.includes(designOf(c)) ? c.show_name === true : c.show_name !== false,
    value_position: c.value_position || "top-left",
    value_offset_x: pxNumber(get(c, "value_offset.x")),
    value_offset_y: pxNumber(get(c, "value_offset.y")),
    icon_position: c.icon_position || "name-left",
    icon_offset_x: pxNumber(get(c, "icon_offset.x")),
    icon_offset_y: pxNumber(get(c, "icon_offset.y")),
    graph_gradient_direction: get(c, "graph.gradient.direction") || "vertical",
    state_background_enabled: get(c, "state_background.enabled") === undefined ? TINT_DESIGNS.includes(designOf(c)) : Boolean(get(c, "state_background.enabled")),
    text_contrast_auto: c.text_contrast !== "off" && c.text_contrast !== false,
    tap_action: c.tap_action,
    hold_action: c.hold_action,
    double_tap_action: c.double_tap_action,
  };
}

/** Apply flat ha-form data back onto a copy of the config, keeping unknown keys. */
function formToConfig(config, form) {
  const out = clone(config);
  const d = form || {};
  setPath(out, "entity", d.entity);
  for (const key of ["value_offset", "icon_offset"]) {
    for (const axis of ["x", "y"]) {
      const v = d[`${key}_${axis}`];
      if (typeof v === "number" && v !== pxNumber(get(config, `${key}.${axis}`))) setPath(out, `${key}.${axis}`, v === 0 ? undefined : v);
    }
    pruneEmpty(out, `${key}.x`);
  }
  if (d.icon_position && d.icon_position !== "name-left") out.icon_position = d.icon_position;
  else if (d.icon_position === "name-left") delete out.icon_position;
  if (d.value_position && d.value_position !== "top-left") out.value_position = d.value_position;
  else if (d.value_position === "top-left") delete out.value_position;
  const namelessDefault = isInfoConfig(out) && NAMELESS_DESIGNS.includes(designOf(out));
  if (d.icon_color_source !== undefined) {
    setPath(out, "icon_area.color_source", d.icon_color_source === "light" ? "light" : undefined);
    pruneEmpty(out, "icon_area.color_source");
  }
  if (d.show_name === false) out.show_name = false;
  else if (d.show_name === true && namelessDefault) out.show_name = true;
  else delete out.show_name;
  if (isInfoConfig(out) && designOf(out) !== "standard" && d.levels_enabled !== undefined) {
    if (d.levels_enabled === false) out.levels = false;
    else if (out.levels === false) delete out.levels;
  }
  if (d.variant && out.type !== "custom:smart-graph-info-card") {
    const before = isInfoConfig(config) ? "info" : "button";
    setPath(out, "variant", d.variant === "button" ? undefined : d.variant);
    if (d.variant !== before) {
      // designs differ between button and info card
      for (const key of ["design", "design_size", "hero", "levels", "accent_color"]) delete out[key];
      return out;
    }
  }
  if (d.design !== undefined && isInfoConfig(out) && d.design !== designOf(config)) {
    setPath(out, "design", d.design === "standard" ? undefined : d.design);
    for (const path of ["graph.type", "graph.position", "graph.color_mode", "graph.color", "graph.height", "state_background.enabled", "layout.height", "icon_area.shape"]) {
      setPath(out, path, undefined);
      pruneEmpty(out, path);
    }
    for (const key of ["show_name", "levels", "accent_color"]) delete out[key];
    if (out.graph && Object.keys(out.graph).length === 0) delete out.graph;
    return out;
  }
  if (d.design !== undefined && !isInfoConfig(out) && d.design !== designOf(config)) {
    // a new design brings its own look: drop the settings it provides, keep entities and texts
    setPath(out, "design", d.design === "standard" ? undefined : d.design);
    for (const path of ["graph.type", "graph.position", "graph.enabled", "graph.color_mode", "graph.height", "graph.width", "state_background.enabled", "layout.height"]) {
      setPath(out, path, undefined);
      pruneEmpty(out, path);
    }
    if (d.design === "standard") delete out.design_size;
    if (out.hero === false) delete out.hero;
    for (const key of ["value_1", "value_2"]) if (out[key] === false) delete out[key];
    if (d.design === "standard" && out.graph && !out.graph.entity) delete out.graph;
    return out;
  }
  if (d.design_double !== undefined && isDesign(out)) {
    const was = config?.design_size === "double";
    if (d.design_double !== was) {
      // the size brings its own height – a height from the other size would not fit
      setPath(out, "layout.height", undefined);
      pruneEmpty(out, "layout.height");
    }
    if (d.design_double) out.design_size = "double";
    else delete out.design_size;
  }
  if (d.hero_enabled !== undefined && !isInfoConfig(out)) {
    const byDesign = HERO_DESIGNS.includes(designOf(out));
    const caption = typeof d.hero_caption === "string" && d.hero_caption !== "" ? d.hero_caption : undefined;
    if (!d.hero_enabled) out.hero = byDesign ? false : undefined;
    else {
      const hero = out.hero && typeof out.hero === "object" ? out.hero : {};
      if (caption !== undefined) hero.caption = caption;
      else if (d.hero_caption === "" || d.hero_caption === undefined) delete hero.caption;
      out.hero = Object.keys(hero).length || !byDesign ? hero : undefined;
    }
    if (out.hero === undefined) delete out.hero;
  }
  if (d.name !== undefined || typeof out.name === "string") setPath(out, "name", d.name);
  if (d.icon !== undefined || typeof out.icon === "string") setPath(out, "icon", d.icon);

  // designs fill value 1/2 themselves – only write them when something is changed
  const designValue = (i) => isDesign(out) && (out[`value_${i}`] === undefined || out[`value_${i}`] === false);
  if (d.value_1_enabled && designValue(1) && !d.value_1_entity && !d.value_1_attribute) delete out.value_1;
  else if (!d.value_1_enabled && isDesign(out)) out.value_1 = false;
  else if (d.value_1_enabled) {
    if (!out.value_1 || typeof out.value_1 !== "object") out.value_1 = { type: "state" };
    setPath(out, "value_1.entity", d.value_1_entity);
    setPath(out, "value_1.attribute", d.value_1_attribute);
    if (d.value_1_attribute && (!out.value_1.type || out.value_1.type === "state")) out.value_1.type = "attribute";
    if (!d.value_1_attribute && out.value_1.type === "attribute") out.value_1.type = "state";
  } else delete out.value_1;

  if (d.value_2_enabled && designValue(2) && !d.value_2_entity && typeof d.value_2_decimals !== "number" && !d.value_2_unit) delete out.value_2;
  else if (!d.value_2_enabled && isDesign(out)) out.value_2 = false;
  else if (d.value_2_enabled) {
    if (!out.value_2 || typeof out.value_2 !== "object") out.value_2 = { type: "state" };
    setPath(out, "value_2.entity", d.value_2_entity);
    setPath(out, "value_2.decimals", typeof d.value_2_decimals === "number" ? d.value_2_decimals : undefined);
    setPath(out, "value_2.unit", d.value_2_unit);
  } else delete out.value_2;

  if (d.graph_enabled || out.graph || isInfoConfig(out) || isDesign(out)) {
    if (!out.graph || typeof out.graph !== "object") out.graph = {};
    if (d.graph_enabled) {
      setPath(out, "graph.entity", d.graph_entity);
      setPath(out, "graph.type", d.graph_type);
      setPath(out, "graph.position", d.graph_position);
      setPath(out, "graph.hours_to_show", typeof d.graph_hours_to_show === "number" ? d.graph_hours_to_show : undefined);
      for (const [field, key] of [["graph_fade_start", "fade_start"], ["graph_fade_end", "fade_end"]]) {
        const current = fadePercent(get(config, `graph.${key}`) ?? get(config, "graph.fade"));
        if (typeof d[field] === "number" && d[field] !== current) out.graph[key] = d[field];
      }
    }
    const mode = d.graph_color_mode;
    if (mode && (mode !== defaultColorMode(out) || out.graph.color_mode)) out.graph.color_mode = mode;
    if (mode === "thresholds") {
      const hadMode = Boolean(get(config, "graph.threshold_mode"));
      if (d.graph_threshold_mode && (d.graph_threshold_mode !== "current" || hadMode)) out.graph.threshold_mode = d.graph_threshold_mode;
      if (d.graph_threshold_blend && (d.graph_threshold_blend !== "hard" || out.graph.threshold_blend)) out.graph.threshold_blend = d.graph_threshold_blend;
      if (!Array.isArray(out.graph.thresholds) || out.graph.thresholds.length === 0) {
        out.graph.thresholds = clone(DEFAULT_THRESHOLDS);
        if (!out.graph.threshold_mode) out.graph.threshold_mode = "per-point";
      }
    }
    if (mode === "gradient") {
      if (!out.graph.gradient || typeof out.graph.gradient !== "object") out.graph.gradient = { from: "#22c55e", to: "#ef4444" };
      out.graph.gradient.direction = d.graph_gradient_direction || "vertical";
    }
    out.graph.enabled = Boolean(d.graph_enabled);
  }

  const tintDefault = TINT_DESIGNS.includes(designOf(out));
  if (d.state_background_enabled) setPath(out, "state_background.enabled", tintDefault ? undefined : true);
  else if (out.state_background || tintDefault) setPath(out, "state_background.enabled", false);
  pruneEmpty(out, "state_background.enabled");

  if (d.text_contrast_auto === false) out.text_contrast = "off";
  else delete out.text_contrast;

  for (const key of ["tap_action", "hold_action", "double_tap_action"]) setPath(out, key, d[key]);
  return out;
}

const EDITOR_STYLES = `
.sgbc-ed-panel { display: block; margin-top: 8px; }
.sgbc-ed-panel > details { border: 1px solid var(--divider-color); border-radius: 12px; }
.sgbc-ed-panel summary { cursor: pointer; padding: 12px 16px; font-weight: 500; }
.sgbc-ed-body { display: flex; flex-direction: column; gap: 12px; padding: 4px 4px 12px; }
.sgbc-ed-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.sgbc-ed-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.sgbc-ed-field > label { font-size: 12px; color: var(--secondary-text-color); }
.sgbc-ed-input {
  display: flex; align-items: center; gap: 8px; min-width: 0;
  border: 1px solid var(--divider-color); border-radius: 8px; padding: 4px 8px;
  background: var(--input-fill-color, var(--secondary-background-color, transparent));
}
.sgbc-ed-input:focus-within { border-color: var(--primary-color); }
.sgbc-ed-input.invalid { border-color: var(--error-color, #db4437); }
.sgbc-ed-input input[type="text"], .sgbc-ed-input input[type="number"] {
  flex: 1; min-width: 0; border: 0; outline: 0; background: transparent;
  color: var(--primary-text-color); font: inherit; font-size: 14px; padding: 6px 0;
}
.sgbc-ed-unit { color: var(--secondary-text-color); font-size: 13px; }
.sgbc-ed-chip {
  position: relative; flex: none; width: 28px; height: 28px; border-radius: 50%;
  border: 1px solid var(--divider-color); cursor: pointer; overflow: hidden;
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%),
    linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%);
  background-size: 8px 8px; background-position: 0 0, 4px 4px; background-color: #fff;
}
.sgbc-ed-chip .fill { position: absolute; inset: 0; border-radius: 50%; }
.sgbc-ed-chip input[type="color"] {
  position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: 0; padding: 0;
}
.sgbc-ed-threshold { display: grid; grid-template-columns: minmax(90px, 0.8fr) minmax(150px, 1.4fr) auto; gap: 8px; align-items: end; }
.sgbc-ed-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border: 1px solid var(--divider-color); border-radius: 8px; background: transparent;
  color: var(--primary-text-color); font: inherit; font-size: 14px; padding: 8px 12px; cursor: pointer;
}
.sgbc-ed-button:hover:not(:disabled) { background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); }
.sgbc-ed-button:disabled { opacity: 0.4; cursor: default; }
.sgbc-ed-button.icon { width: 40px; height: 40px; padding: 0; }
.sgbc-ed-button.add { align-self: flex-start; color: var(--primary-color); }
.sgbc-ed-button ha-icon { --mdc-icon-size: 20px; }
.sgbc-ed-note { margin: 0; font-size: 13px; color: var(--secondary-text-color); }
.sgbc-ed-subtitle { margin-top: 4px; font-size: 14px; font-weight: 500; color: var(--primary-text-color); }
.sgbc-ed-hint { margin: 12px 0 0; font-size: 12px; color: var(--secondary-text-color); }
`;

let colorCanvas = null;
/** Parse any CSS color the browser understands (names, hsl, …); null for var()/color-mix(). */
function cssColorToRgba(value) {
  const direct = parseColor(value);
  if (direct) return direct;
  if (typeof value !== "string" || !value.trim() || /var\(|color-mix|calc\(/i.test(value)) return null;
  try {
    colorCanvas = colorCanvas || document.createElement("canvas").getContext("2d");
    colorCanvas.fillStyle = "#010203";
    colorCanvas.fillStyle = value.trim();
    const out = colorCanvas.fillStyle;
    if (out === "#010203" && value.trim().toLowerCase() !== "#010203") return null;
    return parseColor(out);
  } catch (_err) {
    return null;
  }
}

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Color field: text input (any CSS color, e.g. #22c55e, rgba(...), var(...))
 * plus a round chip that opens the native color picker for mouse selection.
 */
function colorField(label, value, onChange, placeholder = "#22c55e") {
  const field = h("div", "sgbc-ed-field");
  const lab = h("label", "", label);
  const box = h("div", "sgbc-ed-input");
  const chip = h("span", "sgbc-ed-chip");
  const fill = h("span", "fill");
  const picker = document.createElement("input");
  picker.type = "color";
  picker.title = "Farbe mit der Maus auswählen";
  picker.setAttribute("aria-label", `${label} – Farbauswahl`);
  chip.append(fill, picker);
  const text = document.createElement("input");
  text.type = "text";
  text.spellcheck = false;
  text.autocomplete = "off";
  text.placeholder = placeholder;
  text.value = value ?? "";
  text.setAttribute("aria-label", label);
  box.append(chip, text);
  field.append(lab, box);

  const sync = () => {
    const v = text.value.trim();
    fill.style.background = v || "transparent";
    const rgba = cssColorToRgba(v);
    picker.value = rgba ? toHex(rgba) : "#888888";
  };
  picker.addEventListener("input", () => {
    text.value = applyPickedColor(text.value.trim(), picker.value);
    fill.style.background = text.value;
  });
  picker.addEventListener("change", () => onChange(text.value.trim()));
  text.addEventListener("input", sync);
  text.addEventListener("change", () => onChange(text.value.trim()));
  sync();
  return field;
}

// Guard allows importing the pure mapping helpers in Node-based tests.
const EditorBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {};

class SmartGraphButtonCardEditor extends EditorBase {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._forms = [];
    this._panels = null;
    this._ready = false;
    this._lastEmitted = null;
    this._onFormChanged = this._onFormChanged.bind(this);
  }

  set hass(hass) {
    this._hass = hass;
    for (const f of this._forms) f.hass = hass;
  }

  setConfig(config) {
    this._config = config || {};
    const echo = this._lastEmitted !== null && JSON.stringify(this._config) === this._lastEmitted;
    this._syncForms();
    if (!echo) this._renderPanels();
  }

  connectedCallback() {
    if (!this._ready) {
      this._ready = true;
      this._ensureComponents().then(() => this._render());
    }
  }

  disconnectedCallback() {
    for (const f of this._forms) f.removeEventListener("value-changed", this._onFormChanged);
    this._forms = [];
    this._panels = null;
    this._ready = false;
    this.replaceChildren();
  }

  async _ensureComponents() {
    if (customElements.get("ha-form") && customElements.get("ha-entity-picker")) return;
    // Standard technique: instantiate a built-in card editor so that HA loads
    // its own form components (no third-party code involved).
    try {
      const helpers = await window.loadCardHelpers?.();
      const card = await helpers?.createCardElement?.({ type: "entities", entities: [] });
      await card?.constructor?.getConfigElement?.();
    } catch (_err) {
      /* fall through */
    }
    await Promise.race([customElements.whenDefined("ha-form"), new Promise((r) => setTimeout(r, 3000))]);
  }

  _makeForm(schemaFn) {
    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form._sgbcSchema = schemaFn;
    form.schema = schemaFn(this._config);
    form._sgbcSchemaJson = JSON.stringify(form.schema);
    form.data = configToForm(this._config);
    form.computeLabel = (s) => LABELS[s.name] ?? s.title ?? s.name;
    form.addEventListener("value-changed", this._onFormChanged);
    this._forms.push(form);
    return form;
  }

  _makePanel(title) {
    const wrap = h("div", "sgbc-ed-panel");
    const body = h("div", "sgbc-ed-body");
    if (customElements.get("ha-expansion-panel")) {
      const panel = document.createElement("ha-expansion-panel");
      panel.header = title;
      panel.outlined = true;
      panel.append(body);
      wrap.append(panel);
    } else {
      const details = h("details");
      details.append(h("summary", "", title), body);
      wrap.append(details);
    }
    return { wrap, body };
  }

  _render() {
    this.replaceChildren();
    this._forms = [];
    if (!customElements.get("ha-form")) {
      const msg = h("p", "", "Der visuelle Editor ist in dieser Home-Assistant-Version nicht verfügbar. Bitte den YAML-Modus verwenden.");
      msg.style.cssText = "margin:0;padding:8px;color:var(--secondary-text-color)";
      this.append(msg);
      return;
    }
    const style = h("style");
    style.textContent = EDITOR_STYLES;
    const graphColors = this._makePanel("Graph-Farben");
    const colors = this._makePanel("Farben & Hintergrund");
    this._panels = { graphColors, colors };
    this.append(style, this._makeForm(mainSchema), graphColors.wrap, colors.wrap, this._makeForm(actionsSchema));
    this.append(h("p", "sgbc-ed-hint", "Eigene Zustände, Ebenen, Layout und Grenzwertfarben für Symbol und Hintergrund lassen sich im YAML-Modus konfigurieren."));
    this._renderPanels();
  }

  _syncForms() {
    const data = configToForm(this._config);
    for (const f of this._forms) {
      const schema = f._sgbcSchema(this._config);
      const json = JSON.stringify(schema);
      if (json !== f._sgbcSchemaJson) {
        f._sgbcSchemaJson = json;
        f.schema = schema;
      }
      f.data = data;
    }
  }

  _renderPanels() {
    if (!this._panels) return;
    this._forms = this._forms.filter((f) => f.isConnected && !f._sgbcPanelForm);
    this._renderGraphColors(this._panels.graphColors.body);
    this._renderColors(this._panels.colors.body);
  }

  _panelForm(schemaFn) {
    const form = this._makeForm(schemaFn);
    form._sgbcPanelForm = true;
    return form;
  }

  _renderGraphColors(body) {
    body.replaceChildren();
    const c = this._config;
    const mode = get(c, "graph.color_mode") || defaultColorMode(c);
    body.append(this._panelForm((cfg) => graphColorSchema(get(cfg, "graph.color_mode") || defaultColorMode(cfg), get(cfg, "graph.threshold_mode"))));
    if (c.graph && c.graph.enabled === false) body.append(h("p", "sgbc-ed-note", "Der Graph ist deaktiviert. Die Farben gelten, sobald er aktiviert wird."));

    if (mode === "fixed") {
      body.append(colorField("Graph-Farbe", get(c, "graph.color"), (v) => this._set("graph.color", v), isInfoConfig(c) ? "auto (nach Sensortyp)" : "#06b6d4"));
    } else if (mode === "state") {
      const grid = h("div", "sgbc-ed-grid");
      grid.append(
        colorField("Graph „Ein“", get(c, "graph.colors.on"), (v) => this._set("graph.colors.on", v)),
        colorField("Graph „Aus“", get(c, "graph.colors.off"), (v) => this._set("graph.colors.off", v), "#94a3b8")
      );
      body.append(grid);
    } else if (mode === "gradient") {
      const grid = h("div", "sgbc-ed-grid");
      grid.append(
        colorField("Von", get(c, "graph.gradient.from"), (v) => this._set("graph.gradient.from", v || "#22c55e")),
        colorField("Bis", get(c, "graph.gradient.to"), (v) => this._set("graph.gradient.to", v || "#ef4444"), "#ef4444")
      );
      body.append(grid);
    } else if (mode === "sign") {
      const grid = h("div", "sgbc-ed-grid");
      grid.append(
        colorField("Über Null", get(c, "graph.positive_color"), (v) => this._set("graph.positive_color", v), "#a855f7"),
        colorField("Unter Null", get(c, "graph.negative_color"), (v) => this._set("graph.negative_color", v), "#22c55e")
      );
      body.append(grid);
    } else if (mode === "thresholds") {
      this._renderThresholds(body);
    }
  }

  _renderThresholds(body) {
    const c = this._config;
    const list = Array.isArray(get(c, "graph.thresholds")) ? get(c, "graph.thresholds") : [];
    const graphEntity = get(c, "graph.entity") || c.entity;
    const unit = this._hass?.states?.[graphEntity]?.attributes?.unit_of_measurement || "";

    list.forEach((t, idx) => {
      const row = h("div", "sgbc-ed-threshold");

      const valueField = h("div", "sgbc-ed-field");
      const valueBox = h("div", "sgbc-ed-input");
      const input = document.createElement("input");
      input.type = "number";
      input.step = "any";
      input.value = t?.value ?? "";
      input.setAttribute("aria-label", `Grenzwert ${idx + 1} – ab Wert`);
      valueBox.append(input);
      if (unit) valueBox.append(h("span", "sgbc-ed-unit", unit));
      valueField.append(h("label", "", "Ab Wert"), valueBox);
      input.addEventListener("change", () => {
        const n = input.value.trim() === "" ? NaN : Number(input.value);
        valueBox.classList.toggle("invalid", !Number.isFinite(n));
        if (!Number.isFinite(n)) return;
        this._updateThreshold(idx, { value: n });
      });

      const colorEl = colorField("Farbe", t?.color, (v) => {
        if (v) this._updateThreshold(idx, { color: v });
      });

      const del = h("button", "sgbc-ed-button icon");
      del.type = "button";
      del.title = "Grenzwert entfernen";
      del.setAttribute("aria-label", `Grenzwert ${idx + 1} entfernen`);
      const delIcon = document.createElement("ha-icon");
      delIcon.icon = "mdi:delete-outline";
      del.append(delIcon);
      if (!customElements.get("ha-icon")) del.textContent = "✕";
      del.disabled = list.length <= 1;
      del.addEventListener("click", () => {
        const next = this._thresholdList().filter((_, i) => i !== idx);
        this._set("graph.thresholds", next, true);
      });

      row.append(valueField, colorEl, del);
      body.append(row);
    });

    const add = h("button", "sgbc-ed-button add");
    add.type = "button";
    const addIcon = document.createElement("ha-icon");
    addIcon.icon = "mdi:plus";
    add.append(addIcon, document.createTextNode("Grenzwert hinzufügen"));
    add.addEventListener("click", () => {
      const list = this._thresholdList();
      const values = list.map((t) => Number(t?.value)).filter(Number.isFinite);
      const max = values.length ? Math.max(...values) : -50;
      const next = [...list, { value: max + 50, color: PALETTE[list.length % PALETTE.length] }];
      this._set("graph.thresholds", next, true);
    });
    body.append(add);
  }

  _renderColors(body) {
    body.replaceChildren();
    const c = this._config;
    const icons = h("div", "sgbc-ed-grid");
    icons.append(
      colorField("Symbol „Ein“", get(c, "icon_area.color.on"), (v) => this._set("icon_area.color.on", v)),
      colorField("Symbol „Aus“", get(c, "icon_area.color.off"), (v) => this._set("icon_area.color.off", v), "#94a3b8")
    );
    const backgrounds = h("div", "sgbc-ed-grid");
    backgrounds.append(
      colorField("Hintergrund „Ein“", get(c, "state_background.colors.on"), (v) => this._set("state_background.colors.on", v), "rgba(34, 197, 94, 0.15)"),
      colorField("Hintergrund „Aus“", get(c, "state_background.colors.off"), (v) => this._set("state_background.colors.off", v), "rgba(148, 163, 184, 0.08)")
    );
    const accent = h("div", "sgbc-ed-grid");
    const accentField = (label, key, placeholder) => {
      const value = get(c, "accent_color");
      if (typeof value === "string") return colorField(label, value, (v) => this._set("accent_color", v), placeholder);
      return colorField(label, get(c, `accent_color.${key}`), (v) => this._set(`accent_color.${key}`, v), placeholder);
    };
    accent.append(accentField("Akzent „Ein“ (Punkt, großer Wert, Graph)", "on", "#22c55e"), accentField("Akzent „Aus“", "off", "#9ca3af"));
    body.append(icons, accent, this._panelForm(stateBackgroundSchema), backgrounds, h("div", "sgbc-ed-subtitle", "Schrift"), this._panelForm(textContrastSchema), this._textColors());
  }

  /** Font colors. Maps per state (YAML) are kept and only shown as a note. */
  _textColors() {
    const c = this._config;
    const grid = h("div", "sgbc-ed-grid");
    const field = (label, path, placeholder) => {
      const value = get(c, path);
      if (value && typeof value === "object") {
        const note = h("div", "sgbc-ed-field");
        note.append(h("label", "", label), h("p", "sgbc-ed-note", "Je Zustand im YAML-Modus festgelegt"));
        return note;
      }
      return colorField(label, value, (v) => this._set(path, v), placeholder);
    };
    grid.append(field("Name", "name_style.color", "#ffffff"), field("Werte (beide)", "values.color", "#9ca3af"));
    if (c.value_1) grid.append(field("Wert 1", "value_1.color", "#9ca3af"));
    if (c.value_2) grid.append(field("Wert 2", "value_2.color", "#9ca3af"));
    return grid;
  }

  /** Current threshold list (always read fresh – never from a render closure). */
  _thresholdList() {
    const list = get(this._config, "graph.thresholds");
    return Array.isArray(list) ? clone(list) : [];
  }

  _updateThreshold(idx, patch) {
    const list = this._thresholdList();
    list[idx] = { ...(list[idx] || {}), ...patch };
    this._set("graph.thresholds", list, false);
  }

  /** Set a nested value from a custom control; `rerender` rebuilds the panels. */
  _set(path, value, rerender = false) {
    const config = clone(this._config);
    setPath(config, path, value);
    pruneEmpty(config, path);
    this._emit(config);
    if (rerender) this._renderPanels();
  }

  _onFormChanged(ev) {
    ev.stopPropagation();
    const before = this._config;
    const config = formToConfig(before, { ...configToForm(before), ...(ev.detail?.value || {}) });
    const structural =
      get(before, "graph.color_mode") !== get(config, "graph.color_mode") ||
      get(before, "graph.threshold_mode") !== get(config, "graph.threshold_mode") ||
      get(before, "graph.entity") !== get(config, "graph.entity") ||
      get(before, "graph.enabled") !== get(config, "graph.enabled") ||
      Boolean(before.value_1) !== Boolean(config.value_1) ||
      Boolean(before.value_2) !== Boolean(config.value_2);
    this._emit(config);
    this._syncForms();
    if (structural) this._renderPanels();
  }

  _emit(config) {
    if (!config.type) config.type = "custom:smart-graph-button-card";
    this._config = config;
    this._lastEmitted = JSON.stringify(config);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
}

if (typeof customElements !== "undefined" && !customElements.get(EDITOR_TAG)) {
  customElements.define(EDITOR_TAG, SmartGraphButtonCardEditor);
}
return { EDITOR_TAG, DEFAULT_THRESHOLDS, setPath, pruneEmpty, configToForm, formToConfig };
})();

// ---- src/overview-card.js
const __m_overview_card_js = (() => {
/**
 * Smart Graph Overview Card – several sensors in one card (e.g. room air):
 * overall rating, all values side by side and one history graph that can be
 * switched between the sensors.
 *
 * type: custom:smart-graph-overview-card
 */
const { fetchHistory } = __m_history_provider_js;
const { reduceSeries, appendPoint } = __m_data_reducer_js;
const { renderGraphSVG } = __m_graph_renderer_js;
const { formatNumber, getNumberLocale, getLanguage } = __m_value_formatter_js;
const { resolveLevels, findLevel, overallRating, TYPE_COLORS, TYPE_ICONS, TYPE_NAMES, RATINGS } = __m_levels_js;
const { parseNumber, isPlainObject, isSafeCssValue } = __m_utils_js;
const { isUnavailableState } = __m_state_resolver_js;

const OVERVIEW_TAG = "smart-graph-overview-card";
const OVERVIEW_EDITOR_TAG = "smart-graph-overview-card-editor";

const Base = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
const ENTITY_RE = /^[a-z_]+\.[a-z0-9_]+$/;
const FALLBACK_COLOR = "var(--primary-color, #03a9f4)";

class OverviewConfigError extends Error {}

/** Validate and normalise the overview card config. Throws OverviewConfigError. */
function validateOverviewConfig(raw) {
  if (!isPlainObject(raw)) throw new OverviewConfigError("Die Konfiguration muss ein Objekt sein.");
  const errors = [];
  const list = Array.isArray(raw.entities) ? raw.entities : [];
  if (!list.length) errors.push("entities fehlt: mindestens ein Sensor wird benötigt.");
  const entities = list.map((e, i) => {
    const item = typeof e === "string" ? { entity: e } : isPlainObject(e) ? { ...e } : {};
    if (typeof item.entity !== "string" || !ENTITY_RE.test(item.entity)) errors.push(`entities[${i}]: „${item.entity ?? e}“ ist keine gültige Entity-ID.`);
    if (item.color !== undefined && !isSafeCssValue(item.color)) errors.push(`entities[${i}].color ist ungültig.`);
    if (item.decimals !== undefined) {
      const d = parseNumber(item.decimals);
      if (d === null || d < 0 || d > 6 || !Number.isInteger(d)) errors.push(`entities[${i}].decimals muss 0 bis 6 sein.`);
      else item.decimals = d;
    }
    if (item.levels === undefined) item.levels = "auto";
    return item;
  });
  const hours = raw.hours_to_show === undefined ? 24 : parseNumber(raw.hours_to_show);
  if (hours === null || hours <= 0 || hours > 8760) errors.push("hours_to_show muss zwischen 0 und 8760 liegen.");
  const interval = raw.update_interval === undefined ? 300 : parseNumber(raw.update_interval);
  if (interval === null || interval < 10) errors.push("update_interval muss mindestens 10 Sekunden sein.");
  const graphEntity = raw.graph_entity ?? entities[0]?.entity;
  if (graphEntity !== undefined && !entities.some((e) => e.entity === graphEntity)) errors.push("graph_entity muss einer der entities sein.");
  const ratings = Array.isArray(raw.ratings) ? raw.ratings.map((r, i) => ({ ...RATINGS[Math.min(i, RATINGS.length - 1)], ...(isPlainObject(r) ? r : {}) })) : RATINGS;
  if (errors.length) throw new OverviewConfigError(errors.join("\n"));
  return {
    type: raw.type,
    title: raw.title === undefined ? "Luftqualität" : String(raw.title ?? ""),
    icon: typeof raw.rating_icon === "string" ? raw.rating_icon : "mdi:leaf",
    show_rating: raw.show_rating !== false,
    show_graph: raw.show_graph !== false,
    show_axis: raw.show_axis !== false,
    entities,
    graph_entity: graphEntity,
    hours_to_show: hours,
    update_interval: interval,
    max_points: Math.max(10, Math.min(300, parseNumber(raw.max_points) ?? 96)),
    graph_height: isSafeCssValue(raw.graph_height) ? String(raw.graph_height) : "86px",
    ratings,
  };
}

/** Time axis ticks between start and end (ms): aligned to full hours/days. */
function timeTicks(start, end, maxTicks = 6) {
  const span = end - start;
  if (!(span > 0)) return [];
  const hour = 3600e3;
  const steps = [1, 2, 3, 4, 6, 8, 12, 24, 48, 72, 168].map((h) => h * hour);
  const step = steps.find((s) => span / s <= maxTicks) ?? steps[steps.length - 1];
  const out = [];
  // align to local time
  const first = new Date(start);
  first.setMinutes(0, 0, 0);
  if (step >= 24 * hour) first.setHours(0);
  let t = first.getTime();
  const stepHours = step / hour;
  if (stepHours < 24) {
    while (new Date(t).getHours() % stepHours !== 0) t += hour;
  }
  for (; t <= end; t += step) if (t >= start) out.push(t);
  return out;
}

const STYLES = `
:host { display: block; }
ha-card.sgoc {
  display: block;
  container-type: inline-size;
  box-sizing: border-box;
  padding: 16px;
  border-radius: var(--ha-card-border-radius, 16px);
  color: var(--primary-text-color);
  overflow: hidden;
}
.top { display: flex; align-items: center; gap: 16px; min-width: 0; }
.rating { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 0 1 auto; }
.rating.hidden, .sep.hidden, .panel.hidden, .axis.hidden { display: none; }
.r-icon {
  flex: none; width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--sgoc-rating, #22c55e) 16%, transparent);
  color: var(--sgoc-rating, #22c55e);
  --mdc-icon-size: 28px;
}
.r-texts { display: flex; flex-direction: column; min-width: 0; }
.r-title { font-size: 13px; font-weight: 600; }
.r-label { font-size: 22px; font-weight: 700; line-height: 1.15; color: color-mix(in srgb, var(--sgoc-rating, #22c55e) 78%, var(--primary-text-color)); }
.r-text { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sep { align-self: stretch; width: 1px; background: var(--divider-color, rgba(127, 127, 127, 0.25)); flex: none; }
.items { display: flex; flex: 1 1 auto; justify-content: space-around; gap: 8px; min-width: 0; }
.item {
  all: unset; box-sizing: border-box; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  min-width: 0; padding: 4px 6px; border-radius: 10px;
}
.item:hover { background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
.item:focus-visible { box-shadow: 0 0 0 2px var(--primary-color, #03a9f4); }
.i-icon {
  width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); --mdc-icon-size: 18px;
}
.i-value { font-size: 16px; font-weight: 700; white-space: nowrap; }
.i-unit { font-size: 0.72em; font-weight: 500; color: var(--secondary-text-color); margin-left: 3px; }
.panel {
  margin-top: 14px; padding: 10px 12px 6px; border-radius: 12px;
  background: color-mix(in srgb, var(--primary-text-color) 3.5%, transparent);
}
.p-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.p-title { font-size: 12px; color: var(--secondary-text-color); }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip {
  all: unset; box-sizing: border-box; cursor: pointer; font-size: 11.5px; padding: 4px 11px; border-radius: 999px;
  background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); color: var(--primary-text-color);
}
.chip:focus-visible { box-shadow: 0 0 0 2px var(--primary-color, #03a9f4); }
.chip.active { background: color-mix(in srgb, var(--c) 80%, #000); color: #fff; }
.chart { position: relative; height: var(--sgoc-graph-height, 86px); margin-top: 8px; }
.chart svg { display: block; width: 100%; height: 100%; }
.axis { position: relative; height: 16px; font-size: 10.5px; color: var(--secondary-text-color); }
.axis span { position: absolute; top: 2px; transform: translateX(-50%); white-space: nowrap; }
.axis span.first { transform: none; }
.empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--secondary-text-color); }
.empty.hidden { display: none; }
@container (max-width: 560px) {
  .top { flex-direction: column; align-items: stretch; gap: 12px; }
  .sep { display: none; }
  .items { justify-content: space-between; flex-wrap: wrap; }
  .p-head { flex-direction: column; align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
ha-card.sgoc-error { display: block; padding: 12px 14px; border: 1px solid var(--error-color, #db4437); }
ha-card.sgoc-error .title { font-weight: 600; color: var(--error-color, #db4437); margin-bottom: 4px; }
ha-card.sgoc-error .msg { white-space: pre-wrap; font-size: 13px; }
`;

function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

let uid = 0;

class SmartGraphOverviewCard extends Base {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uid = `sgoc${++uid}`;
    this._points = [];
    this._loaded = false;
    this._token = 0;
    this._size = { w: 0, h: 0 };
  }

  static getConfigElement() {
    return document.createElement(OVERVIEW_EDITOR_TAG);
  }

  static getStubConfig(hass) {
    const states = hass?.states || {};
    const ids = Object.keys(states).filter((id) => id.startsWith("sensor."));
    const pick = [];
    for (const dc of ["temperature", "humidity", "carbon_dioxide", "pm25"]) {
      const id = ids.find((i) => states[i]?.attributes?.device_class === dc);
      if (id) pick.push(id);
    }
    return { title: "Luftqualität", entities: pick.length ? pick : ids.slice(0, 3).length ? ids.slice(0, 3) : ["sensor.example"] };
  }

  setConfig(config) {
    try {
      this._config = validateOverviewConfig(config);
      this._error = null;
    } catch (err) {
      this._config = null;
      this._error = err.message;
    }
    this._selected = this._config?.graph_entity;
    this._points = [];
    this._loaded = false;
    this._token++;
    this._render();
    if (this._connected) this._attach();
  }

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    if (!this._config || !this._els) return;
    let changed = !old || old.themes !== hass.themes || old.locale !== hass.locale;
    for (const e of this._config.entities) if (old?.states?.[e.entity] !== hass.states?.[e.entity]) changed = true;
    if (changed) this._update();
    const s = hass.states?.[this._selected];
    if (this._loaded && s && s !== old?.states?.[this._selected]) {
      const t = Date.parse(s.last_changed || s.last_updated);
      if (Number.isFinite(t)) {
        this._points = appendPoint(this._points, { t, v: parseNumber(s.state) }, Date.now() - this._config.hours_to_show * 3600e3);
        this._drawGraph();
      }
    }
    if (!this._loaded && this._connected && !this._fetching) this._fetch();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return this._config?.show_graph === false ? 2 : 5;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  connectedCallback() {
    this._connected = true;
    if (this._config) this._attach();
  }

  disconnectedCallback() {
    this._connected = false;
    this._detach();
  }

  _attach() {
    this._detach();
    if (!this._config || !this._els) return;
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver((entries) => {
        const r = entries[entries.length - 1]?.contentRect;
        if (!r) return;
        const w = Math.round(r.width);
        const h = Math.round(r.height);
        if (w !== this._size.w || h !== this._size.h) {
          this._size = { w, h };
          this._drawGraph();
        }
      });
      this._ro.observe(this._els.chart);
    }
    this._timer = setInterval(() => this._fetch(), this._config.update_interval * 1000);
    if (this._hass) this._fetch();
  }

  _detach() {
    if (this._ro) this._ro.disconnect();
    this._ro = null;
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    this._token++;
    this._fetching = false;
  }

  // ------------------------------------------------------------ rendering

  _render() {
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = el("style");
    style.textContent = STYLES;
    if (!this._config) {
      const card = el("ha-card", "sgoc-error", { role: "alert" });
      const t = el("div", "title");
      t.textContent = "Smart Graph Overview Card – Konfigurationsfehler";
      const m = el("div", "msg");
      m.textContent = this._error || "Unbekannter Fehler";
      card.append(t, m);
      root.append(style, card);
      this._els = null;
      return;
    }
    const c = this._config;
    const card = el("ha-card", "sgoc");
    const top = el("div", "top");
    const rating = el("div", `rating${c.show_rating ? "" : " hidden"}`);
    const rIcon = el("div", "r-icon");
    const rGlyph = el("ha-icon", "", { icon: c.icon });
    rGlyph.icon = c.icon;
    rIcon.append(rGlyph);
    const rTexts = el("div", "r-texts");
    const rTitle = el("div", "r-title");
    rTitle.textContent = c.title;
    const rLabel = el("div", "r-label");
    const rText = el("div", "r-text");
    rTexts.append(rTitle, rLabel, rText);
    rating.append(rIcon, rTexts);
    const sep = el("div", `sep${c.show_rating ? "" : " hidden"}`);
    const items = el("div", "items");
    const itemEls = c.entities.map((e) => {
      const btn = el("button", "item", { type: "button" });
      const icon = el("div", "i-icon");
      const glyph = el("ha-icon");
      icon.append(glyph);
      const value = el("div", "i-value");
      const num = el("span", "i-num");
      const unit = el("span", "i-unit");
      value.append(num, unit);
      btn.append(icon, value);
      btn.addEventListener("click", () => this._moreInfo(e.entity));
      items.append(btn);
      return { btn, icon, glyph, num, unit };
    });
    top.append(rating, sep, items);

    const panel = el("div", `panel${c.show_graph ? "" : " hidden"}`);
    const head = el("div", "p-head");
    const pTitle = el("div", "p-title");
    pTitle.textContent = `Verlauf (letzte ${formatHours(c.hours_to_show)})`;
    const chips = el("div", "chips", { role: "tablist" });
    const chipEls = c.entities.map((e) => {
      const chip = el("button", "chip", { type: "button", role: "tab" });
      chip.addEventListener("click", () => this._select(e.entity));
      chips.append(chip);
      return chip;
    });
    if (c.entities.length < 2) chips.style.display = "none";
    head.append(pTitle, chips);
    const chart = el("div", "chart");
    chart.style.setProperty("--sgoc-graph-height", c.graph_height);
    const graph = el("div", "graph-svg");
    graph.style.cssText = "position:absolute;inset:0";
    const empty = el("div", "empty hidden");
    chart.append(graph, empty);
    const axis = el("div", `axis${c.show_axis ? "" : " hidden"}`);
    panel.append(head, chart, axis);
    card.append(top, panel);
    root.append(style, card);
    this._els = { card, rating, rLabel, rText, rIcon, items: itemEls, chips: chipEls, chart, graph, empty, axis, pTitle };
    if (this._hass) this._update();
  }

  _info(e) {
    const s = this._hass?.states?.[e.entity];
    const dc = s?.attributes?.device_class;
    const color = e.color || TYPE_COLORS[dc] || FALLBACK_COLOR;
    const name = e.name || TYPE_NAMES[dc] || s?.attributes?.friendly_name || e.entity;
    const icon = e.icon || s?.attributes?.icon || TYPE_ICONS[dc] || "mdi:eye";
    return { s, dc, color, name, icon };
  }

  _update() {
    const c = this._config;
    const els = this._els;
    if (!c || !els || !this._hass) return;
    const locale = getNumberLocale(this._hass);
    const levels = [];
    c.entities.forEach((e, i) => {
      const { s, dc, color, name, icon } = this._info(e);
      const ref = els.items[i];
      ref.btn.style.setProperty("--c", color);
      if (ref.glyph.icon !== icon) {
        ref.glyph.icon = icon;
        ref.glyph.setAttribute("icon", icon);
      }
      const unavailable = !s || isUnavailableState(s.state);
      const n = unavailable ? null : parseNumber(s.state);
      let decimals = e.decimals;
      if (decimals === undefined) {
        const p = this._hass.entities?.[e.entity]?.display_precision;
        if (Number.isInteger(p)) decimals = p;
      }
      ref.num.textContent = n === null ? (unavailable ? "–" : String(s.state)) : formatNumber(n, { decimals, locale }) ?? "–";
      const unit = e.unit ?? s?.attributes?.unit_of_measurement ?? "";
      ref.unit.textContent = n === null ? "" : unit;
      ref.btn.title = name;
      ref.btn.setAttribute("aria-label", `${name}: ${ref.num.textContent}${unit ? ` ${unit}` : ""}`);
      const chip = els.chips[i];
      chip.textContent = name;
      chip.style.setProperty("--c", color);
      chip.classList.toggle("active", e.entity === this._selected);
      chip.setAttribute("aria-selected", String(e.entity === this._selected));
      if (!unavailable) levels.push(findLevel(n, resolveLevels(e.levels, dc)));
    });
    const r = overallRating(levels, c.ratings);
    els.rating.style.setProperty("--sgoc-rating", r?.color || "var(--secondary-text-color)");
    els.rLabel.textContent = r ? r.label : "–";
    els.rText.textContent = r ? r.text : "Keine Bewertung möglich";
  }

  _select(entityId) {
    if (entityId === this._selected) return;
    this._selected = entityId;
    this._points = [];
    this._loaded = false;
    this._token++;
    this._fetching = false;
    this._update();
    this._drawGraph();
    this._fetch();
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  async _fetch() {
    const c = this._config;
    if (!c?.show_graph || !this._hass || !this._connected || !this._selected) return;
    const token = ++this._token;
    this._fetching = true;
    const entityId = this._selected;
    const res = await fetchHistory(this._hass, {
      entityId,
      hours: c.hours_to_show,
      updateInterval: c.update_interval,
      resolution: `${c.max_points}:average:hold`,
    });
    if (token !== this._token || !this._config) return;
    this._fetching = false;
    let points = res.status === "error" && this._points.length ? this._points : res.points;
    const cur = this._hass.states?.[entityId];
    if (cur) {
      const t = Date.parse(cur.last_changed || cur.last_updated);
      const last = points[points.length - 1];
      if (Number.isFinite(t) && (!last || t > last.t)) points = points.concat([{ t, v: parseNumber(cur.state) }]);
    }
    this._points = points;
    this._loaded = true;
    this._status = res.status;
    this._drawGraph();
  }

  _drawGraph() {
    const c = this._config;
    const els = this._els;
    if (!c || !els || !c.show_graph) return;
    let { w, h } = this._size;
    if ((!w || !h) && typeof ResizeObserver === "undefined") {
      w = els.chart.clientWidth;
      h = els.chart.clientHeight;
    }
    const end = Date.now();
    const start = end - c.hours_to_show * 3600e3;
    this._drawAxis(start, end);
    if (!w || !h) return;
    const entity = c.entities.find((e) => e.entity === this._selected);
    const color = entity ? this._info(entity).color : FALLBACK_COLOR;
    const data = reduceSeries(this._points, { start, end, buckets: c.max_points, aggregation: "average", fill: "hold" });
    const svg = renderGraphSVG({
      data,
      width: w,
      height: h,
      type: "smooth-area",
      color,
      baseline: "bottom",
      headroom: 0.3,
      lineWidth: 2,
      fillOpacity: 0.3,
      idPrefix: this._uid,
    });
    if (svg !== this._lastSvg) {
      els.graph.innerHTML = svg;
      this._lastSvg = svg;
    }
    const hasData = Boolean(svg);
    els.empty.classList.toggle("hidden", hasData || !this._loaded);
    els.empty.textContent = this._status === "error" ? "Verlauf nicht verfügbar" : "Keine Daten im Zeitraum";
  }

  _drawAxis(start, end) {
    const els = this._els;
    if (!this._config.show_axis) return;
    const language = getLanguage(this._hass);
    const multiDay = end - start > 48 * 3600e3;
    const fmt = new Intl.DateTimeFormat(language || undefined, multiDay ? { day: "2-digit", month: "2-digit" } : { hour: "2-digit", minute: "2-digit" });
    const ticks = timeTicks(start, end, (this._size.w || 600) < 420 ? 4 : 6);
    const key = ticks.map((t) => fmt.format(t)).join("|") + (this._size.w || 0);
    if (key === this._axisKey) return;
    this._axisKey = key;
    els.axis.replaceChildren();
    for (const t of ticks) {
      const pos = ((t - start) / (end - start)) * 100;
      if (pos > 96) continue; // a label at the very right edge would be cut off
      const span = el("span", pos < 4 ? "first" : "");
      span.style.left = `${pos}%`;
      span.textContent = fmt.format(t);
      els.axis.append(span);
    }
  }
}

function formatHours(h) {
  if (h % 24 === 0 && h >= 48) return `${h / 24} Tage`;
  if (h === 24) return "24 Stunden";
  return h === 1 ? "Stunde" : `${formatNumber(h, { decimals: h % 1 ? 1 : 0, locale: "de" })} Stunden`;
}

// ------------------------------------------------------------ editor

const LABELS = {
  title: "Titel",
  entities: "Sensoren",
  graph_entity: "Graph zu Beginn (Sensor)",
  hours_to_show: "Zeitraum (Stunden)",
  show_rating: "Gesamtbewertung anzeigen",
  show_graph: "Verlauf anzeigen",
};

/** Editor data ↔ config: entities may be objects in YAML – keep them. */
function overviewToForm(config) {
  const c = config || {};
  return {
    title: c.title ?? "Luftqualität",
    entities: (Array.isArray(c.entities) ? c.entities : []).map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean),
    graph_entity: c.graph_entity,
    hours_to_show: c.hours_to_show ?? 24,
    show_rating: c.show_rating !== false,
    show_graph: c.show_graph !== false,
  };
}

function overviewFromForm(config, form) {
  const out = { ...(config || {}) };
  const d = form || {};
  const old = Array.isArray(out.entities) ? out.entities : [];
  out.entities = (d.entities || []).map((id) => old.find((e) => (typeof e === "string" ? e : e?.entity) === id) ?? id);
  if (typeof d.title === "string") out.title = d.title;
  if (d.graph_entity && d.entities?.includes(d.graph_entity)) out.graph_entity = d.graph_entity;
  else delete out.graph_entity;
  if (typeof d.hours_to_show === "number" && d.hours_to_show !== 24) out.hours_to_show = d.hours_to_show;
  else delete out.hours_to_show;
  for (const k of ["show_rating", "show_graph"]) {
    if (d[k] === false) out[k] = false;
    else delete out[k];
  }
  return out;
}

class SmartGraphOverviewCardEditor extends Base {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }

  _render() {
    if (!customElements.get("ha-form")) {
      this.textContent = "Der visuelle Editor ist nicht verfügbar. Bitte den YAML-Modus verwenden.";
      return;
    }
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => LABELS[s.name] ?? s.name;
      this._form.addEventListener("value-changed", (ev) => {
        const next = overviewFromForm(this._config, ev.detail.value);
        this._config = next;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
      });
      this.append(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = [
      { name: "title", selector: { text: {} } },
      { name: "entities", selector: { entity: { multiple: true, filter: { domain: "sensor" } } } },
      { name: "graph_entity", selector: { entity: { include_entities: overviewToForm(this._config).entities } } },
      { name: "hours_to_show", selector: { number: { min: 1, max: 168, mode: "box" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_rating", selector: { boolean: {} } },
          { name: "show_graph", selector: { boolean: {} } },
        ],
      },
    ];
    this._form.data = overviewToForm(this._config);
  }
}

function registerOverviewCard() {
  if (typeof customElements === "undefined" || customElements.get(OVERVIEW_TAG)) return;
  customElements.define(OVERVIEW_TAG, SmartGraphOverviewCard);
  if (!customElements.get(OVERVIEW_EDITOR_TAG)) customElements.define(OVERVIEW_EDITOR_TAG, SmartGraphOverviewCardEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: OVERVIEW_TAG,
    name: "Smart Graph Overview Card",
    description: "Mehrere Sensoren in einer Karte (z. B. Luftqualität): Gesamtbewertung, alle Werte und ein umschaltbarer Verlaufsgraph.",
    preview: true,
    documentationURL: "https://github.com/rest2178/smart-graph-button-card",
  });
}
return { OVERVIEW_TAG, OVERVIEW_EDITOR_TAG, OverviewConfigError, validateOverviewConfig, timeTicks, SmartGraphOverviewCard, overviewToForm, overviewFromForm, SmartGraphOverviewCardEditor, registerOverviewCard };
})();

// ---- src/media-card.js
const __m_media_card_js = (() => {
/**
 * Smart Graph Media Card – compact control for any media player:
 * device name, player switch, power, volume, previous / play / next and
 * preset buttons (radio stations, playlists, favorites).
 *
 * Uses only the standard media_player services, so it works with Alexa Media
 * Player, Sonos, Google Cast, Spotify, Music Assistant, HEOS, MusicCast, DLNA …
 *
 * type: custom:smart-graph-media-card
 */
const { isPlainObject, parseNumber } = __m_utils_js;

const MEDIA_TAG = "smart-graph-media-card";
const MEDIA_EDITOR_TAG = "smart-graph-media-card-editor";

const Base = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
const PLAYER_RE = /^media_player\.[a-z0-9_]+$/;
const SERVICE_RE = /^[a-z_]+\.[a-z0-9_]+$/;

/** media_player supported_features bits. */
const FEATURES = Object.freeze({
  PAUSE: 1,
  VOLUME_SET: 4,
  VOLUME_MUTE: 8,
  PREVIOUS_TRACK: 16,
  NEXT_TRACK: 32,
  TURN_ON: 128,
  TURN_OFF: 256,
  PLAY_MEDIA: 512,
  VOLUME_STEP: 1024,
  SELECT_SOURCE: 2048,
  STOP: 4096,
  PLAY: 16384,
  BROWSE_MEDIA: 131072,
});

function supports(stateObj, feature) {
  return ((Number(stateObj?.attributes?.supported_features) || 0) & feature) !== 0;
}

const STATE_TEXT = {
  playing: "Spielt",
  paused: "Pausiert",
  idle: "Bereit",
  standby: "Standby",
  on: "An",
  off: "Aus",
  buffering: "Lädt …",
  unavailable: "Nicht verfügbar",
  unknown: "Unbekannt",
};

class MediaConfigError extends Error {}

/** thumbnail: cover instead of the symbol; background: blurred cover behind the card; both; none. */
const ARTWORK_MODES = ["thumbnail", "background", "both", "none"];
/**
 * Preset buttons: logo (small picture + name), tile (picture fills the button,
 * name below), image (picture only – the name in the tile while there is no
 * picture), text (name only).
 */
const PRESET_STYLES = ["logo", "tile", "image", "text"];

/** Key under which an automatically learned preset picture is stored. */
function presetImageKey(players, preset) {
  return `sgmc-img2:${players[0] || ""}:${preset.media_content_id ?? preset.source ?? preset.action ?? ""}:${preset.name}`;
}

function normalizePreset(p, i, errors) {
  if (typeof p === "string" || typeof p === "number") return { name: String(p), media_content_id: String(p) };
  if (!isPlainObject(p)) {
    errors.push(`presets[${i}] muss ein Text oder ein Objekt sein.`);
    return null;
  }
  const out = { ...p };
  const action = p.action ?? p.perform_action ?? p.service;
  if (action !== undefined) {
    if (action === "") return null;
    if (typeof action !== "string" || !SERVICE_RE.test(action)) errors.push(`presets[${i}].action „${action}“ ist ungültig (z. B. script.radio_an).`);
    out.action = action;
    delete out.perform_action;
    delete out.service;
    if (out.data !== undefined && !isPlainObject(out.data)) errors.push(`presets[${i}].data muss ein Objekt sein.`);
  } else if ((p.source === undefined || p.source === "") && (p.media_content_id === undefined || p.media_content_id === "")) {
    return null; // still incomplete (e.g. just added in the editor) – not shown
  }
  if (out.media_content_id !== undefined) out.media_content_id = String(out.media_content_id);
  if (out.source !== undefined) out.source = String(out.source);
  out.name = String(p.name ?? p.source ?? p.media_content_id ?? action ?? "");
  if (out.image !== undefined && out.image !== null && out.image !== "") {
    if (typeof out.image !== "string" || /["\\\n<>]/.test(out.image)) errors.push(`presets[${i}].image muss eine Bildadresse sein (z. B. /local/logos/oe3.png).`);
  } else delete out.image;
  return out;
}

/** Validate and normalise the media card config. Throws MediaConfigError. */
function validateMediaConfig(raw) {
  if (!isPlainObject(raw)) throw new MediaConfigError("Die Konfiguration muss ein Objekt sein.");
  const errors = [];
  const players = [];
  const names = {};
  const add = (e, path) => {
    const item = typeof e === "string" ? { entity: e } : isPlainObject(e) ? e : {};
    if (typeof item.entity !== "string" || !PLAYER_RE.test(item.entity)) {
      errors.push(`${path}: „${item.entity ?? e}“ ist keine media_player-Entity.`);
      return;
    }
    if (!players.includes(item.entity)) players.push(item.entity);
    if (typeof item.name === "string" && item.name) names[item.entity] = item.name;
  };
  if (raw.entity !== undefined) add(raw.entity, "entity");
  (Array.isArray(raw.entities) ? raw.entities : []).forEach((e, i) => add(e, `entities[${i}]`));
  if (!players.length && !errors.length) errors.push("entity fehlt: ein media_player wird benötigt.");
  const presets = (Array.isArray(raw.presets) ? raw.presets : []).map((p, i) => normalizePreset(p, i, errors)).filter(Boolean);
  // playlists: "auto" (media library of the player), a list like presets, or false
  let playlists = "auto";
  if (raw.playlists === false || raw.playlists === null) playlists = null;
  else if (Array.isArray(raw.playlists)) {
    const pErr = [];
    playlists = raw.playlists.map((p, i) => normalizePreset(p, i, pErr)).filter(Boolean);
    errors.push(...pErr.map((e) => e.replace(/^presets/, "playlists")));
  } else if (raw.playlists !== undefined && raw.playlists !== "auto") errors.push("playlists muss „auto“, false oder eine Liste sein.");
  let columns = raw.preset_columns === undefined ? null : parseNumber(raw.preset_columns);
  if (columns !== null && (!Number.isInteger(columns) || columns < 1 || columns > 6)) errors.push("preset_columns muss 1 bis 6 sein.");
  const presetStyle = raw.preset_style === undefined ? "logo" : raw.preset_style;
  if (!PRESET_STYLES.includes(presetStyle)) errors.push(`preset_style „${raw.preset_style}“ ist ungültig. Erlaubt: ${PRESET_STYLES.join(", ")}.`);
  const artwork = raw.artwork === undefined ? "thumbnail" : raw.artwork === false ? "none" : raw.artwork === true ? "both" : raw.artwork;
  if (!ARTWORK_MODES.includes(artwork)) errors.push(`artwork „${raw.artwork}“ ist ungültig. Erlaubt: ${ARTWORK_MODES.join(", ")}.`);
  if (errors.length) throw new MediaConfigError(errors.join("\n"));
  if (columns === null) columns = Math.max(1, Math.min(3, presets.length || 1));
  const flag = (k) => raw[k] !== false;
  return {
    type: raw.type,
    players,
    names,
    name: typeof raw.name === "string" && raw.name ? raw.name : undefined,
    icon: typeof raw.icon === "string" && raw.icon ? raw.icon : undefined,
    show_power: flag("show_power"),
    show_volume: flag("show_volume"),
    show_controls: flag("show_controls"),
    show_media_info: flag("show_media_info"),
    show_source_list: flag("show_source_list"),
    artwork,
    preset_style: presetStyle,
    preset_show_name: raw.preset_show_name !== false,
    preset_auto_image: raw.preset_auto_image !== false,
    presets,
    playlists,
    show_options_menu: flag("show_options_menu"),
    preset_columns: columns,
  };
}

const URL_RE = /^[a-z][a-z0-9+.-]*:\/\//i;

/** Cover / station picture of the player while something is playing (or null). */
function artworkUrl(stateObj, hass) {
  if (!stateObj || !["playing", "paused", "buffering", "on"].includes(stateObj.state)) return null;
  const pic = stateObj.attributes?.entity_picture_local || stateObj.attributes?.entity_picture;
  if (typeof pic !== "string" || !pic) return null;
  if (URL_RE.test(pic) || pic.startsWith("data:")) return pic;
  return typeof hass?.hassUrl === "function" ? hass.hassUrl(pic) : pic;
}

/**
 * media_content_type when a preset only gives media_content_id – chosen by the
 * integration (platform) behind the player.
 */
function defaultContentType(platform, id, kind = "preset") {
  const s = String(id ?? "");
  const playlist = kind === "playlist";
  switch (platform) {
    case "alexa_media":
      // station name as in the Alexa app, e.g. "Radio Steiermark"; playlists from Amazon Music
      return playlist ? "AMAZON_MUSIC" : "TUNEIN";
    case "sonos":
      return s.startsWith("FV:") ? "favorite_item_id" : playlist ? "playlist" : "music";
    case "music_assistant":
    case "mass":
      return URL_RE.test(s) ? "music" : playlist ? "playlist" : "radio";
    case "spotify":
    case "spotifyplus": {
      const m = /^spotify:(playlist|album|artist|track|episode|show):/.exec(s);
      return m ? m[1] : "music";
    }
    default:
      return "music";
  }
}

/** Service call for a preset: { domain, service, data }. */
function presetCall(preset, entityId, platform, kind = "preset") {
  if (preset.action) {
    const [domain, service] = preset.action.split(".");
    const data = { ...(preset.data || {}) };
    // "entity_id: current" → the player that is selected in the card
    if (data.entity_id === "current") data.entity_id = entityId;
    return { domain, service, data };
  }
  if (preset.source !== undefined) return { domain: "media_player", service: "select_source", data: { entity_id: entityId, source: preset.source } };
  return {
    domain: "media_player",
    service: "play_media",
    data: {
      entity_id: entityId,
      media_content_id: preset.media_content_id,
      media_content_type: preset.media_content_type || defaultContentType(platform, preset.media_content_id, kind),
    },
  };
}

function wordMatch(hay, key) {
  if (key.length < 2) return false;
  const i = hay.indexOf(key);
  if (i < 0) return false;
  const isWord = (ch) => ch !== undefined && /[\p{L}\p{N}]/u.test(ch);
  return !isWord(hay[i - 1]) && !isWord(hay[i + key.length]);
}

/** Index of the preset that is playing right now (or -1). */
function activePreset(presets, stateObj) {
  if (!stateObj || !["playing", "paused", "buffering", "on"].includes(stateObj.state)) return -1;
  const a = stateObj.attributes || {};
  const hay = [a.media_title, a.media_channel, a.media_artist, a.media_album_name, a.media_playlist, a.source, a.media_content_id]
    .filter((v) => v !== undefined && v !== null && v !== "")
    .map((v) => String(v).toLowerCase());
  if (!hay.length) return -1;
  return presets.findIndex((p) => {
    const keys = [p.match, p.source, p.media_content_id, p.name].filter(Boolean).map((v) => String(v).toLowerCase());
    return keys.some((k) => hay.some((h) => h === k || (k.length > 3 && h.includes(k)) || wordMatch(h, k)));
  });
}

/** Picture address without the rotating access token (to compare pictures). */
function artKey(url) {
  if (!url) return null;
  return String(url).replace(/([?&])token=[^&]*(&|$)/, (m, a, b) => (b ? a : "")).replace(/[?&]$/, "");
}

/**
 * Index of the preset pressed last, as long as it is plausibly still playing.
 * `pressed` = { player, index, at, idBefore, artBefore } (state at the press).
 * Slow integrations (Alexa polls) report the new station only after a while:
 * until the player shows new content (other media_content_id or picture) the
 * press stays pending. After that the content id is remembered and a later
 * change means something else plays. Sets `pressed.started` once the new
 * content is visible. Returns -1 when the preset no longer applies.
 */
function pressedPreset(pressed, player, stateObj, now) {
  if (!pressed || pressed.player !== player || !stateObj) return -1;
  const age = now - pressed.at;
  const running = ["playing", "paused", "buffering", "on"].includes(stateObj.state);
  if (!running) return age < 30000 ? pressed.index : -1;
  const id = stateObj.attributes?.media_content_id ?? null;
  if (pressed.contentId === undefined) {
    const changed = id !== (pressed.idBefore ?? null) || artKey(artworkUrl(stateObj)) !== artKey(pressed.artBefore);
    if (changed || age > 300000) {
      pressed.contentId = id;
      pressed.started = changed;
    }
  } else if (pressed.contentId !== null && id && id !== pressed.contentId) return -1;
  return pressed.index;
}

/**
 * Which preset is highlighted. A pressed preset wins while the player has not
 * yet reported the new content (it still shows the old station, which may
 * match another preset by name); afterwards a preset recognised by name wins.
 * Returns { current, dropPressed }.
 */
function currentPreset(matched, pressedIndex, pressed) {
  if (!pressed || pressedIndex < 0) return { current: matched, dropPressed: !!pressed };
  const pending = pressed.contentId === undefined;
  if (pending || matched < 0 || matched === pressedIndex) return { current: pressedIndex, dropPressed: false };
  return { current: matched, dropPressed: true };
}

// ---- learned preset pictures: browser cache + Home Assistant user data (all devices of the user)

const LOGO_DATA_KEY = "smart_graph_media_logos";
const logoStore = { map: null, loading: null, conn: null, dirty: {}, timer: null, cards: new Set() };

function readLocalLogo(key) {
  try {
    const v = localStorage.getItem(key);
    if (!v) return null;
    if (v[0] === "{") return JSON.parse(v);
    return { img: v, src: null };
  } catch (_err) {
    return null;
  }
}

function writeLocalLogo(key, rec) {
  try {
    if (rec) localStorage.setItem(key, JSON.stringify(rec));
    else localStorage.removeItem(key);
  } catch (_err) {
    /* storage full or blocked */
  }
}

function getLogo(key) {
  return (logoStore.map && logoStore.map[key]) || readLocalLogo(key);
}

function repaintLogoCards() {
  for (const card of logoStore.cards) card._paintPresetImages();
}

function loadServerLogos(hass) {
  const conn = hass?.connection;
  if (!conn || typeof conn.sendMessagePromise !== "function") return;
  logoStore.conn = conn;
  if (logoStore.loading) return;
  logoStore.loading = conn
    .sendMessagePromise({ type: "frontend/get_user_data", key: LOGO_DATA_KEY })
    .then((res) => {
      const remote = isPlainObject(res?.value) ? res.value : {};
      for (const [k, rec] of Object.entries(remote)) if (isPlainObject(rec) && !(k in logoStore.dirty)) writeLocalLogo(k, rec);
      logoStore.map = { ...remote, ...(logoStore.map || {}) };
      repaintLogoCards();
    })
    .catch(() => {
      logoStore.map = logoStore.map || {};
    });
}

function setLogo(key, rec) {
  logoStore.map = { ...(logoStore.map || {}) };
  if (rec) logoStore.map[key] = rec;
  else delete logoStore.map[key];
  writeLocalLogo(key, rec);
  logoStore.dirty[key] = rec || null;
  clearTimeout(logoStore.timer);
  logoStore.timer = setTimeout(saveServerLogos, 1500);
  repaintLogoCards();
}

async function saveServerLogos() {
  const conn = logoStore.conn;
  if (!conn) return;
  const dirty = logoStore.dirty;
  logoStore.dirty = {};
  try {
    // merge with what other devices saved meanwhile
    const res = await conn.sendMessagePromise({ type: "frontend/get_user_data", key: LOGO_DATA_KEY });
    const value = isPlainObject(res?.value) ? { ...res.value } : {};
    for (const [k, rec] of Object.entries(dirty)) {
      if (rec) value[k] = rec;
      else delete value[k];
    }
    await conn.sendMessagePromise({ type: "frontend/set_user_data", key: LOGO_DATA_KEY, value });
  } catch (_err) {
    logoStore.dirty = { ...dirty, ...logoStore.dirty }; // try again with the next change
  }
}

const PLAYLIST_RE = /playlist|wiedergabeliste/i;

/** Playable playlists among the children of a media browser node. */
function playlistItems(node, inPlaylistFolder = false) {
  return (Array.isArray(node?.children) ? node.children : []).filter(
    (c) => c && c.can_play && (inPlaylistFolder || c.media_class === "playlist" || PLAYLIST_RE.test(String(c.media_content_type || "")))
  );
}

/** Folders that probably contain playlists ("Playlists", "Meine Playlists" …). */
function playlistFolders(node) {
  return (Array.isArray(node?.children) ? node.children : []).filter(
    (c) => c && c.can_expand && (PLAYLIST_RE.test(String(c.title || "")) || PLAYLIST_RE.test(String(c.media_content_type || "")) || PLAYLIST_RE.test(String(c.media_content_id || "")))
  );
}

/**
 * Search the media library of a player for playlists. `browse(args)` returns a
 * media browser node (media_player/browse_media). Looks into folders named
 * like "Playlists" up to two levels deep; at most `maxCalls` requests.
 */
async function findPlaylists(browse, maxCalls = 8) {
  const found = [];
  const seen = new Set();
  const queue = [{ depth: 0, args: {}, inFolder: false }];
  let calls = 0;
  while (queue.length && calls < maxCalls && found.length < 60) {
    const { depth, args, inFolder } = queue.shift();
    calls += 1;
    let node;
    try {
      node = await browse(args);
    } catch (_err) {
      continue;
    }
    for (const it of playlistItems(node, inFolder)) {
      const key = `${it.media_content_type}|${it.media_content_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      found.push({ name: String(it.title ?? it.media_content_id), media_content_id: it.media_content_id, media_content_type: it.media_content_type, image: it.thumbnail || undefined });
    }
    if (depth >= 2) continue;
    let folders = playlistFolders(node).map((f) => ({ f, inFolder: true }));
    // nothing named "Playlists" on the top level: look one level into the libraries
    if (!folders.length && depth === 0) folders = (node?.children || []).filter((ch) => ch?.can_expand).slice(0, 4).map((f) => ({ f, inFolder: false }));
    for (const { f, inFolder: inF } of folders) queue.push({ depth: depth + 1, args: { media_content_id: f.media_content_id, media_content_type: f.media_content_type }, inFolder: inF });
  }
  return found;
}

function volumeIcon(level, muted) {
  const v = Number(level);
  if (muted || !Number.isFinite(v) || v <= 0) return muted ? "mdi:volume-off" : "mdi:volume-low";
  return v < 0.34 ? "mdi:volume-low" : v < 0.67 ? "mdi:volume-medium" : "mdi:volume-high";
}

function playerIcon(stateObj) {
  const dc = stateObj?.attributes?.device_class;
  if (dc === "speaker") return "mdi:speaker";
  if (dc === "tv") return "mdi:television";
  if (dc === "receiver") return "mdi:audio-video";
  return "mdi:cast";
}

const STYLES = `
:host { display: block; }
ha-card.sgmc {
  position: relative;
  box-sizing: border-box;
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--primary-text-color);
  --sgmc-active: var(--state-media_player-active-color, var(--primary-color, #03a9f4));
}
.head { display: flex; align-items: center; gap: 12px; min-width: 0; }
.p-icon { flex: none; --mdc-icon-size: 26px; color: var(--secondary-text-color); display: inline-flex; width: 40px; justify-content: center; }
.p-icon.active { color: var(--sgmc-active); }
.art-thumb { flex: none; width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25); }
/* blurred cover behind the card, toned down with the card color so text stays readable */
.art-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity 400ms ease; }
.art-bg.show { opacity: 1; }
.art-bg::before {
  content: "";
  position: absolute;
  inset: -40px;
  background: var(--sgmc-art) center / cover no-repeat;
  filter: blur(22px) saturate(1.4);
}
.art-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--card-background-color, #fff) 68%, transparent);
}
ha-card.sgmc > :not(.art-bg) { position: relative; z-index: 1; }
ha-card.sgmc > .menu { position: absolute; z-index: 5; }
ha-card.sgmc.has-art button.preset:not(.active) { background: color-mix(in srgb, var(--card-background-color, #fff) 82%, transparent); }
.titles { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.name, .info { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.name { font-size: 16px; font-weight: 500; line-height: 1.25; }
.info { font-size: 12px; color: var(--secondary-text-color); line-height: 1.3; }
.info.hidden, .hidden { display: none !important; }
button.ic {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--primary-text-color);
  cursor: pointer;
  --mdc-icon-size: 24px;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 120ms ease, color 120ms ease;
}
button.ic:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
button.ic:focus-visible { outline: 2px solid var(--sgmc-active); outline-offset: 1px; }
button.ic:disabled { color: var(--disabled-text-color, #9ca3af); cursor: default; background: transparent; }
button.ic.power:not(.on):not(:disabled) { color: var(--secondary-text-color); }
.menu-btn ha-icon { transition: transform 160ms ease; }
.menu-btn.open ha-icon { transform: rotate(180deg); }
.menu {
  position: absolute;
  z-index: 5;
  top: 58px;
  right: 16px;
  min-width: 200px;
  max-width: calc(100% - 32px);
  max-height: 300px;
  overflow: auto;
  padding: 6px 0;
  border-radius: 12px;
  background: var(--card-background-color, #fff);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
  border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
}
.menu.omenu { right: 8px; left: auto; min-width: 240px; max-height: 340px; }
button.ic.opt-btn { width: 32px; margin-left: -8px; margin-right: -8px; }
button.ic.opt-btn.open { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
.menu .back { display: flex; align-items: center; gap: 6px; padding: 2px 8px 6px 4px; border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2)); margin-bottom: 4px; font-weight: 600; font-size: 14px; }
.menu .back button.ic { width: 34px; height: 34px; --mdc-icon-size: 20px; }
.menu .empty { padding: 10px 16px 12px; font-size: 13px; color: var(--secondary-text-color); line-height: 1.4; }
.menu button.item .thumb { width: 32px; height: 32px; border-radius: 5px; object-fit: cover; flex: none; background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); }
.menu button.item .grow { flex: 1 1 auto; min-width: 0; }
.menu button.item ha-icon.more { color: var(--secondary-text-color); margin-left: auto; }
.menu .section { padding: 8px 16px 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--secondary-text-color); }
.menu button.item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 16px;
  border: 0;
  background: transparent;
  color: var(--primary-text-color);
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}
.menu button.item:hover, .menu button.item:focus-visible { background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); outline: none; }
.menu button.item.selected { color: var(--sgmc-active); font-weight: 600; }
.menu button.item ha-icon { --mdc-icon-size: 18px; flex: none; }
.menu button.item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.controls { display: flex; align-items: center; gap: 4px; min-width: 0; }
.vol { flex: 1 1 auto; min-width: 60px; display: flex; align-items: center; padding: 0 8px; }
input.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 24px;
  margin: 0;
  background: transparent;
  cursor: pointer;
  --sgmc-fill: 0%;
}
input.slider:disabled { cursor: default; opacity: 0.5; }
input.slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, var(--sgmc-active) var(--sgmc-fill), color-mix(in srgb, var(--primary-text-color) 22%, transparent) var(--sgmc-fill));
}
input.slider::-moz-range-track { height: 4px; border-radius: 2px; background: color-mix(in srgb, var(--primary-text-color) 22%, transparent); }
input.slider::-moz-range-progress { height: 4px; border-radius: 2px; background: var(--sgmc-active); }
input.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -7px;
  border: 0;
  border-radius: 50%;
  background: var(--sgmc-active);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
input.slider::-moz-range-thumb { width: 18px; height: 18px; border: 0; border-radius: 50%; background: var(--sgmc-active); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); }
input.slider:focus-visible { outline: none; }
input.slider:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 4px color-mix(in srgb, var(--sgmc-active) 30%, transparent); }
.transport { display: flex; align-items: center; gap: 4px; flex: none; }
.presets { display: grid; grid-template-columns: repeat(var(--sgmc-cols, 3), minmax(0, 1fr)); gap: 10px; }
button.preset {
  min-width: 0;
  height: 40px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: var(--card-background-color, #fff);
  color: var(--primary-text-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.22), 0 1px 1px rgba(0, 0, 0, 0.08);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 120ms ease, box-shadow 120ms ease, transform 80ms ease;
}
button.preset:hover { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25); }
button.preset:active { transform: scale(0.98); }
button.preset:focus-visible { outline: 2px solid var(--sgmc-active); outline-offset: 2px; }
button.preset:disabled { cursor: default; opacity: 0.5; }
button.preset.active {
  color: var(--sgmc-active);
  border-color: color-mix(in srgb, var(--sgmc-active) 55%, transparent);
  background: color-mix(in srgb, var(--sgmc-active) 10%, var(--card-background-color, #fff));
}
button.preset ha-icon { --mdc-icon-size: 18px; margin-right: 6px; vertical-align: -3px; }
button.preset .p-img { display: none; object-fit: cover; flex: none; background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); }
button.preset .p-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
/* logo: small picture left of the name */
.presets.style-logo button.preset.has-img { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0 6px 0 5px; }
.presets.style-logo button.preset.has-img .p-img { display: block; width: 28px; height: 28px; border-radius: 5px; }
.presets.style-logo button.preset.has-img ha-icon { display: none; }
/* tile: picture fills the button, name small below */
.presets.style-tile { gap: 12px; }
.presets.style-tile button.preset { height: auto; padding: 0; display: flex; flex-direction: column; align-items: stretch; border-radius: 10px; overflow: hidden; }
.presets.style-tile button.preset .p-art {
  position: relative;
  aspect-ratio: 16 / 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  box-sizing: border-box;
  font-size: 15px;
  font-weight: 700;
  white-space: normal;
  line-height: 1.2;
  text-align: center;
  overflow: hidden;
  background: color-mix(in srgb, var(--sgmc-active) 12%, var(--card-background-color, #fff));
  color: var(--sgmc-active);
}
.presets.style-tile button.preset .p-art ha-icon { --mdc-icon-size: 28px; margin: 0; }
.presets.style-image button.preset .p-art { flex-direction: column; gap: 4px; }
.presets.style-image button.preset .p-art ha-icon { --mdc-icon-size: 22px; }
.presets.style-tile button.preset.has-img .p-art { padding: 0; background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); }
.presets.style-tile button.preset.has-img .p-art > :not(.p-img) { display: none; }
.presets.style-tile button.preset .p-img { position: absolute; inset: 0; width: 100%; height: 100%; }
.presets.style-tile button.preset.has-img .p-img { display: block; }
.presets.style-tile button.preset .p-name { padding: 6px 8px 7px; font-size: 12px; text-align: center; }
.presets.style-tile.no-name button.preset .p-name { display: none; }
.presets.style-tile button.preset.active { box-shadow: 0 0 0 2px var(--sgmc-active), 0 1px 3px rgba(0, 0, 0, 0.22); }
.warn { padding: 12px 16px; color: var(--error-color, #db4437); font-size: 13px; white-space: pre-line; }
`;

function el(tag, className, attrs) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

function iconButton(className, icon, label) {
  const b = el("button", `ic ${className}`, { type: "button", "aria-label": label, title: label });
  const i = el("ha-icon");
  i.icon = icon;
  i.setAttribute("icon", icon);
  b.append(i);
  return b;
}

function setIcon(button, icon) {
  const i = button.firstElementChild;
  if (i && i.icon !== icon) {
    i.icon = icon;
    i.setAttribute("icon", icon);
  }
}

class SmartGraphMediaCard extends Base {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._volSentAt = 0;
  }

  static getConfigElement() {
    return document.createElement(MEDIA_EDITOR_TAG);
  }

  static getStubConfig(hass) {
    const id = Object.keys(hass?.states || {}).find((e) => e.startsWith("media_player.")) || "media_player.wohnzimmer";
    return { entity: id, presets: [] };
  }

  setConfig(config) {
    try {
      this._config = validateMediaConfig(config);
      this._error = null;
    } catch (err) {
      this._config = null;
      this._error = err.message || String(err);
    }
    this._current = this._restoreCurrent();
    this._build();
    if (this._hass) this._update(true);
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    if (!logoStore.loading) loadServerLogos(hass);
    if (!this._config || !this._els) return;
    // only re-render when one of our players changed
    const changed = !prev || this._config.players.some((id) => prev.states?.[id] !== hass.states?.[id]);
    if (changed) this._update();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return this._config?.presets.length ? 3 : 2;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback() {
    this._outside = (ev) => {
      if (!this._els || ev.composedPath().includes(this)) return;
      if (!this._els.menu.classList.contains("hidden")) this._toggleMenu(false);
      if (!this._els.omenu.classList.contains("hidden")) this._toggleOptions(false);
    };
    document.addEventListener("click", this._outside, true);
    logoStore.cards.add(this);
  }

  disconnectedCallback() {
    logoStore.cards.delete(this);
    if (this._outside) document.removeEventListener("click", this._outside, true);
    clearTimeout(this._volTimer);
  }

  _presetImage(i) {
    const c = this._config;
    const p = c.presets[i];
    if (!p || c.preset_style === "text") return { src: null };
    if (p.image) return { src: typeof this._hass?.hassUrl === "function" && p.image.startsWith("/") && !p.image.startsWith("//") ? this._hass.hassUrl(p.image) : p.image };
    if (!c.preset_auto_image) return { src: null };
    const rec = getLogo(presetImageKey(c.players, p));
    return { src: rec?.img || null, auto: true };
  }

  _paintPresetImages() {
    (this._els?.presetButtons || []).forEach(({ button, img }, i) => {
      const { src, auto } = this._presetImage(i);
      if (!src) {
        button.classList.remove("has-img");
        if (img.hasAttribute("src")) img.removeAttribute("src");
        return;
      }
      if (auto) img.dataset.auto = "1";
      else delete img.dataset.auto;
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
      else if (img.complete && img.naturalWidth) button.classList.add("has-img");
    });
  }

  _forgetPresetImage(i, failedSrc) {
    const key = presetImageKey(this._config.players, this._config.presets[i]);
    const rec = getLogo(key);
    if (rec && (!failedSrc || rec.img === failedSrc)) setLogo(key, null);
  }

  /**
   * Store the picture of the playing station for preset i. `url` is the
   * loadable address, `rawUrl` the address as the player reports it (used to
   * notice a changed picture). `replace`: overwrite a stored picture when the
   * station picture has changed. Pictures from Home Assistant (media proxy with
   * a rotating token) are copied as a small image; pictures from other servers
   * are stored as their address. Unchanged pictures are not loaded again.
   */
  _learnPresetImage(i, url, rawUrl, replace) {
    const c = this._config;
    const p = c.presets[i];
    if (!p || p.image || !c.preset_auto_image || c.preset_style === "text") return;
    const key = presetImageKey(c.players, p);
    const src = artKey(rawUrl || url);
    const rec = getLogo(key);
    if ((rec && (!replace || rec.src === src)) || this._learning?.[key]) return;
    this._learning = { ...(this._learning || {}), [key]: true };
    const done = (img) => {
      if (this._learning) delete this._learning[key];
      if (img) setLogo(key, { img, src, t: Date.now() });
    };
    let sameOrigin = false;
    try {
      sameOrigin = new URL(url, location.href).origin === location.origin;
    } catch (_err) {
      sameOrigin = false;
    }
    if (!sameOrigin) {
      done(url);
      return;
    }
    const pic = new Image();
    pic.onload = () => {
      try {
        const size = 160;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        // contain: the whole logo stays visible; transparent parts stay transparent
        const scale = Math.min(size / pic.naturalWidth, size / pic.naturalHeight);
        const w = pic.naturalWidth * scale;
        const h = pic.naturalHeight * scale;
        ctx.drawImage(pic, (size - w) / 2, (size - h) / 2, w, h);
        done(canvas.toDataURL("image/webp", 0.85));
      } catch (_err) {
        done(null);
      }
    };
    pic.onerror = () => done(null);
    pic.src = url;
  }

  _storageKey() {
    return this._config ? `sgmc:${this._config.players.join(",")}` : null;
  }

  _restoreCurrent() {
    const players = this._config?.players || [];
    try {
      const saved = localStorage.getItem(this._storageKey());
      if (saved && players.includes(saved)) return saved;
    } catch (_err) {
      /* storage blocked – use the first player */
    }
    return players[0];
  }

  _setCurrent(id) {
    this._current = id;
    if (this._els) this._toggleOptions(false);
    try {
      localStorage.setItem(this._storageKey(), id);
    } catch (_err) {
      /* ignore */
    }
    this._update(true);
  }

  _call(domain, service, data) {
    if (!this._hass?.callService) return;
    Promise.resolve(this._hass.callService(domain, service, data)).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn(`[smart-graph-media-card] ${domain}.${service} fehlgeschlagen:`, err);
    });
  }

  _build() {
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = el("style");
    style.textContent = STYLES;
    const card = el("ha-card", "sgmc");
    root.append(style, card);
    this._els = null;
    if (!this._config) {
      const warn = el("div", "warn");
      warn.textContent = this._error || "Ungültige Konfiguration.";
      card.append(warn);
      return;
    }
    const c = this._config;

    const head = el("div", "head");
    const pIcon = el("ha-icon", "p-icon");
    const thumb = el("img", "art-thumb hidden", { alt: "", loading: "lazy", decoding: "async" });
    thumb.addEventListener("error", () => {
      // picture not loadable (e.g. expired link): back to the symbol
      this._badArt = thumb.getAttribute("src");
      thumb.classList.add("hidden");
      pIcon.classList.remove("hidden");
    });
    const artBg = el("div", "art-bg", { "aria-hidden": "true" });
    const titles = el("div", "titles");
    const name = el("div", "name");
    const info = el("div", `info${c.show_media_info ? "" : " hidden"}`);
    titles.append(name, info);
    const optBtn = iconButton(`opt-btn${c.show_options_menu ? "" : " hidden"}`, "mdi:dots-vertical", "Optionen");
    optBtn.setAttribute("aria-haspopup", "true");
    optBtn.setAttribute("aria-expanded", "false");
    const menuBtn = iconButton("menu-btn", "mdi:chevron-down", "Player und Quelle wählen");
    menuBtn.setAttribute("aria-haspopup", "true");
    menuBtn.setAttribute("aria-expanded", "false");
    const power = iconButton("power", "mdi:power", "Ein/Aus");
    head.append(pIcon, thumb, titles, menuBtn, power, optBtn);
    const menu = el("div", "menu hidden", { role: "menu" });
    const omenu = el("div", "menu omenu hidden", { role: "menu" });

    const controls = el("div", "controls");
    const mute = iconButton("mute", "mdi:volume-high", "Stumm schalten");
    const vol = el("div", "vol");
    const slider = el("input", "slider", { type: "range", min: "0", max: "100", step: "1", "aria-label": "Lautstärke" });
    vol.append(slider);
    const transport = el("div", "transport");
    const prev = iconButton("prev", "mdi:skip-previous", "Zurück");
    const play = iconButton("play", "mdi:play", "Wiedergabe/Pause");
    const next = iconButton("next", "mdi:skip-next", "Weiter");
    transport.append(prev, play, next);
    controls.append(mute, vol, transport);

    const tiles = c.preset_style === "tile" || c.preset_style === "image";
    const noName = c.preset_style === "image" || !c.preset_show_name;
    const presets = el("div", `presets style-${tiles ? "tile" : c.preset_style}${c.preset_style === "image" ? " style-image" : ""}${noName ? " no-name" : ""}${c.presets.length ? "" : " hidden"}`);
    presets.style.setProperty("--sgmc-cols", String(c.preset_columns));
    const presetButtons = c.presets.map((p, i) => {
      const b = el("button", "preset", { type: "button", title: p.name, "aria-label": p.name });
      const img = el("img", "p-img", { alt: "", decoding: "async" });
      img.addEventListener("error", () => {
        // picture not loadable: forget a learned one, show the button without it
        if (img.dataset.auto) this._forgetPresetImage(i, img.getAttribute("src"));
        b.classList.remove("has-img");
        img.removeAttribute("src");
      });
      img.addEventListener("load", () => b.classList.add("has-img"));
      const icon = () => {
        const ic = el("ha-icon");
        ic.icon = p.icon;
        ic.setAttribute("icon", p.icon);
        return ic;
      };
      const name = el("span", "p-name");
      name.textContent = p.name;
      if (tiles) {
        const art = el("span", "p-art");
        art.append(img);
        if (p.icon) art.append(icon());
        if (!p.icon || c.preset_style === "image") {
          const label = el("span", "p-label");
          label.textContent = p.name;
          art.append(label);
        }
        b.append(art, name);
      } else {
        b.append(img);
        if (p.icon) b.append(icon());
        b.append(name);
      }
      b.addEventListener("click", () => this._playPreset(i));
      presets.append(b);
      return { button: b, img };
    });

    card.append(artBg, head, menu, omenu, controls, presets);

    // events
    menuBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._toggleOptions(false);
      this._toggleMenu();
    });
    optBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._toggleOptions();
    });
    power.addEventListener("click", () => {
      const s = this._stateObj();
      if (!s) return;
      const off = ["off", "standby", "unavailable", "unknown"].includes(s.state);
      this._call("media_player", off ? "turn_on" : "turn_off", { entity_id: this._current });
    });
    mute.addEventListener("click", () => {
      const s = this._stateObj();
      if (!s) return;
      if (supports(s, FEATURES.VOLUME_MUTE)) {
        this._call("media_player", "volume_mute", { entity_id: this._current, is_volume_muted: !s.attributes.is_volume_muted });
      } else if (supports(s, FEATURES.VOLUME_SET)) {
        // no mute support (e.g. some Alexa devices): toggle between 0 and the last level
        const level = Number(s.attributes.volume_level) || 0;
        if (level > 0) this._lastLevel = level;
        this._sendVolume(level > 0 ? 0 : this._lastLevel || 0.3);
      }
    });
    slider.addEventListener("input", () => {
      const v = Number(slider.value) / 100;
      this._paintSlider(v);
      setIcon(mute, volumeIcon(v, false));
      clearTimeout(this._volTimer);
      this._volTimer = setTimeout(() => this._sendVolume(v), 180);
    });
    slider.addEventListener("change", () => {
      clearTimeout(this._volTimer);
      this._paintSlider(Number(slider.value) / 100);
      this._sendVolume(Number(slider.value) / 100);
    });
    prev.addEventListener("click", () => this._call("media_player", "media_previous_track", { entity_id: this._current }));
    next.addEventListener("click", () => this._call("media_player", "media_next_track", { entity_id: this._current }));
    play.addEventListener("click", () => {
      const s = this._stateObj();
      if (!s) return;
      const service = s.state === "playing" ? (supports(s, FEATURES.PAUSE) ? "media_pause" : "media_stop") : "media_play";
      this._call("media_player", supports(s, FEATURES.PAUSE) && supports(s, FEATURES.PLAY) ? "media_play_pause" : service, { entity_id: this._current });
    });

    this._els = { card, optBtn, omenu, pIcon, thumb, artBg, name, info, menuBtn, power, menu, controls, mute, slider, prev, play, next, presets, presetButtons };
  }

  _stateObj() {
    return this._hass?.states?.[this._current];
  }

  _platform(id) {
    return this._hass?.entities?.[id]?.platform;
  }

  _sendVolume(v) {
    const level = Math.max(0, Math.min(1, Math.round(v * 100) / 100));
    this._volSentAt = Date.now();
    this._pendingLevel = level;
    this._call("media_player", "volume_set", { entity_id: this._current, volume_level: level });
  }

  _paintSlider(v) {
    this._els.slider.style.setProperty("--sgmc-fill", `${Math.round(Math.max(0, Math.min(1, v)) * 100)}%`);
  }

  _playPreset(i) {
    const p = this._config.presets[i];
    if (!p) return;
    const call = presetCall(p, this._current, this._platform(this._current));
    // remember the pressed preset: many players (e.g. Alexa with radio) report
    // the song, not the station – this way highlight and picture still match
    const s = this._stateObj();
    this._pressed = { player: this._current, index: i, at: Date.now(), idBefore: s?.attributes?.media_content_id ?? null, artBefore: artworkUrl(s) };
    this._learnFor = null;
    this._call(call.domain, call.service, call.data);
    this._update();
  }

  _playerName(id) {
    return this._config.names[id] || this._hass?.states?.[id]?.attributes?.friendly_name || id;
  }

  _menuItems() {
    const c = this._config;
    const s = this._stateObj();
    const items = [];
    if (c.players.length > 1) {
      items.push({ section: "Player" });
      for (const id of c.players) items.push({ kind: "player", value: id, label: this._playerName(id), icon: playerIcon(this._hass?.states?.[id]), selected: id === this._current });
    }
    const sources = Array.isArray(s?.attributes?.source_list) ? s.attributes.source_list : [];
    if (c.show_source_list && sources.length && supports(s, FEATURES.SELECT_SOURCE)) {
      items.push({ section: "Quelle" });
      for (const src of sources) items.push({ kind: "source", value: src, label: String(src), icon: "mdi:music-box-multiple-outline", selected: src === s.attributes.source });
    }
    return items;
  }

  // ---- options menu (⋮): playlists, sources, player details

  _playlistState() {
    const c = this._config;
    if (Array.isArray(c.playlists)) return { items: c.playlists, loading: false, enabled: true };
    if (c.playlists !== "auto") return { items: [], loading: false, enabled: false };
    const s = this._stateObj();
    const cache = this._browseCache?.[this._current];
    return { items: cache?.items || [], loading: Boolean(cache?.loading), enabled: supports(s, FEATURES.BROWSE_MEDIA), auto: true, done: Boolean(cache?.at) };
  }

  _loadPlaylists(force) {
    const c = this._config;
    const id = this._current;
    if (c.playlists !== "auto" || !this._hass?.callWS) return;
    this._browseCache = this._browseCache || {};
    const cache = this._browseCache[id];
    if (cache?.loading || (!force && cache?.at && Date.now() - cache.at < 300000)) return;
    this._browseCache[id] = { items: cache?.items || [], loading: true, at: cache?.at };
    const browse = (args) => this._hass.callWS({ type: "media_player/browse_media", entity_id: id, ...args });
    findPlaylists(browse)
      .catch(() => [])
      .then((items) => {
        this._browseCache[id] = { items, loading: false, at: Date.now() };
        if (this._optView === "playlists" && id === this._current) this._renderOptions();
      });
  }

  /** Picture URL for a menu item; HA-internal pictures need a signed path. */
  _menuImage(img, url) {
    if (!url) return;
    if (!url.startsWith("/") || url.startsWith("//") || url.startsWith("/local/") || !this._hass?.callWS) {
      img.src = url.startsWith("/") && !url.startsWith("//") && typeof this._hass?.hassUrl === "function" ? this._hass.hassUrl(url) : url;
      return;
    }
    this._signed = this._signed || {};
    const done = (path) => {
      img.src = typeof this._hass?.hassUrl === "function" ? this._hass.hassUrl(path) : path;
    };
    if (this._signed[url]) return done(this._signed[url]);
    this._hass
      .callWS({ type: "auth/sign_path", path: url, expires: 3600 })
      .then((r) => {
        this._signed[url] = r?.path || url;
        done(this._signed[url]);
      })
      .catch(() => done(url));
  }

  _menuItem({ label, icon, image, more, selected }, onClick) {
    const b = el("button", `item${selected ? " selected" : ""}`, { type: "button", role: "menuitem" });
    if (image !== undefined) {
      const img = el("img", "thumb", { alt: "", loading: "lazy", decoding: "async" });
      img.addEventListener("error", () => img.replaceWith(Object.assign(el("ha-icon"), { icon: icon || "mdi:playlist-music" })));
      this._menuImage(img, image);
      if (!image) {
        const ic = el("ha-icon");
        ic.icon = icon || "mdi:playlist-music";
        ic.setAttribute("icon", ic.icon);
        b.append(ic);
      } else b.append(img);
    } else if (icon) {
      const ic = el("ha-icon");
      ic.icon = selected ? "mdi:check" : icon;
      ic.setAttribute("icon", ic.icon);
      b.append(ic);
    }
    const span = el("span", "grow");
    span.textContent = label;
    b.append(span);
    if (more) {
      const m = el("ha-icon", "more");
      m.icon = "mdi:chevron-right";
      m.setAttribute("icon", m.icon);
      b.append(m);
    }
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      onClick();
    });
    return b;
  }

  _toggleOptions(force, view = "main") {
    const els = this._els;
    if (!els) return;
    const open = force ?? els.omenu.classList.contains("hidden");
    if (open) {
      this._toggleMenu(false);
      this._optView = view;
      this._renderOptions();
    }
    els.omenu.classList.toggle("hidden", !open);
    els.optBtn.classList.toggle("open", open);
    els.optBtn.setAttribute("aria-expanded", String(open));
  }

  _renderOptions() {
    const els = this._els;
    const m = els.omenu;
    const s = this._stateObj();
    const view = this._optView || "main";
    m.replaceChildren();
    const back = (title) => {
      const row = el("div", "back");
      const b = iconButton("", "mdi:arrow-left", "Zurück");
      b.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._optView = "main";
        this._renderOptions();
      });
      const t = el("span");
      t.textContent = title;
      row.append(b, t);
      m.append(row);
    };
    const sources = Array.isArray(s?.attributes?.source_list) && supports(s, FEATURES.SELECT_SOURCE) ? s.attributes.source_list : [];
    if (view === "main") {
      const pl = this._playlistState();
      if (pl.enabled) {
        m.append(
          this._menuItem({ label: "Playlists", icon: "mdi:playlist-music", more: true }, () => {
            this._optView = "playlists";
            this._loadPlaylists();
            this._renderOptions();
          })
        );
      }
      if (sources.length) {
        m.append(
          this._menuItem({ label: "Quellen", icon: "mdi:import", more: true }, () => {
            this._optView = "sources";
            this._renderOptions();
          })
        );
      }
      m.append(
        this._menuItem({ label: "Player-Details", icon: "mdi:information-outline" }, () => {
          this._toggleOptions(false);
          this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: this._current }, bubbles: true, composed: true }));
        })
      );
      return;
    }
    if (view === "sources") {
      back("Quellen");
      for (const src of sources) {
        m.append(
          this._menuItem({ label: String(src), icon: "mdi:music-box-multiple-outline", selected: src === s.attributes.source }, () => {
            this._toggleOptions(false);
            this._call("media_player", "select_source", { entity_id: this._current, source: src });
          })
        );
      }
      return;
    }
    // playlists
    back("Playlists");
    const pl = this._playlistState();
    if (pl.loading && !pl.items.length) {
      const e = el("div", "empty");
      e.textContent = "Playlists werden geladen …";
      m.append(e);
      return;
    }
    if (!pl.items.length) {
      const e = el("div", "empty");
      e.textContent = pl.auto
        ? "Keine Playlists in der Mediathek dieses Players gefunden. Eigene Playlists lassen sich im Karten-Editor unter „Playlists“ eintragen."
        : "Noch keine Playlists eingetragen (Karten-Editor → „Playlists“).";
      m.append(e);
      return;
    }
    const active = activePreset(pl.items, s);
    pl.items.forEach((p, i) => {
      m.append(
        this._menuItem({ label: p.name, icon: "mdi:playlist-music", image: p.image || "", selected: i === active }, () => {
          this._toggleOptions(false);
          const call = presetCall(p, this._current, this._platform(this._current), "playlist");
          this._call(call.domain, call.service, call.data);
        })
      );
    });
  }

  _toggleMenu(force) {
    const els = this._els;
    const open = force ?? els.menu.classList.contains("hidden");
    if (open) {
      els.menu.replaceChildren();
      for (const it of this._menuItems()) {
        if (it.section) {
          const h = el("div", "section");
          h.textContent = it.section;
          els.menu.append(h);
          continue;
        }
        const b = el("button", `item${it.selected ? " selected" : ""}`, { type: "button", role: "menuitemradio", "aria-checked": String(it.selected) });
        const ic = el("ha-icon");
        ic.icon = it.selected ? "mdi:check" : it.icon;
        ic.setAttribute("icon", ic.icon);
        const label = el("span");
        label.textContent = it.label;
        b.append(ic, label);
        b.addEventListener("click", (ev) => {
          ev.stopPropagation();
          this._toggleMenu(false);
          if (it.kind === "player") this._setCurrent(it.value);
          else this._call("media_player", "select_source", { entity_id: this._current, source: it.value });
        });
        els.menu.append(b);
      }
    }
    els.menu.classList.toggle("hidden", !open);
    els.menuBtn.classList.toggle("open", open);
    els.menuBtn.setAttribute("aria-expanded", String(open));
  }

  _update() {
    const c = this._config;
    const els = this._els;
    if (!c || !els || !this._hass) return;
    const s = this._stateObj();
    const state = s?.state ?? "unavailable";
    const unavailable = !s || state === "unavailable" || state === "unknown";
    const a = s?.attributes || {};
    const active = !unavailable && !["off", "standby"].includes(state);

    // head
    const icon = c.icon || a.icon || playerIcon(s);
    if (els.pIcon.icon !== icon) {
      els.pIcon.icon = icon;
      els.pIcon.setAttribute("icon", icon);
    }
    els.pIcon.classList.toggle("active", active);
    // artwork: cover / station picture as thumbnail and/or blurred background
    const art = c.artwork === "none" ? null : artworkUrl(s, this._hass);
    const useThumb = Boolean(art) && (c.artwork === "thumbnail" || c.artwork === "both") && art !== this._badArt;
    if (useThumb && els.thumb.getAttribute("src") !== art) els.thumb.setAttribute("src", art);
    els.thumb.classList.toggle("hidden", !useThumb);
    els.pIcon.classList.toggle("hidden", useThumb);
    const useBg = Boolean(art) && (c.artwork === "background" || c.artwork === "both");
    if (useBg) els.artBg.style.setProperty("--sgmc-art", `url("${art.replace(/["\\\n]/g, encodeURIComponent)}")`);
    els.artBg.classList.toggle("show", useBg);
    els.card.classList.toggle("has-art", useBg);
    const name = c.name && c.players.length === 1 ? c.name : this._playerName(this._current);
    if (els.name.textContent !== name) els.name.textContent = name;
    els.name.title = name;
    if (c.show_media_info) {
      const playingInfo = ["playing", "paused", "buffering"].includes(state) ? [a.media_title, a.media_artist || a.media_channel || a.app_name].filter(Boolean).join(" · ") : "";
      const text = playingInfo || (this._hass.formatEntityState && s ? this._hass.formatEntityState(s) : STATE_TEXT[state] || state);
      if (els.info.textContent !== text) els.info.textContent = text;
      els.info.classList.toggle("hidden", !text);
    }
    els.menuBtn.classList.toggle("hidden", this._menuItems().length === 0);
    const canPower = supports(s, FEATURES.TURN_ON) || supports(s, FEATURES.TURN_OFF);
    els.power.classList.toggle("hidden", !c.show_power || (!canPower && !unavailable));
    els.power.disabled = unavailable;
    els.power.classList.toggle("on", active);

    // volume
    const canVolume = supports(s, FEATURES.VOLUME_SET);
    const canMute = supports(s, FEATURES.VOLUME_MUTE);
    els.mute.classList.toggle("hidden", !c.show_volume || (!canVolume && !canMute && !unavailable));
    els.slider.parentElement.classList.toggle("hidden", !c.show_volume || (!canVolume && !unavailable));
    els.mute.disabled = unavailable;
    els.slider.disabled = unavailable || !canVolume;
    const reported = Number(a.volume_level);
    let level = Number.isFinite(reported) ? reported : 0;
    // right after a change the player may still report the old level
    if (Date.now() - this._volSentAt < 1500 && this._pendingLevel !== undefined) level = this._pendingLevel;
    if (this.shadowRoot.activeElement !== els.slider || Date.now() - this._volSentAt > 1500) {
      els.slider.value = String(Math.round(level * 100));
      this._paintSlider(level);
    }
    setIcon(els.mute, volumeIcon(level, a.is_volume_muted === true));
    els.mute.setAttribute("aria-pressed", String(a.is_volume_muted === true));

    // transport
    const show = (b, ok) => {
      b.classList.toggle("hidden", !c.show_controls || (!ok && !unavailable));
      b.disabled = unavailable;
    };
    show(els.prev, supports(s, FEATURES.PREVIOUS_TRACK));
    show(els.next, supports(s, FEATURES.NEXT_TRACK));
    show(els.play, supports(s, FEATURES.PLAY) || supports(s, FEATURES.PAUSE) || supports(s, FEATURES.STOP));
    const playing = state === "playing" || state === "buffering";
    setIcon(els.play, playing ? (supports(s, FEATURES.PAUSE) ? "mdi:pause" : "mdi:stop") : "mdi:play");
    els.play.setAttribute("aria-label", playing ? "Pause" : "Wiedergabe");
    els.controls.classList.toggle("hidden", [els.mute, els.slider.parentElement, els.prev, els.play, els.next].every((b) => b.classList.contains("hidden")));

    // presets
    const now = Date.now();
    const matched = activePreset(c.presets, s);
    const pressed = pressedPreset(this._pressed, this._current, s, now);
    const pick = currentPreset(matched, pressed, this._pressed);
    const pending = !!this._pressed && pressed >= 0 && this._pressed.contentId === undefined;
    if (pick.dropPressed) this._pressed = null;
    const current = pick.current;
    els.presetButtons.forEach(({ button: b }, i) => {
      b.classList.toggle("active", i === current);
      b.setAttribute("aria-pressed", String(i === current));
      b.disabled = unavailable;
    });
    // automatic picture: after pressing a preset take the first new station
    // picture (replaces a changed one); a preset recognised by name only fills
    // a missing picture
    if (this._pressed?.started && !this._pressed.learnArmed) {
      this._pressed.learnArmed = true;
      this._learnFor = { index: this._pressed.index, player: this._current, artBefore: this._pressed.artBefore, start: now };
    }
    const lf = this._learnFor;
    if (lf && (lf.player !== this._current || (current >= 0 && current !== lf.index) || now - lf.start > 180000)) this._learnFor = null;
    const rawArt = artworkUrl(s);
    if (rawArt) {
      const art = artworkUrl(s, this._hass);
      if (this._learnFor) {
        if (artKey(rawArt) !== artKey(this._learnFor.artBefore)) {
          this._learnPresetImage(this._learnFor.index, art, rawArt, true);
          this._learnFor = null;
        }
      } else if (!pending && matched >= 0 && current === matched) {
        this._learnPresetImage(matched, art, rawArt, false);
      }
    }
    this._paintPresetImages();

    // the open menu follows source / player changes
    if (!els.menu.classList.contains("hidden")) this._toggleMenu(true);
  }
}

// ---- editor

const LABELS = {
  entity: "Media-Player",
  entities: "Weitere Player (Umschalten über ▾)",
  name: "Name (optional)",
  icon: "Symbol (optional)",
  show_power: "Ein/Aus-Taste",
  show_volume: "Lautstärke",
  show_controls: "Zurück / Wiedergabe / Weiter",
  show_media_info: "Titel und Interpret anzeigen",
  show_source_list: "Quellen im Menü ▾",
  artwork: "Bild des Senders / Covers",
  preset_columns: "Spalten der Sender-Tasten",
  preset_style: "Aussehen der Sender-Tasten",
  preset_show_name: "Namen unter dem Bild zeigen",
  preset_auto_image: "Senderbild automatisch übernehmen",
  show_options_menu: "Optionsmenü ⋮ (Playlists, Quellen)",
  playlist_mode: "Playlists im Menü ⋮",
};

const PRESET_LABELS = {
  name: "Beschriftung",
  icon: "Symbol (optional)",
  kind: "Art",
  media_content_id: "Sender / Inhalt",
  media_content_type: "Typ (leer = automatisch)",
  source: "Quelle / Favorit",
  action: "Aktion (Dienst)",
  data: "Daten (optional)",
  match: "Erkennen am Text (optional)",
  image: "Bild (Adresse, optional)",
  image_upload: "Bild hochladen",
};

const PRESET_HELPERS = {
  media_content_id: "Alexa: Sendername wie in der Alexa-App (z. B. Radio Steiermark). Andere: Stream-URL, Spotify-URI oder ID.",
  media_content_type: "Alexa: TUNEIN (Standard), AMAZON_MUSIC oder custom (Sprachbefehl). Sonos: favorite_item_id. Music Assistant: radio.",
  action: "z. B. script.radio_morgens oder media_player.volume_set",
  data: "entity_id: current = der in der Karte gewählte Player",
  image: "Logo oder Cover: /local/logos/oe3.png (Ordner www), eine Internet-Adresse oder hochladen. Leer = automatisch, sobald der Sender einmal läuft.",
  match: "Hebt die Taste hervor, wenn dieser Text im Titel, Sender oder in der Quelle vorkommt.",
};

const PRESET_KINDS = [
  { value: "media", label: "Sender / Inhalt abspielen" },
  { value: "source", label: "Quelle / Favorit des Players" },
  { value: "action", label: "Beliebige Aktion (Skript, Dienst)" },
];

const CONTENT_TYPES = ["TUNEIN", "AMAZON_MUSIC", "custom", "music", "radio", "playlist", "favorite_item_id", "url"];

/** Preset (string or object from YAML) → flat editor data. */
function presetToForm(preset) {
  const p = typeof preset === "string" || typeof preset === "number" ? { name: String(preset), media_content_id: String(preset) } : isPlainObject(preset) ? preset : {};
  const action = p.action ?? p.perform_action ?? p.service;
  const kind = action !== undefined ? "action" : p.source !== undefined ? "source" : "media";
  const f = { kind, name: p.name ?? "" };
  if (p.icon) f.icon = p.icon;
  if (p.image) {
    f.image = p.image;
    if (String(p.image).startsWith("/api/image/serve/")) f.image_upload = p.image;
  }
  if (p.match) f.match = p.match;
  if (kind === "action") {
    f.action = action;
    if (isPlainObject(p.data)) f.data = p.data;
  } else if (kind === "source") f.source = p.source === undefined ? "" : String(p.source);
  else {
    f.media_content_id = p.media_content_id === undefined ? "" : String(p.media_content_id);
    if (p.media_content_type) f.media_content_type = p.media_content_type;
  }
  return f;
}

/** Flat editor data → preset object (only the keys of the chosen kind). */
function presetFromForm(f) {
  const d = f || {};
  const out = {};
  const name = typeof d.name === "string" ? d.name.trim() : "";
  if (name) out.name = name;
  if (d.icon) out.icon = d.icon;
  // a new upload replaces the address field
  let image = d.image_upload && d.image_upload !== d._image_upload_before ? d.image_upload : d.image;
  // upload removed → also drop its address
  if (!d.image_upload && d._image_upload_before && image === d._image_upload_before) image = "";
  if (typeof image === "string" && image.trim()) out.image = image.trim();
  if (d.kind === "action") {
    out.action = d.action || "";
    if (isPlainObject(d.data) && Object.keys(d.data).length) out.data = d.data;
  } else if (d.kind === "source") out.source = d.source ?? "";
  else {
    out.media_content_id = d.media_content_id ?? "";
    if (d.media_content_type) out.media_content_type = d.media_content_type;
  }
  if (typeof d.match === "string" && d.match.trim()) out.match = d.match.trim();
  return out;
}

function presetSchema(kind, sources) {
  const value =
    kind === "action"
      ? [
          { name: "action", selector: { text: {} } },
          { name: "data", selector: { object: {} } },
        ]
      : kind === "source"
        ? [
            sources.length
              ? { name: "source", selector: { select: { mode: "dropdown", custom_value: true, options: sources.map((v) => ({ value: v, label: v })) } } }
              : { name: "source", selector: { text: {} } },
          ]
        : [
            { name: "media_content_id", selector: { text: {} } },
            { name: "media_content_type", selector: { select: { mode: "dropdown", custom_value: true, options: CONTENT_TYPES.map((v) => ({ value: v, label: v })) } } },
          ];
  return [
    {
      type: "grid",
      name: "",
      schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
      ],
    },
    { name: "kind", selector: { select: { mode: "dropdown", options: PRESET_KINDS } } },
    ...value,
    { name: "image", selector: { text: {} } },
    { name: "image_upload", selector: { image: {} } },
    { name: "match", selector: { text: {} } },
  ];
}

function mediaToForm(config) {
  const c = config || {};
  const extra = (Array.isArray(c.entities) ? c.entities : []).map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean);
  return {
    entity: c.entity,
    entities: extra,
    name: c.name,
    icon: c.icon,
    show_power: c.show_power !== false,
    show_volume: c.show_volume !== false,
    show_controls: c.show_controls !== false,
    show_media_info: c.show_media_info !== false,
    show_source_list: c.show_source_list !== false,
    preset_columns: c.preset_columns,
    preset_style: c.preset_style || "logo",
    show_options_menu: c.show_options_menu !== false,
    playlist_mode: c.playlists === false || c.playlists === null ? "none" : Array.isArray(c.playlists) ? "list" : "auto",
    preset_show_name: c.preset_show_name !== false,
    preset_auto_image: c.preset_auto_image !== false,
    artwork: c.artwork === false ? "none" : c.artwork === true ? "both" : c.artwork || "thumbnail",
  };
}

/** Main form → config. Presets are edited in their own list and kept as they are. */
function mediaFromForm(config, form) {
  const out = { ...(config || {}) };
  const d = form || {};
  if (d.entity) out.entity = d.entity;
  const old = Array.isArray(out.entities) ? out.entities : [];
  const extra = (d.entities || []).filter((id) => id && id !== out.entity);
  if (extra.length) out.entities = extra.map((id) => old.find((e) => (typeof e === "string" ? e : e?.entity) === id) ?? id);
  else delete out.entities;
  for (const k of ["name", "icon"]) {
    if (typeof d[k] === "string" && d[k]) out[k] = d[k];
    else delete out[k];
  }
  for (const k of ["show_power", "show_volume", "show_controls", "show_media_info", "show_source_list"]) {
    if (d[k] === false) out[k] = false;
    else delete out[k];
  }
  if (d.artwork && d.artwork !== "thumbnail") out.artwork = d.artwork;
  else delete out.artwork;
  if (d.show_options_menu === false) out.show_options_menu = false;
  else delete out.show_options_menu;
  if (d.playlist_mode === "none") out.playlists = false;
  else if (d.playlist_mode === "list") out.playlists = Array.isArray(out.playlists) ? out.playlists : [];
  else if (d.playlist_mode === "auto") delete out.playlists;
  if (d.preset_style && d.preset_style !== "logo") out.preset_style = d.preset_style;
  else delete out.preset_style;
  for (const k of ["preset_show_name", "preset_auto_image"]) {
    if (d[k] === false) out[k] = false;
    else delete out[k];
  }
  if (typeof d.preset_columns === "number") out.preset_columns = d.preset_columns;
  else delete out.preset_columns;
  return out;
}

const EDITOR_STYLES = `
.sgmc-ed-presets { margin-top: 20px; }
.sgmc-ed-title { font-size: 15px; font-weight: 500; margin: 0 0 4px; }
.sgmc-ed-hint { font-size: 12px; color: var(--secondary-text-color); margin: 0 0 10px; }
.sgmc-ed-item { border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3)); border-radius: 12px; padding: 4px 12px 12px; margin-bottom: 10px; }
.sgmc-ed-head { display: flex; align-items: center; gap: 4px; min-height: 40px; }
.sgmc-ed-head .label { flex: 1 1 auto; min-width: 0; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sgmc-ed-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; padding: 0; border: 0; border-radius: 50%;
  background: transparent; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
}
.sgmc-ed-btn:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
.sgmc-ed-btn:disabled { color: var(--disabled-text-color, #9ca3af); cursor: default; background: transparent; }
.sgmc-ed-btn.delete { color: var(--error-color, #db4437); }
.sgmc-ed-add {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px 8px 12px;
  border: 1px solid var(--primary-color, #03a9f4); border-radius: 18px; background: transparent;
  color: var(--primary-color, #03a9f4); font: inherit; font-weight: 500; cursor: pointer; --mdc-icon-size: 20px;
}
.sgmc-ed-add:hover { background: color-mix(in srgb, var(--primary-color, #03a9f4) 8%, transparent); }
`;

class SmartGraphMediaCardEditor extends Base {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    for (const item of [...(this._listItems?.presets || []), ...(this._listItems?.playlists || [])]) item.form.hass = hass;
  }

  _emit(next) {
    this._config = next;
    this._renderedPresets = this._listsJson(next);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }

  _listsJson(c) {
    return JSON.stringify([c?.presets || [], Array.isArray(c?.playlists) ? c.playlists : null]);
  }

  _list(key) {
    return Array.isArray(this._config?.[key]) ? this._config[key] : [];
  }

  _sources() {
    const id = this._config?.entity;
    const list = this._hass?.states?.[id]?.attributes?.source_list;
    return Array.isArray(list) ? list.map(String) : [];
  }

  _setList(key, list, rebuild) {
    const next = { ...this._config };
    if (list.length || key === "playlists") next[key] = list;
    else delete next[key];
    this._emit(next);
    if (rebuild) this._renderLists();
  }

  _render() {
    if (!customElements.get("ha-form")) {
      this.textContent = "Der visuelle Editor ist nicht verfügbar. Bitte den YAML-Modus verwenden.";
      return;
    }
    if (!this._form) {
      const style = document.createElement("style");
      style.textContent = EDITOR_STYLES;
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => LABELS[s.name] ?? s.name;
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const listShown = (c) => Array.isArray(c?.playlists) && c.show_options_menu !== false;
        const before = listShown(this._config);
        this._emit(mediaFromForm(this._config, ev.detail.value));
        // playlist mode switched → show / hide the playlist list
        if (listShown(this._config) !== before) this._renderLists();
      });
      this._presetBox = document.createElement("div");
      this._presetBox.className = "sgmc-ed-presets";
      this._playlistBox = document.createElement("div");
      this._playlistBox.className = "sgmc-ed-presets";
      this.append(style, this._form, this._presetBox, this._playlistBox);
    }
    this._form.hass = this._hass;
    this._form.schema = [
      { name: "entity", required: true, selector: { entity: { filter: { domain: "media_player" } } } },
      { name: "entities", selector: { entity: { multiple: true, filter: { domain: "media_player" } } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} } },
        ],
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_power", selector: { boolean: {} } },
          { name: "show_volume", selector: { boolean: {} } },
          { name: "show_controls", selector: { boolean: {} } },
          { name: "show_media_info", selector: { boolean: {} } },
          { name: "show_source_list", selector: { boolean: {} } },
        ],
      },
      {
        name: "artwork",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "thumbnail", label: "Kleines Bild statt Symbol" },
              { value: "background", label: "Als Hintergrund der Karte" },
              { value: "both", label: "Kleines Bild und Hintergrund" },
              { value: "none", label: "Kein Bild" },
            ],
          },
        },
      },
      { name: "show_options_menu", selector: { boolean: {} } },
      ...(this._config?.show_options_menu === false
        ? []
        : [
            {
              name: "playlist_mode",
              selector: {
                select: {
                  mode: "dropdown",
                  options: [
                    { value: "auto", label: "Automatisch aus der Mediathek des Players" },
                    { value: "list", label: "Eigene Liste (z. B. für Alexa / Amazon Music)" },
                    { value: "none", label: "Keine Playlists" },
                  ],
                },
              },
            },
          ]),
      { name: "preset_columns", selector: { number: { min: 1, max: 6, mode: "box" } } },
      {
        name: "preset_style",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "logo", label: "Logo + Name" },
              { value: "tile", label: "Bild-Kachel" },
              { value: "image", label: "Nur Bild (ohne Bild: Name in der Kachel)" },
              { value: "text", label: "Nur Name" },
            ],
          },
        },
      },
      {
        type: "grid",
        name: "",
        schema: [
          ...((this._config?.preset_style || "logo") === "tile" ? [{ name: "preset_show_name", selector: { boolean: {} } }] : []),
          ...((this._config?.preset_style || "logo") !== "text" ? [{ name: "preset_auto_image", selector: { boolean: {} } }] : []),
        ],
      },
    ];
    this._form.data = mediaToForm(this._config);
    // the list is only rebuilt when the presets changed from outside (YAML mode, undo)
    if (this._listsJson(this._config) !== this._renderedPresets) this._renderLists();
  }

  _button(icon, label, className, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `sgmc-ed-btn ${className || ""}`;
    b.title = label;
    b.setAttribute("aria-label", label);
    const i = document.createElement("ha-icon");
    i.icon = icon;
    i.setAttribute("icon", icon);
    b.append(i);
    b.addEventListener("click", onClick);
    return b;
  }

  _renderLists() {
    this._renderedPresets = this._listsJson(this._config);
    this._listItems = {};
    this._renderList("presets", this._presetBox, {
      title: "Sender / Favoriten",
      hint: "Jede Taste spielt einen Sender oder Inhalt ab, wählt eine Quelle des Players oder startet eine Aktion.",
      add: "Sender hinzufügen",
      item: "Taste",
    });
    if (Array.isArray(this._config?.playlists) && this._config.show_options_menu !== false) {
      this._renderList("playlists", this._playlistBox, {
        title: "Playlists (Menü ⋮)",
        hint: "Alexa: Name der Playlist aus Amazon Music (Typ AMAZON_MUSIC wird automatisch gewählt). Spotify: spotify:playlist:… Andere: ID oder URL.",
        add: "Playlist hinzufügen",
        item: "Playlist",
      });
    } else if (this._playlistBox) this._playlistBox.replaceChildren();
  }

  _renderList(key, box, text) {
    if (!box) return;
    const entries = this._list(key);
    box.replaceChildren();
    const title = document.createElement("div");
    title.className = "sgmc-ed-title";
    title.textContent = text.title;
    const hint = document.createElement("div");
    hint.className = "sgmc-ed-hint";
    hint.textContent = text.hint;
    box.append(title, hint);
    const sources = this._sources();
    this._listItems[key] = entries.map((entry, i) => {
      const wrap = document.createElement("div");
      wrap.className = "sgmc-ed-item";
      const head = document.createElement("div");
      head.className = "sgmc-ed-head";
      const label = document.createElement("span");
      label.className = "label";
      const data = presetToForm(entry);
      label.textContent = data.name || `${text.item} ${i + 1}`;
      const move = (dir) => {
        const list = [...this._list(key)];
        const j = i + dir;
        [list[i], list[j]] = [list[j], list[i]];
        this._setList(key, list, true);
      };
      const up = this._button("mdi:arrow-up", "Nach oben", "", () => move(-1));
      const down = this._button("mdi:arrow-down", "Nach unten", "", () => move(1));
      up.disabled = i === 0;
      down.disabled = i === entries.length - 1;
      const del = this._button("mdi:delete-outline", `${text.item} löschen`, "delete", () => {
        this._setList(key, this._list(key).filter((_, k) => k !== i), true);
      });
      head.append(label, up, down, del);
      const form = document.createElement("ha-form");
      form.hass = this._hass;
      form.computeLabel = (sch) => PRESET_LABELS[sch.name] ?? sch.name;
      form.computeHelper = (sch) => PRESET_HELPERS[sch.name];
      form.schema = presetSchema(data.kind, sources);
      form.data = data;
      form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = ev.detail.value || {};
        const kindChanged = value.kind !== form.data?.kind;
        const next = presetFromForm({ ...value, _image_upload_before: form.data?.image_upload });
        const list = [...this._list(key)];
        list[i] = next;
        this._setList(key, list, false);
        label.textContent = next.name || `${text.item} ${i + 1}`;
        // other kind → other fields
        if (kindChanged) form.schema = presetSchema(value.kind, sources);
        form.data = presetToForm(next);
      });
      wrap.append(head, form);
      box.append(wrap);
      return { wrap, form };
    });
    const add = document.createElement("button");
    add.type = "button";
    add.className = "sgmc-ed-add";
    const plus = document.createElement("ha-icon");
    plus.icon = "mdi:plus";
    plus.setAttribute("icon", "mdi:plus");
    add.append(plus, document.createTextNode(text.add));
    add.addEventListener("click", () => this._setList(key, [...this._list(key), { name: "", media_content_id: "" }], true));
    box.append(add);
  }
}

function registerMediaCard() {
  if (typeof customElements === "undefined" || customElements.get(MEDIA_TAG)) return;
  customElements.define(MEDIA_TAG, SmartGraphMediaCard);
  if (!customElements.get(MEDIA_EDITOR_TAG)) customElements.define(MEDIA_EDITOR_TAG, SmartGraphMediaCardEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: MEDIA_TAG,
    name: "Smart Graph Media Card",
    description: "Media-Player steuern (Alexa, Sonos, Google Cast, Spotify …): Ein/Aus, Lautstärke, Wiedergabe und Sender-Tasten.",
    preview: true,
    documentationURL: "https://github.com/rest2178/smart-graph-button-card",
  });
}
return { MEDIA_TAG, MEDIA_EDITOR_TAG, FEATURES, supports, MediaConfigError, ARTWORK_MODES, PRESET_STYLES, presetImageKey, validateMediaConfig, artworkUrl, defaultContentType, presetCall, activePreset, artKey, pressedPreset, currentPreset, playlistItems, playlistFolders, findPlaylists, volumeIcon, SmartGraphMediaCard, presetToForm, presetFromForm, presetSchema, mediaToForm, mediaFromForm, SmartGraphMediaCardEditor, registerMediaCard };
})();

// ---- src/weather-badge.js
const __m_weather_badge_js = (() => {
/**
 * Smart Graph Weather Badge – weather in badge height (36 px), in the style of
 * the info card designs: tinted icon circle, temperature, condition and a soft
 * forecast graph in the background.
 *
 * type: custom:smart-graph-weather-badge   (dashboard badges)
 */
const { renderGraphSVG } = __m_graph_renderer_js;
const { formatNumber, getNumberLocale } = __m_value_formatter_js;
const { isPlainObject, parseNumber } = __m_utils_js;
const { TYPE_ICONS } = __m_levels_js;
const { fetchHistory } = __m_history_provider_js;
const { reduceSeries } = __m_data_reducer_js;

const WEATHER_TAG = "smart-graph-weather-badge";
const WEATHER_EDITOR_TAG = "smart-graph-weather-badge-editor";

const Base = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
const WEATHER_RE = /^weather\.[a-z0-9_]+$/;

/** Icon, accent color and German name per weather condition. */
const CONDITIONS = Object.freeze({
  "clear-night": { icon: "mdi:weather-night", color: "#6366f1", label: "Klar" },
  cloudy: { icon: "mdi:weather-cloudy", color: "#64748b", label: "Bewölkt" },
  exceptional: { icon: "mdi:alert-circle-outline", color: "#ef4444", label: "Unwetter" },
  fog: { icon: "mdi:weather-fog", color: "#94a3b8", label: "Nebel" },
  hail: { icon: "mdi:weather-hail", color: "#06b6d4", label: "Hagel" },
  lightning: { icon: "mdi:weather-lightning", color: "#8b5cf6", label: "Gewitter" },
  "lightning-rainy": { icon: "mdi:weather-lightning-rainy", color: "#8b5cf6", label: "Gewitter, Regen" },
  partlycloudy: { icon: "mdi:weather-partly-cloudy", color: "#f59e0b", label: "Teilweise bewölkt" },
  pouring: { icon: "mdi:weather-pouring", color: "#2563eb", label: "Starkregen" },
  rainy: { icon: "mdi:weather-rainy", color: "#3b82f6", label: "Regen" },
  snowy: { icon: "mdi:weather-snowy", color: "#0ea5e9", label: "Schnee" },
  "snowy-rainy": { icon: "mdi:weather-snowy-rainy", color: "#0ea5e9", label: "Schneeregen" },
  sunny: { icon: "mdi:weather-sunny", color: "#f59e0b", label: "Sonnig" },
  windy: { icon: "mdi:weather-windy", color: "#14b8a6", label: "Windig" },
  "windy-variant": { icon: "mdi:weather-windy-variant", color: "#14b8a6", label: "Windig, bewölkt" },
});
const UNKNOWN = { icon: "mdi:weather-cloudy-alert", color: "#9ca3af", label: "" };

function conditionInfo(condition) {
  return CONDITIONS[condition] || UNKNOWN;
}

const INFO_MODES = ["condition", "humidity", "wind", "high_low", "none"];

/** Extra values next to the temperature: key → icon, German name, source. */
const EXTRAS = Object.freeze({
  humidity: { icon: "mdi:water-percent", label: "Luftfeuchtigkeit" },
  precipitation: { icon: "mdi:weather-pouring", label: "Regenmenge heute", forecast: true },
  precipitation_probability: { icon: "mdi:umbrella-outline", label: "Regenwahrscheinlichkeit", forecast: true },
  wind: { icon: "mdi:weather-windy", label: "Wind" },
  wind_gust: { icon: "mdi:weather-windy-variant", label: "Windböen" },
  pressure: { icon: "mdi:gauge", label: "Luftdruck" },
  uv_index: { icon: "mdi:white-balance-sunny", label: "UV-Index" },
  apparent_temperature: { icon: "mdi:thermometer", label: "Gefühlt" },
  dew_point: { icon: "mdi:thermometer-water", label: "Taupunkt" },
  cloud_coverage: { icon: "mdi:cloud-percent", label: "Bewölkung" },
  visibility: { icon: "mdi:eye-outline", label: "Sichtweite" },
  high_low: { icon: "mdi:thermometer-lines", label: "Höchst- / Tiefstwert", forecast: true },
});
const ENTITY_RE = /^[a-z_]+\.[a-z0-9_]+$/;

function normalizeExtra(e, i, errors) {
  if (typeof e === "string") {
    if (!EXTRAS[e]) errors.push(`extras[${i}] „${e}“ ist unbekannt. Erlaubt: ${Object.keys(EXTRAS).join(", ")} oder { entity: sensor.… }.`);
    return EXTRAS[e] ? { key: e } : null;
  }
  if (isPlainObject(e) && typeof e.entity === "string") {
    if (!ENTITY_RE.test(e.entity)) {
      errors.push(`extras[${i}].entity „${e.entity}“ ist keine gültige Entity-ID.`);
      return null;
    }
    const d = e.decimals === undefined ? undefined : parseNumber(e.decimals);
    if (d !== undefined && (d === null || d < 0 || d > 3 || !Number.isInteger(d))) errors.push(`extras[${i}].decimals muss 0 bis 3 sein.`);
    return { entity: e.entity, attribute: typeof e.attribute === "string" ? e.attribute : undefined, icon: typeof e.icon === "string" ? e.icon : undefined, unit: e.unit === undefined ? undefined : String(e.unit), name: typeof e.name === "string" ? e.name : undefined, decimals: d ?? undefined };
  }
  errors.push(`extras[${i}] muss ein Name (z. B. humidity) oder { entity: … } sein.`);
  return null;
}

const fmt = (v, decimals, locale) => formatNumber(v, { decimals, locale });

/** Today's expected precipitation (daily forecast, else the next 24 hourly entries). */
function precipitationToday(daily, hourly, now) {
  const d = Number(daily?.[0]?.precipitation);
  if (Number.isFinite(d)) return d;
  if (!Array.isArray(hourly)) return null;
  const next = hourly.filter((f) => !f?.datetime || Date.parse(f.datetime) >= now - 3600e3).slice(0, 24);
  const vals = next.map((f) => Number(f?.precipitation)).filter(Number.isFinite);
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
}

function precipitationChance(daily, hourly, now) {
  const d = Number(daily?.[0]?.precipitation_probability);
  if (Number.isFinite(d)) return d;
  if (!Array.isArray(hourly)) return null;
  const vals = hourly
    .filter((f) => !f?.datetime || Date.parse(f.datetime) >= now - 3600e3)
    .slice(0, 12)
    .map((f) => Number(f?.precipitation_probability))
    .filter(Number.isFinite);
  return vals.length ? Math.max(...vals) : null;
}

/**
 * Value of one extra: { icon, text, label } or null when not available.
 * ctx: { states, daily, hourly, locale, now }
 */
function extraValue(extra, stateObj, ctx = {}) {
  const { locale, daily, hourly, now = Date.now() } = ctx;
  if (extra.entity) {
    const s = ctx.states?.[extra.entity];
    if (!s) return null;
    const raw = extra.attribute ? s.attributes?.[extra.attribute] : s.state;
    if (raw === undefined || raw === null || raw === "" || raw === "unavailable" || raw === "unknown") return null;
    const n = parseNumber(raw);
    const unit = extra.unit ?? (extra.attribute ? "" : s.attributes?.unit_of_measurement || "");
    const text = n === null ? String(raw) : `${fmt(n, extra.decimals ?? (Math.abs(n) < 10 && !Number.isInteger(n) ? 1 : 0), locale)}${unit ? (unit === "%" ? " %" : ` ${unit}`) : ""}`;
    const dc = s.attributes?.device_class;
    const icon = extra.icon || s.attributes?.icon || (dc === "precipitation" || dc === "precipitation_intensity" ? "mdi:weather-pouring" : TYPE_ICONS[dc]) || "mdi:gauge";
    return { icon, text, label: extra.name || s.attributes?.friendly_name || extra.entity };
  }
  const def = EXTRAS[extra.key];
  if (!def) return null;
  const a = stateObj?.attributes || {};
  const num = (v) => (v === undefined || v === null || v === "" ? null : parseNumber(v));
  let text = null;
  switch (extra.key) {
    case "humidity":
    case "cloud_coverage": {
      const v = num(a[extra.key]);
      if (v !== null) text = `${fmt(v, 0, locale)} %`;
      break;
    }
    case "wind":
    case "wind_gust": {
      const v = num(extra.key === "wind" ? a.wind_speed : a.wind_gust_speed);
      if (v !== null) text = `${fmt(v, 0, locale)} ${a.wind_speed_unit || "km/h"}`;
      break;
    }
    case "pressure": {
      const v = num(a.pressure);
      if (v !== null) text = `${fmt(v, 0, locale)} ${a.pressure_unit || "hPa"}`;
      break;
    }
    case "uv_index": {
      const v = num(a.uv_index);
      if (v !== null) text = `UV ${fmt(v, Number.isInteger(v) ? 0 : 1, locale)}`;
      break;
    }
    case "apparent_temperature":
    case "dew_point": {
      const v = num(a[extra.key]);
      if (v !== null) text = `${fmt(v, 0, locale)}°`;
      break;
    }
    case "visibility": {
      const v = num(a.visibility);
      if (v !== null) text = `${fmt(v, v < 10 ? 1 : 0, locale)} ${a.visibility_unit || "km"}`;
      break;
    }
    case "precipitation": {
      const v = precipitationToday(daily, hourly, now);
      if (v !== null) text = `${fmt(v, v > 0 && v < 10 && Math.round(v * 10) % 10 !== 0 ? 1 : 0, locale)} ${a.precipitation_unit || "mm"}`;
      break;
    }
    case "precipitation_probability": {
      const v = precipitationChance(daily, hourly, now);
      if (v !== null) text = `${fmt(v, 0, locale)} %`;
      break;
    }
    case "high_low":
      text = infoText("high_low", stateObj, { daily, locale }) || null;
      break;
    default:
      break;
  }
  return text === null ? null : { icon: def.icon, text, label: def.label };
}
/** Background graph: forecast (auto/hourly/daily), temperature history of the last hours, or none. */
const FORECAST_MODES = ["auto", "hourly", "daily", "history", "none"];

// weather entity supported_features
const FORECAST_DAILY = 1;
const FORECAST_HOURLY = 2;

class WeatherConfigError extends Error {}

function validateWeatherConfig(raw) {
  if (!isPlainObject(raw)) throw new WeatherConfigError("Die Konfiguration muss ein Objekt sein.");
  const errors = [];
  if (typeof raw.entity !== "string" || !WEATHER_RE.test(raw.entity)) errors.push(`entity „${raw.entity ?? ""}“ ist keine weather-Entity (z. B. weather.forecast_home).`);
  const info = raw.info === undefined ? "condition" : raw.info;
  if (!INFO_MODES.includes(info)) errors.push(`info „${raw.info}“ ist ungültig. Erlaubt: ${INFO_MODES.join(", ")}.`);
  const forecast = raw.forecast === undefined ? "auto" : raw.forecast === false ? "none" : raw.forecast;
  if (!FORECAST_MODES.includes(forecast)) errors.push(`forecast „${raw.forecast}“ ist ungültig. Erlaubt: ${FORECAST_MODES.join(", ")}.`);
  let decimals = raw.decimals === undefined ? 0 : parseNumber(raw.decimals);
  if (decimals === null || decimals < 0 || decimals > 2 || !Number.isInteger(decimals)) {
    errors.push("decimals muss 0, 1 oder 2 sein.");
    decimals = 0;
  }
  if (raw.history_entity !== undefined && raw.history_entity !== "" && (typeof raw.history_entity !== "string" || !/^[a-z_]+\.[a-z0-9_]+$/.test(raw.history_entity))) {
    errors.push(`history_entity „${raw.history_entity}“ ist keine gültige Entity-ID.`);
  }
  const hours = raw.hours_to_show === undefined ? 24 : parseNumber(raw.hours_to_show);
  if (hours === null || hours < 1 || hours > 168) errors.push("hours_to_show muss zwischen 1 und 168 liegen.");
  const extras = (Array.isArray(raw.extras) ? raw.extras : raw.extras === undefined ? [] : [raw.extras]).map((e, i) => normalizeExtra(e, i, errors)).filter(Boolean);
  if (errors.length) throw new WeatherConfigError(errors.join("\n"));
  return {
    type: raw.type,
    extras,
    history_entity: typeof raw.history_entity === "string" && raw.history_entity ? raw.history_entity : undefined,
    hours_to_show: hours,
    entity: raw.entity,
    name: typeof raw.name === "string" && raw.name ? raw.name : undefined,
    show_name: raw.show_name === true,
    show_icon: raw.show_icon !== false,
    info,
    forecast,
    decimals,
    color: typeof raw.color === "string" && raw.color ? raw.color : undefined,
  };
}

/** Which forecast to subscribe to (or null). */
function forecastType(mode, supportedFeatures) {
  const f = Number(supportedFeatures) || 0;
  if (mode === "none" || mode === "history") return null;
  if (mode === "hourly") return f & FORECAST_HOURLY ? "hourly" : null;
  if (mode === "daily") return f & FORECAST_DAILY ? "daily" : null;
  return f & FORECAST_HOURLY ? "hourly" : f & FORECAST_DAILY ? "daily" : null;
}

/** Graph points from forecast entries: next 24 h (hourly) or up to 7 days. */
function forecastPoints(forecast, type, now = Date.now()) {
  if (!Array.isArray(forecast)) return [];
  const future = forecast.filter((f) => f && Number.isFinite(Number(f.temperature)) && (!f.datetime || Date.parse(f.datetime) >= now - 3600e3));
  return future.slice(0, type === "hourly" ? 24 : 7).map((f) => ({ v: Number(f.temperature) }));
}

/** Second text after the temperature ("Sonnig", "62 %", "12 km/h", "18° / 9°"). */
function infoText(mode, stateObj, { conditionLabel, daily, locale } = {}) {
  const a = stateObj?.attributes || {};
  if (mode === "condition") return conditionLabel || "";
  if (mode === "humidity") return Number.isFinite(Number(a.humidity)) ? `${formatNumber(Number(a.humidity), { decimals: 0, locale })} %` : "";
  if (mode === "wind") {
    const v = Number(a.wind_speed);
    return Number.isFinite(v) ? `${formatNumber(v, { decimals: 0, locale })} ${a.wind_speed_unit || "km/h"}` : "";
  }
  if (mode === "high_low") {
    const today = Array.isArray(daily) ? daily[0] : null;
    const hi = Number(today?.temperature);
    const lo = Number(today?.templow);
    if (!Number.isFinite(hi)) return "";
    return Number.isFinite(lo) ? `${formatNumber(hi, { decimals: 0, locale })}° / ${formatNumber(lo, { decimals: 0, locale })}°` : `${formatNumber(hi, { decimals: 0, locale })}°`;
  }
  return "";
}

const STYLES = `
:host { display: inline-block; max-width: 100%; }
.badge {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: var(--ha-badge-size, 36px);
  min-width: var(--ha-badge-size, 36px);
  max-width: 100%;
  padding: 0 14px 0 4px;
  border-radius: var(--ha-badge-border-radius, calc(var(--ha-badge-size, 36px) / 2));
  border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
  background: var(--ha-card-background, var(--card-background-color, #fff));
  color: var(--primary-text-color);
  overflow: hidden;
  isolation: isolate;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  font-family: inherit;
  --sgwb-accent: var(--primary-color, #03a9f4);
}
.badge.no-icon { padding-left: 14px; }
.badge:focus-visible { outline: 2px solid var(--sgwb-accent); outline-offset: 2px; }
.badge::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  background: color-mix(in srgb, var(--sgwb-accent) 7%, transparent);
}
.graph {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 44%;
  z-index: -1;
  pointer-events: none;
  opacity: 0.85;
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 45%, #000 92%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 45%, #000 92%, transparent 100%);
}
.graph svg { display: block; width: 100%; height: 100%; }
.icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--ha-badge-size, 36px) - 8px);
  height: calc(var(--ha-badge-size, 36px) - 8px);
  border-radius: 50%;
  background: color-mix(in srgb, var(--sgwb-accent) 18%, transparent);
  color: var(--sgwb-accent);
  --mdc-icon-size: 18px;
}
.text { display: flex; flex-direction: column; justify-content: center; min-width: 0; line-height: 1.15; text-shadow: 0 0 3px var(--ha-card-background, var(--card-background-color, #fff)), 0 0 1px var(--ha-card-background, var(--card-background-color, #fff)); }
.label { font-size: 10px; font-weight: 500; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.1px; }
.line { display: flex; align-items: baseline; gap: 6px; min-width: 0; white-space: nowrap; }
.temp { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; }
.info { font-size: 12px; font-weight: 500; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; }
.extras { display: flex; align-items: center; gap: 10px; flex: none; padding-left: 10px; margin-left: 2px; border-left: 1px solid color-mix(in srgb, var(--secondary-text-color) 28%, transparent); height: 18px; text-shadow: 0 0 3px var(--ha-card-background, var(--card-background-color, #fff)); }
.extra { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; white-space: nowrap; color: var(--primary-text-color); }
.extra ha-icon { --mdc-icon-size: 15px; color: var(--sgwb-accent); flex: none; }
.extra.muted { display: none; }
.hidden { display: none !important; }
.warn { color: var(--error-color, #db4437); font-size: 12px; }
`;

function el(tag, className, attrs) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

let uid = 0;

class SmartGraphWeatherBadge extends Base {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uid = `sgwb${(uid += 1)}`;
    this._forecast = { hourly: null, daily: null };
  }

  static getConfigElement() {
    return document.createElement(WEATHER_EDITOR_TAG);
  }

  static getStubConfig(hass) {
    const id = Object.keys(hass?.states || {}).find((e) => e.startsWith("weather.")) || "weather.forecast_home";
    return { entity: id };
  }

  setConfig(config) {
    try {
      this._config = validateWeatherConfig(config);
      this._error = null;
    } catch (err) {
      this._config = null;
      this._error = err.message || String(err);
    }
    this._unsubscribe();
    this._forecast = { hourly: null, daily: null };
    this._history = [];
    this._historyAt = 0;
    this._build();
    if (this._hass) this.hass = this._hass;
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    if (!this._config || !this._els) return;
    this._subscribe();
    this._loadHistory();
    if (!prev || prev.states?.[this._config.entity] !== hass.states?.[this._config.entity] || !this._drawn) this._update();
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    if (this._hass && this._config) this._subscribe();
    if (typeof ResizeObserver !== "undefined" && this._els && !this._ro) {
      this._ro = new ResizeObserver(() => this._drawGraph());
      this._ro.observe(this._els.badge);
    }
  }

  disconnectedCallback() {
    this._unsubscribe();
    this._ro?.disconnect();
    this._ro = null;
  }

  _build() {
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = el("style");
    style.textContent = STYLES;
    const badge = el("div", "badge", { role: "button", tabindex: "0" });
    root.append(style, badge);
    this._els = null;
    this._drawn = false;
    if (!this._config) {
      const warn = el("span", "warn");
      warn.textContent = this._error || "Ungültige Konfiguration.";
      badge.append(warn);
      return;
    }
    const c = this._config;
    const graph = el("div", "graph", { "aria-hidden": "true" });
    const icon = el("span", `icon${c.show_icon ? "" : " hidden"}`);
    const glyph = el("ha-icon");
    icon.append(glyph);
    const text = el("div", "text");
    const label = el("span", `label${c.show_name ? "" : " hidden"}`);
    const line = el("span", "line");
    const temp = el("span", "temp");
    const info = el("span", "info");
    line.append(temp, info);
    text.append(label, line);
    badge.classList.toggle("no-icon", !c.show_icon);
    const extras = el("div", `extras${c.extras.length ? "" : " hidden"}`);
    const extraEls = c.extras.map(() => {
      const item = el("span", "extra muted");
      const ic = el("ha-icon");
      const val = el("span");
      item.append(ic, val);
      extras.append(item);
      return { item, ic, val };
    });
    badge.append(graph, icon, text, extras);
    const open = () => this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: c.entity }, bubbles: true, composed: true }));
    badge.addEventListener("click", open);
    badge.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        open();
      }
    });
    this._els = { badge, graph, glyph, label, temp, info, extras, extraEls };
    if (this.isConnected) this.connectedCallback();
  }

  _subscribe() {
    const c = this._config;
    const s = this._hass?.states?.[c.entity];
    const conn = this._hass?.connection;
    if (!s || !conn?.subscribeMessage) return;
    const wanted = new Set();
    const graphType = forecastType(c.forecast, s.attributes?.supported_features);
    if (graphType) wanted.add(graphType);
    const needsDaily = c.info === "high_low" || c.extras.some((e) => e.key && EXTRAS[e.key].forecast);
    if (needsDaily) {
      // daily forecast for today's values, hourly as fallback
      const t = forecastType("daily", s.attributes?.supported_features) || forecastType("hourly", s.attributes?.supported_features);
      if (t) wanted.add(t);
    }
    const key = `${c.entity}|${[...wanted].sort().join(",")}`;
    if (this._subKey === key) return;
    this._unsubscribe();
    this._subKey = key;
    this._graphType = graphType;
    this._subs = [...wanted].map((type) =>
      conn
        .subscribeMessage(
          (msg) => {
            this._forecast[type] = Array.isArray(msg?.forecast) ? msg.forecast : [];
            this._update();
          },
          { type: "weather/subscribe_forecast", forecast_type: type, entity_id: c.entity }
        )
        .catch(() => null)
    );
  }

  /** Temperature history of the last hours (weather attribute or own sensor), refreshed every 5 minutes. */
  _loadHistory() {
    const c = this._config;
    if (c.forecast !== "history" || !this._hass || this._historyLoading) return;
    if (this._historyAt && Date.now() - this._historyAt < 300000) return;
    this._historyLoading = true;
    const entityId = c.history_entity || c.entity;
    const attribute = c.history_entity ? undefined : "temperature";
    fetchHistory(this._hass, { entityId, attribute, hours: c.hours_to_show, updateInterval: 300 })
      .then((res) => {
        const data = res.points?.length ? reduceSeries(res.points, { start: res.start, end: res.end, buckets: 48, aggregation: "average", fill: "hold" }) : [];
        this._history = data.filter((d) => Number.isFinite(d?.v)).length > 1 ? data : [];
      })
      .catch(() => {
        this._history = [];
      })
      .finally(() => {
        this._historyLoading = false;
        this._historyAt = Date.now();
        this._drawGraph();
      });
  }

  _unsubscribe() {
    for (const p of this._subs || []) Promise.resolve(p).then((unsub) => typeof unsub === "function" && unsub());
    this._subs = [];
    this._subKey = null;
  }

  _update() {
    const c = this._config;
    const els = this._els;
    if (!c || !els || !this._hass) return;
    this._drawn = true;
    const s = this._hass.states?.[c.entity];
    const unavailable = !s || s.state === "unavailable" || s.state === "unknown";
    const cond = conditionInfo(s?.state);
    const accent = c.color || (unavailable ? "var(--disabled-text-color, #9ca3af)" : cond.color);
    els.badge.style.setProperty("--sgwb-accent", accent);
    const icon = unavailable ? "mdi:weather-cloudy-alert" : cond.icon;
    if (els.glyph.icon !== icon) {
      els.glyph.icon = icon;
      els.glyph.setAttribute("icon", icon);
    }
    const name = c.name || s?.attributes?.friendly_name || c.entity;
    els.label.textContent = name;
    const locale = getNumberLocale(this._hass);
    const t = Number(s?.attributes?.temperature);
    const unit = s?.attributes?.temperature_unit || "°C";
    const tempText = unavailable || !Number.isFinite(t) ? "–" : `${formatNumber(t, { decimals: c.decimals, locale })} ${unit}`;
    if (els.temp.textContent !== tempText) els.temp.textContent = tempText;
    const label = unavailable
      ? "Nicht verfügbar"
      : (this._hass.formatEntityState && s ? this._hass.formatEntityState(s) : "") || cond.label || s.state;
    const info = unavailable ? "Nicht verfügbar" : infoText(c.info, s, { conditionLabel: label, daily: this._forecast.daily, locale });
    if (els.info.textContent !== info) els.info.textContent = info;
    els.info.classList.toggle("hidden", !info);
    const extraTexts = [];
    c.extras.forEach((ex, i) => {
      const v = unavailable && !ex.entity ? null : extraValue(ex, s, { states: this._hass.states, daily: this._forecast.daily, hourly: this._forecast.hourly, locale });
      const e = els.extraEls[i];
      e.item.classList.toggle("muted", !v);
      if (!v) return;
      if (e.ic.icon !== v.icon) {
        e.ic.icon = v.icon;
        e.ic.setAttribute("icon", v.icon);
      }
      if (e.val.textContent !== v.text) e.val.textContent = v.text;
      e.item.title = v.label;
      extraTexts.push(`${v.label} ${v.text}`);
    });
    els.extras.classList.toggle("hidden", !extraTexts.length);
    els.badge.setAttribute("aria-label", [c.show_name ? name : "", tempText, info, ...extraTexts].filter(Boolean).join(", "));
    els.badge.title = [name, tempText, label, ...extraTexts].filter(Boolean).join(" · ");
    this._drawGraph();
  }

  _drawGraph() {
    const els = this._els;
    if (!els || !this._config) return;
    const type = this._graphType;
    const points = this._config.forecast === "history" ? this._history || [] : type ? forecastPoints(this._forecast[type], type) : [];
    const w = els.graph.clientWidth;
    const h = els.graph.clientHeight;
    const svg =
      points.length > 1 && w && h
        ? renderGraphSVG({ data: points, width: w, height: h, type: "smooth-area", color: "var(--sgwb-accent)", baseline: "bottom", headroom: 0.15, lineWidth: 1.25, fillOpacity: 0.22, idPrefix: this._uid })
        : "";
    if (svg !== this._lastSvg) {
      els.graph.innerHTML = svg;
      this._lastSvg = svg;
    }
  }
}

// ---- editor

const LABELS = {
  entity: "Wetter-Entity",
  name: "Name (optional)",
  show_name: "Name über der Temperatur",
  show_icon: "Wettersymbol",
  extras: "Zusätzliche Werte (Badge wird breiter)",
  extra_entities: "Eigene Sensoren als zusätzliche Werte (z. B. Regenmesser)",
  info: "Zusatz neben der Temperatur",
  forecast: "Verlauf im Hintergrund",
  history_entity: "Eigener Temperatursensor für den Verlauf (optional)",
  hours_to_show: "Zeitraum des Verlaufs (Stunden)",
  decimals: "Nachkommastellen",
};

function weatherToForm(config) {
  const c = config || {};
  return {
    entity: c.entity,
    name: c.name,
    show_name: c.show_name === true,
    show_icon: c.show_icon !== false,
    info: c.info || "condition",
    forecast: c.forecast === false ? "none" : c.forecast || "auto",
    history_entity: c.history_entity,
    hours_to_show: c.hours_to_show ?? 24,
    decimals: c.decimals ?? 0,
    extras: (Array.isArray(c.extras) ? c.extras : []).filter((e) => typeof e === "string"),
    extra_entities: (Array.isArray(c.extras) ? c.extras : []).filter((e) => isPlainObject(e) && e.entity).map((e) => e.entity),
  };
}

function weatherFromForm(config, form) {
  const out = { ...(config || {}) };
  const d = form || {};
  if (d.entity) out.entity = d.entity;
  if (typeof d.name === "string" && d.name) out.name = d.name;
  else delete out.name;
  if (d.show_name === true) out.show_name = true;
  else delete out.show_name;
  if (d.show_icon === false) out.show_icon = false;
  else delete out.show_icon;
  if (d.info && d.info !== "condition") out.info = d.info;
  else delete out.info;
  if (d.forecast && d.forecast !== "auto") out.forecast = d.forecast;
  else delete out.forecast;
  if (out.forecast === "history" && typeof d.history_entity === "string" && d.history_entity) out.history_entity = d.history_entity;
  else if (out.forecast !== "history" || d.history_entity !== undefined) delete out.history_entity;
  if (out.forecast === "history" && typeof d.hours_to_show === "number" && d.hours_to_show !== 24) out.hours_to_show = d.hours_to_show;
  else delete out.hours_to_show;
  if (d.extras !== undefined || d.extra_entities !== undefined) {
    const old = Array.isArray(out.extras) ? out.extras : [];
    const keys = Array.isArray(d.extras) ? d.extras : old.filter((e) => typeof e === "string");
    const ids = Array.isArray(d.extra_entities) ? d.extra_entities : old.filter((e) => isPlainObject(e) && e.entity).map((e) => e.entity);
    const list = [...keys, ...ids.map((id) => old.find((e) => isPlainObject(e) && e.entity === id) || { entity: id })];
    if (list.length) out.extras = list;
    else delete out.extras;
  }
  if (typeof d.decimals === "number" && d.decimals !== 0) out.decimals = d.decimals;
  else delete out.decimals;
  return out;
}

class SmartGraphWeatherBadgeEditor extends Base {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }

  _render() {
    if (!customElements.get("ha-form")) {
      this.textContent = "Der visuelle Editor ist nicht verfügbar. Bitte den YAML-Modus verwenden.";
      return;
    }
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => LABELS[s.name] ?? s.name;
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const next = weatherFromForm(this._config, ev.detail.value);
        this._config = next;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
      });
      this.append(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = [
      { name: "entity", required: true, selector: { entity: { filter: { domain: "weather" } } } },
      { name: "name", selector: { text: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_icon", selector: { boolean: {} } },
          { name: "show_name", selector: { boolean: {} } },
        ],
      },
      {
        name: "info",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "condition", label: "Wetterzustand (z. B. Sonnig)" },
              { value: "high_low", label: "Höchst- / Tiefstwert heute" },
              { value: "humidity", label: "Luftfeuchtigkeit" },
              { value: "wind", label: "Wind" },
              { value: "none", label: "Nichts" },
            ],
          },
        },
      },
      {
        name: "forecast",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "auto", label: "Automatisch (stündlich, sonst täglich)" },
              { value: "hourly", label: "Vorhersage nächste 24 Stunden" },
              { value: "daily", label: "Vorhersage nächste Tage" },
              { value: "history", label: "Temperaturverlauf der letzten Stunden (Standard 24 h)" },
              { value: "none", label: "Kein Verlauf" },
            ],
          },
        },
      },
      {
        name: "extras",
        selector: { select: { multiple: true, mode: "list", options: Object.entries(EXTRAS).map(([value, d]) => ({ value, label: d.label })) } },
      },
      { name: "extra_entities", selector: { entity: { multiple: true, filter: { domain: "sensor" } } } },
      ...(this._config?.forecast === "history"
        ? [
            { name: "history_entity", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
            { name: "hours_to_show", selector: { number: { min: 1, max: 168, mode: "box", unit_of_measurement: "h" } } },
          ]
        : []),
      { name: "decimals", selector: { number: { min: 0, max: 2, mode: "box" } } },
    ];
    this._form.data = weatherToForm(this._config);
  }
}

function registerWeatherBadge() {
  if (typeof customElements === "undefined" || customElements.get(WEATHER_TAG)) return;
  customElements.define(WEATHER_TAG, SmartGraphWeatherBadge);
  if (!customElements.get(WEATHER_EDITOR_TAG)) customElements.define(WEATHER_EDITOR_TAG, SmartGraphWeatherBadgeEditor);
  window.customBadges = window.customBadges || [];
  window.customBadges.push({
    type: WEATHER_TAG,
    name: "Smart Graph Weather Badge",
    description: "Wetter als Badge im Stil der Smart-Graph-Info-Karte: Symbol, Temperatur, Zustand und Vorhersage-Verlauf.",
    preview: true,
    documentationURL: "https://github.com/rest2178/smart-graph-button-card",
  });
}
return { WEATHER_TAG, WEATHER_EDITOR_TAG, CONDITIONS, conditionInfo, INFO_MODES, EXTRAS, extraValue, FORECAST_MODES, WeatherConfigError, validateWeatherConfig, forecastType, forecastPoints, infoText, SmartGraphWeatherBadge, weatherToForm, weatherFromForm, SmartGraphWeatherBadgeEditor, registerWeatherBadge };
})();

// ---- src/contrast.js
const __m_contrast_js = (() => {
/**
 * Text contrast helpers (WCAG 2.x relative luminance / contrast ratio).
 * Pure module – no DOM access. Colors are {r, g, b, a} with r/g/b 0–255, a 0–1.
 */
const { parseColor } = __m_color_utils_js;

const SRGB_FN_RE = /^color\(\s*srgb\s+([-\d.e]+%?)\s+([-\d.e]+%?)\s+([-\d.e]+%?)\s*(?:\/\s*([\d.e]+%?)\s*)?\)$/i;

function unit(v) {
  const n = parseFloat(v);
  return v.endsWith("%") ? n / 100 : n;
}

/**
 * Parse a resolved CSS color as returned by getComputedStyle():
 * rgb()/rgba(), #hex and color(srgb r g b / a). Returns null for anything else
 * (the caller can fall back to a canvas for exotic formats like oklch()).
 */
function parseCssColor(value) {
  if (typeof value !== "string") return null;
  const s = value.trim().toLowerCase();
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  const basic = parseColor(s);
  if (basic) return basic;
  const m = SRGB_FN_RE.exec(s);
  if (!m) return null;
  const ch = (v) => Math.max(0, Math.min(255, Math.round(unit(v) * 255)));
  const a = m[4] === undefined ? 1 : Math.max(0, Math.min(1, unit(m[4])));
  return { r: ch(m[1]), g: ch(m[2]), b: ch(m[3]), a };
}

/** Alpha-composite `top` over `bottom` (bottom is treated as opaque). */
function composite(top, bottom) {
  const a = top.a ?? 1;
  const mixc = (t, b) => Math.round(t * a + b * (1 - a));
  return { r: mixc(top.r, bottom.r), g: mixc(top.g, bottom.g), b: mixc(top.b, bottom.b), a: 1 };
}

function lin(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance({ r, g, b }) {
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function isDark(color) {
  return luminance(color) < 0.18;
}

function toHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h / 6, s, l };
}

function fromHsl({ h, s, l }) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v, a: 1 };
  }
  const hue = (p, q, t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue(p, q, h + 1 / 3) * 255),
    g: Math.round(hue(p, q, h) * 255),
    b: Math.round(hue(p, q, h - 1 / 3) * 255),
    a: 1,
  };
}

/** Lowest contrast of `fg` against every background (fg alpha is composited onto each). */
function minContrast(fg, backgrounds) {
  let min = Infinity;
  for (const bg of backgrounds) min = Math.min(min, contrastRatio(composite(fg, bg), bg));
  return min;
}

/**
 * Make `fg` readable on all `backgrounds` (opaque colors). Returns null when the
 * color already reaches `target`. Otherwise returns a color with the same hue
 * and saturation and a clearly readable lightness: the lightness closest to the
 * original that reaches `ideal` (comfortable reading), else the closest that
 * reaches `target`, else (e.g. text over a mid-tone graph) the most readable one.
 */
function ensureContrast(fg, backgrounds, target = 4.5, ideal = target >= 4.5 ? 7 : 4.5) {
  if (!fg || !backgrounds.length) return null;
  if (minContrast(fg, backgrounds) >= target) return null;
  const hsl = toHsl(composite(fg, backgrounds[0]));
  let best = null;
  let bestRank = [-1, -Infinity];
  for (let i = 0; i <= 100; i++) {
    const cand = fromHsl({ ...hsl, l: i / 100 });
    const score = minContrast(cand, backgrounds);
    const dist = Math.abs(i / 100 - hsl.l);
    // rank: tier first (ideal > target > neither), then closeness / score
    const tier = score >= ideal ? 2 : score >= target ? 1 : 0;
    const rank = [tier, tier > 0 ? -dist : score];
    if (rank[0] > bestRank[0] || (rank[0] === bestRank[0] && rank[1] > bestRank[1])) {
      best = cand;
      bestRank = rank;
    }
  }
  return best;
}

function rgbString({ r, g, b, a = 1 }) {
  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})` : `rgb(${r}, ${g}, ${b})`;
}

/** WCAG large text: ≥ 24px, or ≥ 18.66px bold. */
function contrastTarget(fontSizePx, fontWeight) {
  const w = Number(fontWeight) || 400;
  return fontSizePx >= 24 || (fontSizePx >= 18.66 && w >= 700) ? 3 : 4.5;
}
return { parseCssColor, composite, luminance, contrastRatio, isDark, minContrast, ensureContrast, rgbString, contrastTarget };
})();

// ---- src/smart-graph-button-card.js
const __m_smart_graph_button_card_js = (() => {
/**
 * Smart Graph Button Card – a self-contained Home Assistant Lovelace card.
 * No dependencies on other custom cards, no external resources.
 *
 * type: custom:smart-graph-button-card
 */
const { CARD_STYLES } = __m_styles_js;
const { validateConfig, ConfigError, designDefaults } = __m_config_validator_js;
const { getStateGroup, matchCustomState, normalizeThresholdRanges, findThresholdColor, resolveColor } = __m_state_resolver_js;
const { resolveValue, isTemplate, formatNumber, getNumberLocale } = __m_value_formatter_js;
const { fetchHistory } = __m_history_provider_js;
const { reduceSeries, appendPoint } = __m_data_reducer_js;
const { renderGraphSVG } = __m_graph_renderer_js;
const { GestureRecognizer, bindActionHandler, handleAction, hasAction } = __m_action_handler_js;
const { parseNumber, isDisplayable, isSafeCssValue, cssLengthToPx, paddingSide } = __m_utils_js;
const { EDITOR_TAG } = __m_smart_graph_button_card_editor_js;
const { lightColor } = __m_color_utils_js;
const { registerOverviewCard } = __m_overview_card_js;
const { registerMediaCard } = __m_media_card_js;
const { registerWeatherBadge } = __m_weather_badge_js;
const { resolveLevels, findLevel, ringFraction, TYPE_COLORS, TYPE_ICONS } = __m_levels_js;
const { parseCssColor, composite, ensureContrast, contrastTarget, rgbString } = __m_contrast_js;

const CARD_TAG = "smart-graph-button-card";
const INFO_CARD_TAG = "smart-graph-info-card";
const CARD_VERSION = "1.18.0";

let instanceCounter = 0;

const DOMAIN_ICONS = {
  switch: "mdi:toggle-switch-variant",
  light: "mdi:lightbulb",
  fan: "mdi:fan",
  sensor: "mdi:eye",
  binary_sensor: "mdi:checkbox-blank-circle-outline",
  climate: "mdi:thermostat",
  cover: "mdi:window-shutter",
  lock: "mdi:lock",
  media_player: "mdi:cast",
  input_boolean: "mdi:toggle-switch-outline",
  person: "mdi:account",
  script: "mdi:script-text",
  scene: "mdi:palette",
  automation: "mdi:robot",
  button: "mdi:gesture-tap-button",
};

function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** True when `path` (dot separated) is explicitly present in the raw YAML config. */
function userSet(raw, path) {
  let cur = raw;
  for (const key of path.split(".")) {
    if (cur === null || typeof cur !== "object" || !(key in cur)) return false;
    cur = cur[key];
  }
  return cur !== undefined && cur !== null;
}

function mix(color, percent) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/**
 * Sanitise inline SVG markup: removes scripts, foreign content, event handler
 * attributes and external references. Returns an SVG element or null.
 */
function sanitizeSvg(markup) {
  try {
    const doc = new DOMParser().parseFromString(String(markup), "image/svg+xml");
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== "svg" || doc.getElementsByTagName("parsererror").length) return null;
    svg.querySelectorAll("script, foreignObject, iframe, object, embed, style, image, a").forEach((n) => n.remove());
    const walk = (node) => {
      for (const attr of Array.from(node.attributes)) {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();
        if (
          name.startsWith("on") ||
          ((name === "href" || name === "xlink:href" || name === "src") && !value.startsWith("#")) ||
          (name === "style" && /url\s*\(|expression|javascript:/.test(value))
        ) {
          node.removeAttribute(attr.name);
        }
      }
      Array.from(node.children).forEach(walk);
    };
    walk(svg);
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    return document.importNode(svg, true);
  } catch (_err) {
    return null;
  }
}

/** Graph color for `color: auto`, chosen by the sensor's device class. */
const AUTO_COLORS = {
  temperature: "#ef4444",
  humidity: "#22c55e",
  moisture: "#22c55e",
  power: "#f59e0b",
  energy: "#f59e0b",
  battery: "#22c55e",
  illuminance: "#eab308",
  carbon_dioxide: "#a855f7",
  pressure: "#06b6d4",
  atmospheric_pressure: "#06b6d4",
  wind_speed: "#06b6d4",
  precipitation: "#3b82f6",
};

function graphKey(g) {
  return JSON.stringify([g.enabled, g.entity, g.attribute, g.hours_to_show, g.update_interval]);
}

class SmartGraphButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uid = `sgbc${++instanceCounter}`;
    this._config = null;
    this._rawConfig = null;
    this._hass = null;
    this._error = null;
    this._els = null;
    this._watched = [];
    this._prevStates = new Map();
    this._connected = false;
    this._raf = 0;
    this._graphRaf = 0;
    this._timer = null;
    this._ro = null;
    this._unbindActions = null;
    this._points = [];
    this._graphToken = 0;
    this._graphKey = "";
    this._graphLoaded = false;
    this._graphSize = { w: 0, h: 0 };
    this._lastSvg = null;
    this._lastGraphState = null;
    this._failedPictures = new Set();
    this._ranges = { top: [], graph: [] };
    this._colorState = { group: "unavailable", customClass: undefined, graphOverride: null };
  }

  // ------------------------------------------------------------------ HA API

  static getConfigElement() {
    return document.createElement(EDITOR_TAG);
  }

  static getStubConfig(hass) {
    const states = hass?.states || {};
    const ids = Object.keys(states);
    const entity = ids.find((id) => /^(switch|light|input_boolean|fan)\./.test(id)) || ids[0] || "switch.example";
    const power = ids.find((id) => id.startsWith("sensor.") && states[id]?.attributes?.device_class === "power");
    const config = { entity, value_1: { type: "state" } };
    if (power) {
      config.value_2 = { entity: power, decimals: 1 };
      config.graph = { entity: power, type: "bar", position: "left", width: "55%", hours_to_show: 6 };
    }
    return config;
  }

  setConfig(config) {
    let normalized;
    try {
      normalized = validateConfig(config);
    } catch (err) {
      this._config = null;
      this._error = err instanceof ConfigError ? err.message : `Unerwarteter Fehler: ${err?.message || err}`;
      this._teardown();
      this._renderError();
      return;
    }
    this._error = null;
    this._rawConfig = config;
    this._config = normalized;
    this._watched = this._collectEntities(normalized);
    this._prevStates.clear();
    this._ranges = {
      top: normalized.thresholds ? normalizeThresholdRanges(normalized.thresholds.ranges) : [],
      graph: normalizeThresholdRanges(normalized.graph.thresholds),
    };
    const gk = graphKey(normalized.graph);
    if (gk !== this._graphKey) {
      this._graphKey = gk;
      this._points = [];
      this._graphLoaded = false;
      this._graphToken++;
      this._lastGraphState = null;
    }
    this._lastSvg = null;
    this._teardown();
    this._build();
    if (this._connected) this._attach();
    this._scheduleUpdate();
  }

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    if (!this._config || !hass) return;
    let changed = !old || old.locale !== hass.locale || old.language !== hass.language || old.themes !== hass.themes;
    for (const id of this._watched) {
      const s = hass.states?.[id];
      if (this._prevStates.get(id) !== s) {
        this._prevStates.set(id, s);
        changed = true;
      }
    }
    const g = this._config.graph;
    if (g.enabled) {
      const s = hass.states?.[g.entity];
      if (s && s !== this._lastGraphState) {
        this._lastGraphState = s;
        this._appendLive(s);
      }
      if (!this._graphLoaded && this._connected && !this._fetching) this._fetchGraph();
    }
    if (changed) this._scheduleUpdate();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    const px = cssLengthToPx(this._config?.layout?.height) ?? 64;
    return Math.max(1, Math.ceil(px / 50));
  }

  getGridOptions() {
    const px = cssLengthToPx(this._config?.layout?.height);
    const info = this._config?.variant === "info";
    return {
      columns: info ? 3 : 6,
      rows: px !== null && px <= 56 ? 1 : "auto",
      min_columns: info ? 2 : 3,
      min_rows: 1,
    };
  }

  connectedCallback() {
    this._connected = true;
    if (this._config) {
      if (!this._els) this._build();
      this._attach();
      this._scheduleUpdate();
    }
  }

  disconnectedCallback() {
    this._connected = false;
    this._teardown();
  }

  // ------------------------------------------------------------ lifecycle

  _collectEntities(c) {
    const ids = new Set([c.entity]);
    if (c.state_entity) ids.add(c.state_entity);
    if (c.name && typeof c.name === "object" && c.name.entity) ids.add(c.name.entity);
    for (const v of [c.value_1, c.value_2]) if (v && v.entity) ids.add(v.entity);
    if (c.graph.enabled) ids.add(c.graph.entity);
    if (c.thresholds?.entity) ids.add(c.thresholds.entity);
    for (const s of c.states) if (s.entity) ids.add(s.entity);
    return Array.from(ids);
  }

  /** Attach listeners, observers and timers (only while connected). */
  _attach() {
    if (!this._els || !this._config) return;
    this._detach();
    const c = this._config;
    const card = this._els.card;

    const recognizer = new GestureRecognizer({
      holdTime: c.hold_time,
      doubleTapWindow: c.double_tap_window,
      hasHold: () => hasAction(this._config?.hold_action),
      hasDoubleTap: () => hasAction(this._config?.double_tap_action),
      onAction: (gesture) => {
        if (this._config && this._hass) handleAction(this, this._hass, this._config, gesture);
      },
    });
    this._unbindActions = bindActionHandler(card, recognizer, {
      onPressChange: (pressed) => card.classList.toggle("pressed", pressed),
    });

    if (c.graph.enabled && typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver((entries) => {
        const rect = entries[entries.length - 1]?.contentRect;
        if (!rect) return;
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        if (w !== this._graphSize.w || h !== this._graphSize.h) {
          this._graphSize = { w, h };
          this._scheduleGraph();
        }
      });
      this._ro.observe(this._graphTarget());
    }

    if (c.graph.enabled) {
      this._timer = setInterval(() => this._fetchGraph(), c.graph.update_interval * 1000);
      if (this._hass) this._fetchGraph();
    }
  }

  _detach() {
    if (this._unbindActions) {
      this._unbindActions();
      this._unbindActions = null;
    }
    if (this._ro) {
      this._ro.disconnect();
      this._ro = null;
    }
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _teardown() {
    this._detach();
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._graphRaf) cancelAnimationFrame(this._graphRaf);
    this._raf = 0;
    this._graphRaf = 0;
    this._graphToken++; // discard pending history responses
    this._fetching = false;
    clearTimeout(this._contrastTimer);
    this._contrastTimer = 0;
  }

  _scheduleUpdate() {
    if (this._raf || !this._config) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = 0;
      this._update();
    });
  }

  _scheduleGraph() {
    if (this._graphRaf || !this._config) return;
    this._graphRaf = requestAnimationFrame(() => {
      this._graphRaf = 0;
      this._renderGraph();
      this._checkContrast();
    });
  }

  // ------------------------------------------------------------ rendering

  _renderError() {
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = el("style");
    style.textContent = CARD_STYLES;
    const card = el("ha-card", "sgbc-error", { role: "alert" });
    const title = el("div", "title");
    title.textContent = "Smart Graph Button Card – Konfigurationsfehler";
    const msg = el("div", "msg");
    msg.textContent = this._error || "Unbekannter Fehler";
    card.append(title, msg);
    root.append(style, card);
    this._els = null;
  }

  _build() {
    const c = this._config;
    const raw = this._rawConfig || {};
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = el("style");
    style.textContent = CARD_STYLES;

    const card = el("ha-card", `sgbc design-${c.design || "standard"}${c.design_size === "double" ? " design-double" : ""}`, { tabindex: "0", role: "button" });
    // a value counts as configured when the user or the chosen design sets it
    const configured = (path) => userSet(raw, path) || (c.design && c.design !== "standard" && userSet(designDefaults(c.design, c.design_size, c.variant === "info"), path));
    const stateBg = el("div", "layer state-bg");
    // "after-icon" without an icon area is the same as "full"
    const graphPos = c.graph.position === "after-icon" && !c.icon_area.enabled ? "full" : c.graph.position;
    const graph = el("div", `layer graph pos-${graphPos}${c.icon_area.position === "right" ? " mirror" : ""}${c.graph.enabled ? "" : " hidden"}`);
    const overlay = el("div", `layer overlay${c.layers.overlay.enabled ? "" : " hidden"}`);
    const content = el("div", "content");
    const divider = el("div", "layer divider");
    const effects = el("div", "layer effects");

    // icon area
    let iconWrap = null;
    let iconArea = null;
    let iconGraph = null;
    let glyph = null;
    let badge = null;
    if (c.icon_area.enabled) {
      iconWrap = el("div", "icon-wrap");
      iconArea = el("div", `icon-area shape-${c.icon_area.shape}`);
      iconGraph = el("div", `icon-graph${c.graph.enabled && c.graph.position === "icon-area" ? "" : " hidden"}`);
      glyph = el("div", "glyph");
      iconArea.append(iconGraph, glyph);
      badge = el("ha-icon", "badge", { icon: "mdi:alert-circle", "aria-hidden": "true" });
      badge.icon = "mdi:alert-circle";
      iconWrap.append(iconArea, badge);
      if (c.icon_svg) {
        const svg = sanitizeSvg(c.icon_svg);
        if (svg) {
          const span = el("span", "svg-icon");
          span.append(svg);
          glyph.append(span);
        }
      }
    }
    if (!iconWrap) {
      content.classList.add("no-icon");
      card.classList.add("no-icon");
    }
    if (c.icon_area.position === "right") content.classList.add("icon-right");

    const isInfo = c.variant === "info";
    if (isInfo) {
      card.classList.add("variant-info");
      content.classList.add("info-layout");
    }
    const info = el("div", "info");
    const name = el("div", `name${c.show_name ? "" : " hidden"}`);
    if (c.name_style.overflow === "wrap" || c.name_style.max_lines > 1) name.classList.add("multiline");
    if (c.name_style.overflow === "clip") name.classList.add("overflow-clip");
    const values = el("div", `values${c.values.layout === "stacked" ? " stacked" : ""}${c.values.status_dot ? " status-dot" : ""}`);
    const makeValue = (i) => {
      const wrap = el("span", `value value-${i}`);
      const icon = el("ha-icon", "hidden", { "aria-hidden": "true" });
      const text = el("span", "value-text");
      const unit = el("span", "unit hidden");
      wrap.append(icon, text, unit);
      return { wrap, icon, text, unit };
    };
    const v1 = makeValue(1);
    const sep = el("span", "sep", { "aria-hidden": "true" });
    sep.textContent = c.values.separator;
    const v2 = makeValue(2);
    values.append(v1.wrap, sep, v2.wrap);
    const infoDesign = isInfo && c.design && c.design !== "standard";
    // status line ("● Optimal") of the info designs
    const status = el("div", "status hidden");
    const statusDot = el("span", "status-dot-mark");
    const statusIcon = el("ha-icon", "status-icon hidden", { "aria-hidden": "true" });
    const statusLabel = el("span", "status-label");
    status.append(statusDot, statusIcon, statusLabel);
    let ring = null;
    if (infoDesign) {
      card.classList.add("variant-info");
      content.classList.add("idesign", `idesign-${c.design}`);
      const titles = el("div", "i-titles");
      if (c.design === "ring" && iconWrap) {
        // status ring around the icon: track + arc (stroke-dasharray)
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("class", "ring");
        svg.setAttribute("aria-hidden", "true");
        const track = document.createElementNS(ns, "circle");
        const arc = document.createElementNS(ns, "circle");
        for (const [node, cls] of [[track, "ring-track"], [arc, "ring-arc"]]) {
          node.setAttribute("cx", "50");
          node.setAttribute("cy", "50");
          node.setAttribute("r", "45");
          node.setAttribute("pathLength", "100");
          node.setAttribute("class", cls);
        }
        arc.setAttribute("stroke-dasharray", "0 100");
        svg.append(track, arc);
        iconWrap.prepend(svg);
        ring = { svg, arc };
      }
      if (c.design === "tile") {
        const top = el("div", "i-top");
        titles.append(name, status);
        if (iconWrap) top.append(iconWrap);
        top.append(titles);
        content.append(top, values);
      } else if (c.design === "ring") {
        const row = el("div", "i-row");
        titles.append(name, values, status);
        if (iconWrap) row.append(iconWrap);
        row.append(titles);
        content.append(row);
      } else {
        // compact: centered column
        if (iconWrap) content.append(iconWrap);
        content.append(name, values, status);
      }
      content.append(info); // empty, keeps the element references valid
      info.classList.add("hidden");
    } else if (isInfo) {
      // info layout: [icon name] on top, large value below
      const head = el("div", "info-head");
      const iconInHead = Boolean(iconWrap) && (c.icon_position === "name-left" || c.icon_position === "name-right");
      // nothing left in the header row: drop it so the value can use the full height
      if (!c.show_name && !iconInHead && c.value_position !== "name-right") head.classList.add("hidden");
      if (iconWrap && c.icon_position === "name-left") head.append(iconWrap);
      head.append(name);
      if (iconWrap && !iconInHead) {
        // icon placed freely in the card (corner, centre, …)
        const [iv, ih] = c.icon_position.split("-");
        iconWrap.classList.add("icon-abs", `ipos-v-${iv}`, `ipos-h-${ih}`);
        content.classList.add(`ipos-${c.icon_position}`); // keeps the name clear of a corner icon
        content.append(iconWrap);
      }
      if (c.value_position === "name-right") {
        head.append(values); // value in the header row, right of the name
        if (iconWrap && c.icon_position === "name-right") head.append(iconWrap);
        info.append(head);
      } else {
        if (iconWrap && c.icon_position === "name-right") head.append(iconWrap);
        const [v, hz] = c.value_position.split("-");
        content.classList.add(`vpos-v-${v}`, `vpos-h-${hz}`);
        info.append(head, values);
      }
      content.append(info);
    } else {
      info.append(name, values);
      if (iconWrap) content.append(iconWrap);
      content.append(info);
    }

    // large value on the right ("9 W" + "aktuell"), plain or as a filled badge
    let hero = null;
    if (c.hero && !isInfo) {
      const box = el("div", `hero hero-${c.hero.style}`);
      const value = el("span", "hero-value");
      const caption = el("span", `hero-caption${c.hero.caption ? "" : " hidden"}`);
      caption.textContent = c.hero.caption;
      box.append(value, caption);
      content.append(box);
      content.classList.add("has-hero");
      hero = { box, value, caption };
    }

    // panel design: the graph sits in the row between status and value box
    const inlineGraph = c.design === "panel" && !isInfo && c.graph.enabled && (graphPos === "right" || graphPos === "left");
    if (inlineGraph) {
      graph.classList.add("inline");
      content.classList.add("panel-row");
      content.insertBefore(graph, hero ? hero.box : null);
    }
    card.append(stateBg, ...(inlineGraph ? [] : [graph]), divider, overlay, content, effects);
    root.append(style, card);

    // static CSS variables – layout values are only set when configured so
    // that themes can provide --sgbc-* defaults.
    const setVar = (name, value) => {
      if (isDisplayable(value) && isSafeCssValue(String(value))) card.style.setProperty(name, String(value));
    };
    const layoutMap = {
      height: "--sgbc-height",
      min_width: "--sgbc-min-width",
      padding: "--sgbc-padding",
      gap: "--sgbc-gap",
      border_radius: "--sgbc-border-radius",
      border_width: "--sgbc-border-width",
      border_color: "--sgbc-border-color",
      overflow: "--sgbc-overflow",
      background: "--sgbc-background",
    };
    for (const [key, cssVar] of Object.entries(layoutMap)) {
      if (configured(`layout.${key}`) && c.layout[key] !== "auto") setVar(cssVar, c.layout[key]);
    }
    if (c.layout.height === "auto") card.classList.add("auto-height");
    setVar("--sgbc-icon-area-size", c.icon_area.size);
    setVar("--sgbc-icon-size", c.icon_area.icon_size);
    setVar("--sgbc-anim-duration", c.icon_area.animation?.duration);
    // info cards scale the name with the card width unless a size is configured
    if (!isInfo || userSet(raw, "name_style.font_size")) setVar("--sgbc-name-size", c.name_style.font_size);
    setVar("--sgbc-name-weight", c.name_style.font_weight);
    setVar("--sgbc-name-align", c.name_style.align);
    setVar("--sgbc-name-lines", c.name_style.overflow === "wrap" && c.name_style.max_lines === 1 ? 2 : c.name_style.max_lines);
    setVar("--sgbc-values-gap", c.values.gap);
    setVar("--sgbc-values-size", c.values.font_size);
    if (c.design && c.design !== "standard") setVar("--sgbc-pad-left", paddingSide(c.layout.padding, "left"));
    if (isInfo) {
      setVar("--sgbc-value-dx", c.value_offset.x);
      setVar("--sgbc-value-dy", c.value_offset.y);
      setVar("--sgbc-icon-dx", c.icon_offset.x);
      setVar("--sgbc-icon-dy", c.icon_offset.y);
      for (const side of ["top", "right", "bottom", "left"]) setVar(`--sgbc-pad-${side}`, paddingSide(c.layout.padding, side));
    }
    for (const i of [1, 2]) {
      const v = c[`value_${i}`];
      if (!v) continue;
      setVar(`--sgbc-value-${i}-size`, v.font_size);
      setVar(`--sgbc-value-${i}-weight`, v.font_weight);
    }
    if (hero?.box && c.hero.font_size) setVar("--sgbc-hero-size", c.hero.font_size);
    if (configured("graph.opacity")) setVar("--sgbc-graph-opacity", c.graph.opacity);
    if (c.graph.position === "left" || c.graph.position === "right") setVar("--sgbc-graph-width", c.graph.width);
    if (c.graph.position === "bottom") setVar("--sgbc-graph-height", c.graph.height);
    if (graphPos === "after-icon") {
      // graph starts where the icon area ends: padding + icon size + offset
      const side = c.icon_area.position === "right" ? "right" : "left";
      setVar("--sgbc-graph-pad", paddingSide(c.layout.padding, side));
      setVar("--sgbc-graph-icon-offset", c.graph.icon_offset);
    }
    if (parseFloat(c.graph.fade_start) > 0 || parseFloat(c.graph.fade_end) > 0) {
      graph.classList.add("fade");
      if (iconGraph) iconGraph.classList.add("fade");
      setVar("--sgbc-fade-start", c.graph.fade_start);
      setVar("--sgbc-fade-end", c.graph.fade_end);
    }
    if (c.graph.position === "custom") {
      setVar("--sgbc-graph-left", c.graph.bounds.left);
      setVar("--sgbc-graph-top", c.graph.bounds.top);
      setVar("--sgbc-graph-width", c.graph.bounds.width);
      setVar("--sgbc-graph-height", c.graph.bounds.height);
    }
    card.style.setProperty("--sgbc-z-state", c.layers.graph_above_state_background ? "1" : "2");
    card.style.setProperty("--sgbc-z-graph", c.layers.graph_above_state_background ? "2" : "1");
    if (c.layers.overlay.enabled) setVar("--sgbc-overlay-color", c.layers.overlay.color);
    if (!hasAction(c.tap_action) && !hasAction(c.hold_action) && !hasAction(c.double_tap_action)) {
      card.classList.add("no-action");
    }

    // background fades are CSS transitions – re-check once they finished
    const recheck = () => this._checkContrast();
    stateBg.addEventListener("transitionend", recheck);
    card.addEventListener("transitionend", (ev) => ev.target === card && recheck());
    const probe = el("span", "probe", { "aria-hidden": "true" });
    content.append(probe);
    this._els = { card, stateBg, graph, divider, overlay, content, iconWrap, iconArea, iconGraph, glyph, badge, name, values, v1, v2, sep, hero, probe, status, statusDot, statusIcon, statusLabel, ring };
    this._levelsFor = undefined;
    this._graphSize = { w: 0, h: 0 };
    this._lastSvg = null;
    this._glyphKey = null;
  }

  _graphTarget() {
    return this._config.graph.position === "icon-area" && this._els.iconGraph ? this._els.iconGraph : this._els.graph;
  }

  _update() {
    if (!this._config || !this._els) return;
    try {
      this._updateContent();
      this._renderGraph();
      this._checkContrast();
      // background colors fade (CSS transition) – check again once settled
      clearTimeout(this._contrastTimer);
      this._contrastTimer = setTimeout(() => {
        this._contrastTimer = 0;
        this._checkContrast();
      }, 320);
    } catch (err) {
      // never let a rendering problem break the dashboard
      // eslint-disable-next-line no-console
      console.error("[smart-graph-button-card] render error:", err);
    }
  }

  _updateContent() {
    const c = this._config;
    const hass = this._hass;
    const els = this._els;
    const card = els.card;
    const states = hass?.states || {};
    const mainObj = states[c.entity];
    const stateId = c.state_entity || c.entity;
    const stateObj = states[stateId];
    const state = stateObj?.state;

    const group = getStateGroup(state, c.state_mapping, c.case_sensitive);
    const custom = matchCustomState(state, c.states, {
      caseSensitive: c.case_sensitive,
      resolveSource: (rule) => {
        if (!rule.entity && !rule.attribute) return state;
        const src = rule.entity ? states[rule.entity] : stateObj;
        return rule.attribute ? src?.attributes?.[rule.attribute] : src?.state;
      },
    });
    const customClass = custom?.class;

    let thrColor = null;
    if (c.thresholds) {
      const srcId = c.thresholds.entity || (c.graph.enabled ? c.graph.entity : c.entity);
      const src = states[srcId];
      const v = c.thresholds.attribute ? src?.attributes?.[c.thresholds.attribute] : src?.state;
      thrColor = findThresholdColor(v, this._ranges.top);
    }
    const override = (target) => {
      if (thrColor && c.thresholds.apply_to.includes(target)) return thrColor;
      if (custom?.color && c.color_targets.includes(target)) return custom.color;
      return null;
    };
    this._colorState = { group, customClass, graphOverride: override("graph") };

    const setVar = (name, value) => {
      if (isDisplayable(value) && isSafeCssValue(String(value))) card.style.setProperty(name, String(value));
      else card.style.removeProperty(name);
    };

    // state classes
    for (const cls of Array.from(card.classList)) {
      if (cls.startsWith("state-") || cls.startsWith("custom-")) card.classList.remove(cls);
    }
    card.classList.add(`state-${group}`);
    if (customClass) card.classList.add(`custom-${customClass}`);

    // colors
    // status level (info designs) and accent color
    const deviceClass = mainObj?.attributes?.device_class;
    let level = null;
    if (c.levels) {
      if (this._levelsFor !== deviceClass) {
        this._levels = resolveLevels(c.levels, deviceClass);
        this._levelsFor = deviceClass;
      }
      level = group === "unavailable" ? null : findLevel(mainObj?.state, this._levels);
    }
    let accent = resolveColor(c.accent_color, group, customClass);
    if (accent === "level") accent = level?.color || TYPE_COLORS[deviceClass] || "auto";
    if (accent === "auto") accent = TYPE_COLORS[deviceClass] || AUTO_COLORS[deviceClass] || "var(--primary-color, #03a9f4)";
    if (group === "unavailable" && c.variant === "info" && c.design !== "standard") accent = "var(--disabled-text-color, #6b7280)";
    setVar("--sgbc-accent", accent);
    if (els.status) {
      els.status.classList.toggle("hidden", !level || !level.label);
      if (level) {
        if (els.statusLabel.textContent !== level.label) els.statusLabel.textContent = level.label;
        setVar("--sgbc-level-color", level.color);
        const ic = level.icon || "";
        els.statusIcon.classList.toggle("hidden", !ic);
        els.statusDot.classList.toggle("hidden", Boolean(ic));
        if (ic && els.statusIcon.icon !== ic) {
          els.statusIcon.icon = ic;
          els.statusIcon.setAttribute("icon", ic);
        }
      }
    }
    if (els.ring) {
      const f = group === "unavailable" ? 0 : ringFraction(mainObj?.state, deviceClass, c.ring ? [c.ring.min, c.ring.max] : null);
      els.ring.arc.setAttribute("stroke-dasharray", `${Math.round(f * 1000) / 10} 100`);
    }
    // icon in the current color of a light (WLED strip …) while it is on
    const iconOverride = override("icon");
    this._lightIcon = !iconOverride && c.icon_area.color_source === "light" && group === "on" ? lightColor(mainObj) : null;
    setVar("--sgbc-icon-color", iconOverride ?? (this._lightIcon ? rgbString(this._lightIcon) : resolveColor(c.icon_area.color, group, customClass)));
    const ib = override("icon-background");
    setVar("--sgbc-icon-background", ib ? mix(ib, 18) : resolveColor(c.icon_area.background, group, customClass));
    const cb = override("card-background");
    setVar("--sgbc-state-background", cb ? mix(cb, 16) : c.state_background.enabled ? resolveColor(c.state_background.colors, group, customClass) : null);
    const nameColor = override("name") ?? (userSet(this._rawConfig, "name_style.color") ? resolveColor(c.name_style.color, group, customClass) : null);
    setVar("--sgbc-name-color", nameColor);
    setVar("--sgbc-value-color", resolveColor(c.values.color, group, customClass));

    // icon
    this._updateIcon(mainObj, group, customClass);

    // name
    const name = this._resolveName(mainObj);
    if (els.name.textContent !== name) els.name.textContent = name;
    els.name.title = name;

    // values
    const ctx = { entityId: c.entity, group, customClass, unavailableText: c.unavailable_text, unknownText: c.unknown_text };
    const results = [];
    let visibleCount = 0;
    for (const i of [1, 2]) {
      const cfg = c[`value_${i}`];
      const ref = els[`v${i}`];
      // info card: the main value is shown large with a separate, small unit
      const splitUnit = c.variant === "info" && i === 1 && cfg && cfg.type !== "text" && !cfg.template;
      let r = null;
      let unitText = "";
      if (cfg && splitUnit) {
        r = resolveValue({ ...cfg, unit: "", use_entity_unit: false }, hass, ctx);
        if (!r.hidden && !r.unavailable && r.numeric !== null) {
          const src = hass?.states?.[cfg.entity || c.entity];
          const entityUnit = cfg.type === "attribute" ? undefined : src?.attributes?.unit_of_measurement;
          const u = cfg.use_entity_unit === false ? cfg.unit : cfg.use_entity_unit === true ? entityUnit ?? cfg.unit : cfg.unit ?? entityUnit;
          unitText = isDisplayable(u) ? String(u) : "";
          if (unitText) r = { ...r, aria: `${r.aria} ${unitText}` };
        }
      } else if (cfg) {
        r = resolveValue(cfg, hass, ctx);
      }
      results.push(r);
      const visible = Boolean(r && !r.hidden);
      ref.wrap.classList.toggle("hidden", !visible);
      if (!visible) continue;
      visibleCount++;
      if (ref.text.textContent !== r.text) ref.text.textContent = r.text;
      if (ref.unit.textContent !== unitText) ref.unit.textContent = unitText;
      ref.unit.classList.toggle("hidden", !unitText);
      if (cfg.icon) {
        ref.icon.icon = cfg.icon;
        ref.icon.setAttribute("icon", cfg.icon);
        ref.icon.classList.remove("hidden");
      } else ref.icon.classList.add("hidden");
      setVar(`--sgbc-value-${i}-color`, override(`value-${i}`) ?? r.color);
    }
    if (els.hero) {
      const hr = resolveValue(c.hero, hass, ctx);
      const text = hr && !hr.hidden ? hr.text : "";
      els.hero.box.classList.toggle("hidden", !text);
      if (els.hero.value.textContent !== text) els.hero.value.textContent = text;
      setVar("--sgbc-hero-color", hr?.color ?? null);
      if (text && !results.some((r) => r && !r.hidden && r.text === text)) results.push({ ...hr, aria: c.hero.caption ? `${hr.aria} ${c.hero.caption}` : hr.aria });
    }
    const bothInline = results[0] && !results[0].hidden && results[1] && !results[1].hidden && c.values.layout === "inline" && c.values.separator !== "";
    els.sep.classList.toggle("hidden", !bothInline);
    els.values.classList.toggle("hidden", visibleCount === 0);

    // unavailable badge (state not conveyed by color only)
    const unavailable = group === "unavailable";
    if (els.badge) {
      els.badge.classList.toggle("visible", unavailable && c.show_unavailable_badge);
      els.badge.title = this._stateText(stateObj);
    }

    // accessibility label
    const parts = [name];
    const stateShown = results.some((r) => r && !r.hidden && r.isState && r.entityId === stateId);
    if (!stateShown) parts.push(this._stateText(stateObj));
    for (const r of results) if (r && !r.hidden) parts.push(r.aria);
    card.setAttribute("aria-label", parts.filter(isDisplayable).join(", "));
  }

  _stateText(stateObj) {
    const c = this._config;
    if (!stateObj) return "Entity nicht gefunden";
    const s = String(stateObj.state).toLowerCase();
    if (s === "unavailable" && c.unavailable_text) return c.unavailable_text;
    if (s === "unknown" && c.unknown_text) return c.unknown_text;
    try {
      const formatted = this._hass?.formatEntityState?.(stateObj);
      if (isDisplayable(formatted)) return String(formatted);
    } catch (_err) {
      /* ignore */
    }
    if (s === "unavailable") return "Nicht verfügbar";
    if (s === "unknown") return "Unbekannt";
    return isDisplayable(stateObj.state) ? String(stateObj.state) : "";
  }

  _resolveName(mainObj) {
    const c = this._config;
    const hass = this._hass;
    const fallbackName = mainObj?.attributes?.friendly_name ?? c.entity;
    const n = c.name;
    let out;
    if (typeof n === "string") {
      out = isTemplate(n) ? resolveValue({ type: "template", template: n, fallback: c.entity }, hass, { entityId: c.entity }).text : n;
    } else if (n && typeof n === "object") {
      const id = n.entity || c.entity;
      const src = hass?.states?.[id];
      if (n.template) out = resolveValue({ type: "template", template: n.template, entity: id, fallback: c.entity }, hass, { entityId: id }).text;
      else if (n.attribute) out = src?.attributes?.[n.attribute];
      else if (n.text !== undefined) out = n.text;
      else out = src?.attributes?.friendly_name ?? id;
    } else {
      out = fallbackName;
    }
    return isDisplayable(out) ? String(out) : String(fallbackName);
  }

  _updateIcon(mainObj, group, customClass) {
    const c = this._config;
    const els = this._els;
    if (!els.glyph) return;

    const anim = c.icon_area.animation ? c.icon_area.animation[customClass] ?? c.icon_area.animation[group] ?? "none" : "none";
    els.glyph.className = `glyph${anim && anim !== "none" ? ` anim-${anim}` : ""}`;

    if (c.icon_svg && els.glyph.querySelector(".svg-icon")) return;

    const picture = c.use_entity_picture ? mainObj?.attributes?.entity_picture : c.picture;
    const iconCfg = resolveColor(c.icon, group, customClass); // icon may be a per-state map
    let mode;
    if (picture && !this._failedPictures.has(picture)) mode = "picture";
    else if (iconCfg === "none") mode = "none";
    else if (iconCfg) mode = "icon";
    else if (c.variant === "info" && c.design !== "standard" && TYPE_ICONS[mainObj?.attributes?.device_class] && !mainObj?.attributes?.icon) mode = "icon";
    else if (mainObj && customElements.get("ha-state-icon")) mode = "state-icon";
    else mode = "icon";

    if (mode !== this._glyphKey) {
      els.glyph.replaceChildren();
      this._glyphNode = null;
      if (mode === "picture") {
        const img = el("img", "picture", { alt: "", draggable: "false" });
        img.addEventListener("error", () => {
          this._failedPictures.add(img.getAttribute("src"));
          this._glyphKey = null;
          this._scheduleUpdate();
        });
        this._glyphNode = img;
      } else if (mode === "icon") {
        this._glyphNode = el("ha-icon");
      } else if (mode === "state-icon") {
        this._glyphNode = el("ha-state-icon");
      }
      if (this._glyphNode) els.glyph.append(this._glyphNode);
      this._glyphKey = mode;
      els.iconArea.classList.toggle("has-picture", mode === "picture");
    }

    const node = this._glyphNode;
    if (!node) return;
    if (mode === "picture") {
      if (node.getAttribute("src") !== picture) node.setAttribute("src", picture);
    } else if (mode === "icon") {
      const domain = c.entity.split(".")[0];
      const typeIcon = c.variant === "info" && c.design !== "standard" ? TYPE_ICONS[mainObj?.attributes?.device_class] : null;
      const icon = iconCfg || mainObj?.attributes?.icon || typeIcon || DOMAIN_ICONS[domain] || "mdi:bookmark";
      if (node.icon !== icon) {
        node.icon = icon;
        node.setAttribute("icon", icon);
      }
    } else if (mode === "state-icon") {
      node.hass = this._hass;
      node.stateObj = mainObj;
    }
  }

  // ------------------------------------------------------------ graph

  _appendLive(stateObj) {
    if (!this._graphLoaded) return;
    const g = this._config.graph;
    const v = g.attribute ? parseNumber(stateObj.attributes?.[g.attribute]) : parseNumber(stateObj.state);
    const t = Date.parse(g.attribute ? stateObj.last_updated : stateObj.last_changed || stateObj.last_updated);
    if (!Number.isFinite(t)) return;
    this._points = appendPoint(this._points, { t, v }, Date.now() - g.hours_to_show * 3600 * 1000);
    this._scheduleGraph();
  }

  async _fetchGraph() {
    const c = this._config;
    if (!c?.graph.enabled || !this._hass || !this._connected) return;
    const g = c.graph;
    const token = ++this._graphToken;
    this._fetching = true;
    const res = await fetchHistory(this._hass, {
      entityId: g.entity,
      attribute: g.attribute,
      hours: g.hours_to_show,
      updateInterval: g.update_interval,
      resolution: `${g.max_points}:${g.aggregation}:${g.fill}`,
    });
    if (token !== this._graphToken || !this._config) return;
    this._fetching = false;

    let points = res.points;
    if (res.status === "error" && this._points.length) points = this._points; // keep previous data
    else if (this._points.length && points.length) {
      const lastT = points[points.length - 1].t;
      const newer = this._points.filter((p) => p.t > lastT);
      if (newer.length) points = points.concat(newer);
    }
    // make sure the current state is part of the series
    const current = this._hass.states?.[g.entity];
    if (current) {
      const v = g.attribute ? parseNumber(current.attributes?.[g.attribute]) : parseNumber(current.state);
      const t = Date.parse(g.attribute ? current.last_updated : current.last_changed || current.last_updated);
      const last = points[points.length - 1];
      if (Number.isFinite(t) && (!last || t > last.t)) points = points.concat([{ t, v }]);
    }
    this._points = points;
    this._graphLoaded = true;
    if (this._els) this._els.card.dataset.graphStatus = res.status;
    this._scheduleGraph();
  }

  _graphColors(data) {
    const g = this._config.graph;
    const { group, customClass, graphOverride } = this._colorState;
    const fallback = "var(--sgbc-graph-color, var(--primary-color, #03a9f4))";
    const deviceClass = this._hass?.states?.[g.entity]?.attributes?.device_class;
    const base = g.color === "auto" ? AUTO_COLORS[deviceClass] || fallback : isSafeCssValue(g.color) ? g.color : fallback;
    let color = base;
    let pointColor = null;
    let gradient = null;
    switch (g.color_mode) {
      case "fixed":
        color = base;
        break;
      case "state":
        color = resolveColor(g.colors, group, customClass) || base;
        break;
      case "thresholds":
        if (g.threshold_mode === "vertical") {
          // color by height: each threshold color from its value upwards,
          // the normal graph color below the lowest threshold
          const stops = this._ranges.graph.filter((r) => r.from !== null && r.from !== undefined).map((r) => ({ value: r.from, color: r.color }));
          return { color: base, pointColor: null, gradient: null, bands: { stops, base, smooth: g.threshold_blend === "smooth" } };
        }
        if (g.threshold_mode === "per-point") {
          const ranges = this._ranges.graph;
          pointColor = (v) => findThresholdColor(v, ranges);
        } else {
          let current = null;
          for (let i = data.length - 1; i >= 0 && current === null; i--) current = data[i].v;
          const live = this._hass?.states?.[g.entity];
          const liveValue = live ? (g.attribute ? parseNumber(live.attributes?.[g.attribute]) : parseNumber(live.state)) : null;
          color = findThresholdColor(liveValue ?? current, this._ranges.graph) || base;
        }
        break;
      case "sign":
        return {
          color: g.positive_color,
          pointColor: null,
          gradient: null,
          bands: { stops: [{ value: g.split_at, color: g.positive_color }], base: g.negative_color, smooth: false },
        };
      case "gradient":
        gradient = g.gradient;
        break;
      default:
        break;
    }
    const overridable = g.color_mode === "fixed" || g.color_mode === "state" || (g.color_mode === "thresholds" && g.threshold_mode === "current");
    if (graphOverride && overridable) color = graphOverride;
    return { color, pointColor, gradient };
  }

  // ------------------------------------------------------------ text contrast

  /** Resolve any CSS color expression (var(), color-mix(), names …) to {r,g,b,a}. */
  _toRgba(value) {
    if (!isDisplayable(value)) return null;
    const direct = parseCssColor(String(value));
    if (direct) return direct;
    const probe = this._els?.probe;
    if (!probe) return null;
    probe.style.color = "";
    probe.style.color = String(value);
    if (!probe.style.color) return null; // invalid color
    const resolved = getComputedStyle(probe).color;
    return parseCssColor(resolved) || this._canvasColor(resolved);
  }

  /** Last resort for formats like oklch()/lab(): let a canvas convert them. */
  _canvasColor(value) {
    try {
      if (!SmartGraphButtonCard._ctx) {
        const cv = document.createElement("canvas");
        cv.width = cv.height = 1;
        SmartGraphButtonCard._ctx = cv.getContext("2d", { willReadFrequently: true });
      }
      const ctx = SmartGraphButtonCard._ctx;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b, a: a / 255 };
    } catch (_err) {
      return null;
    }
  }

  /** Opaque color of the page behind the card (used when the card is translucent). */
  _pageBackground() {
    const css = getComputedStyle(this);
    for (const v of ["--primary-background-color", "--lovelace-background"]) {
      const c = this._toRgba(css.getPropertyValue(v).trim());
      if (c && c.a > 0) return composite(c, this._hass?.themes?.darkMode ? { r: 17, g: 17, b: 17 } : { r: 250, g: 250, b: 250 });
    }
    return this._hass?.themes?.darkMode ? { r: 17, g: 17, b: 17, a: 1 } : { r: 250, g: 250, b: 250, a: 1 };
  }

  /** Graph colors and the alpha with which their fill covers the text. */
  _graphFillColors() {
    const c = this._config;
    const paint = this._graphPaint;
    if (!c.graph.enabled || !paint || c.graph.position === "icon-area") return null;
    const type = c.graph.type;
    if (type === "line" || type === "stepped") return null; // thin line only – the halo handles it
    const isBar = type === "bar" || type === "column";
    const fill = isBar ? 1 : type === "line-bar" || type === "smooth-line-bar" ? Math.max(Number(c.graph.fill_opacity) || 0, 0.35) : Number(c.graph.fill_opacity ?? 0.25);
    const layer = parseFloat(getComputedStyle(this._els.graph).opacity);
    const alpha = Math.max(0, Math.min(1, fill * (Number.isFinite(layer) ? layer : 1)));
    if (alpha < 0.05) return null;
    const list = [paint.color];
    if (paint.gradient) list.push(paint.gradient.from, paint.gradient.to);
    if (paint.bands) {
      list.push(paint.bands.base);
      for (const st of paint.bands.stops || []) list.push(st.color);
    }
    if (paint.pointColor) for (const r of this._ranges.graph || []) list.push(r.color);
    const out = [];
    for (const v of list) {
      const rgba = this._toRgba(v);
      if (rgba) out.push({ ...rgba, a: (rgba.a ?? 1) * alpha });
    }
    return out.length ? out : null;
  }

  /**
   * Keep every text readable on the actual background – light theme, dark
   * theme, state backgrounds and graphs behind the text. A configured color
   * keeps its hue; only its lightness is changed when the contrast is too low.
   */
  /**
   * Panel design: a long name may run into the graph. The graph is faded
   * (mask) in the band behind the text so the name stays readable.
   */
  _panelOverlap() {
    const els = this._els;
    const graph = els?.graph;
    if (!graph?.classList.contains("inline") || typeof document === "undefined" || !document.createRange) return;
    let overlap = 0;
    let band = 0;
    try {
      const g = graph.getBoundingClientRect();
      const n = els.name.getBoundingClientRect();
      if (g.width && n.width && els.name.textContent && !els.name.classList.contains("hidden")) {
        const range = document.createRange();
        range.selectNodeContents(els.name);
        const textRight = Math.min(range.getBoundingClientRect().right, n.right);
        overlap = Math.round(Math.min(g.width, textRight - g.left + 6));
        band = Math.round(Math.min(g.height, n.bottom - g.top + 2));
      }
    } catch (_err) {
      overlap = 0;
    }
    const on = overlap > 0 && band > 0;
    graph.classList.toggle("under-text", on);
    if (on) {
      graph.style.setProperty("--sgbc-text-x", `${overlap}px`);
      graph.style.setProperty("--sgbc-text-y", `${band}px`);
    }
  }

  _checkContrast() {
    const c = this._config;
    const els = this._els;
    if (!c || !els || typeof getComputedStyle === "undefined") return;
    this._panelOverlap();
    const targets = [els.name, els.v1.wrap, els.v1.unit, els.sep, els.v2.wrap, els.v2.unit];
    if (els.hero) targets.push(els.hero.value, els.hero.caption);
    if (els.statusLabel) targets.push(els.statusLabel);
    if (c.text_contrast === "off") {
      for (const t of targets) t.style.removeProperty("color");
      els.card.classList.remove("text-halo");
      return;
    }
    try {
      // background stack under the text: page → card → state background → overlay
      let bg = this._pageBackground();
      for (const layer of [els.card, els.stateBg, els.overlay]) {
        const col = this._toRgba(getComputedStyle(layer).backgroundColor);
        if (col && col.a > 0) bg = composite(col, bg);
      }
      const graphColors = this._graphFillColors();
      const graphRect = graphColors ? this._graphTarget().getBoundingClientRect() : null;
      let halo = false;
      for (const t of targets) {
        t.style.removeProperty("color");
        if (t.classList.contains("hidden") || !t.textContent) continue;
        const cs = getComputedStyle(t);
        const fg = this._toRgba(cs.color);
        if (!fg) continue;
        // backgrounds of the element itself and its parents (e.g. the hero badge)
        let own = bg;
        let opaqueOwn = false;
        const chain = [];
        for (let n = t; n && n !== els.content; n = n.parentElement) chain.unshift(n);
        for (const n of chain) {
          const col = this._toRgba(getComputedStyle(n).backgroundColor);
          if (col && col.a > 0) {
            own = composite(col, own);
            if (col.a >= 0.95) opaqueOwn = true;
          }
        }
        const backgrounds = [own];
        if (!opaqueOwn && graphRect && graphRect.width && graphRect.height) {
          const r = t.getBoundingClientRect();
          const overlaps = r.width && r.height && r.left < graphRect.right && r.right > graphRect.left && r.top < graphRect.bottom && r.bottom > graphRect.top;
          if (overlaps) {
            halo = true;
            for (const gc of graphColors) backgrounds.push(composite(gc, own));
          }
        }
        const fixed = ensureContrast(fg, backgrounds, contrastTarget(parseFloat(cs.fontSize) || 14, cs.fontWeight));
        if (fixed) t.style.setProperty("color", rgbString(fixed));
      }
      els.card.classList.toggle("text-halo", halo);
      // light color as icon color: keep a white / very pale strip color visible on a light card
      if (this._lightIcon) {
        const fixed = ensureContrast(this._lightIcon, [bg], 1.8, 2.2);
        els.card.style.setProperty("--sgbc-icon-color", rgbString(fixed || this._lightIcon));
      }
      els.card.style.setProperty("--sgbc-halo-color", rgbString(bg));
    } catch (_err) {
      /* contrast is a nicety – never break the card */
    }
  }

  _renderGraph() {
    const c = this._config;
    if (!c || !this._els || !c.graph.enabled) return;
    const g = c.graph;
    const target = this._graphTarget();
    let { w, h } = this._graphSize;
    if ((!w || !h) && typeof ResizeObserver === "undefined") {
      w = target.clientWidth;
      h = target.clientHeight;
    }
    if (!w || !h) return;
    const now = Date.now();
    const data = reduceSeries(this._points, {
      start: now - g.hours_to_show * 3600 * 1000,
      end: now,
      buckets: g.max_points,
      aggregation: g.aggregation,
      fill: g.fill,
    });
    const { color, pointColor, gradient, bands } = this._graphColors(data);
    this._graphPaint = { color, pointColor, gradient, bands };
    const locale = getNumberLocale(this._hass);
    const svg = renderGraphSVG({
      data,
      width: w,
      height: h,
      type: g.type,
      color,
      pointColor,
      gradient,
      bands,
      baseline: g.baseline,
      headroom: g.headroom,
      min: g.min,
      max: g.max,
      lineWidth: g.line_width,
      barGap: g.bar_gap,
      barWidth: g.bar_width,
      barRadius: g.bar_radius,
      opacity: 1, // layer opacity is applied via CSS (--sgbc-graph-opacity)
      fillOpacity: g.fill_opacity,
      showPoints: g.show_points,
      showGrid: g.show_grid,
      showAxis: g.show_axis,
      showLabels: g.show_labels,
      idPrefix: this._uid,
      labelFormatter: (v) => formatNumber(v, { locale, decimals: Math.abs(v) >= 100 ? 0 : 1 }),
    });
    if (svg !== this._lastSvg) {
      target.innerHTML = svg;
      this._lastSvg = svg;
    }
  }
}

/**
 * Pure info card (e.g. temperature, humidity): same engine, info layout.
 * type: custom:smart-graph-info-card
 */
class SmartGraphInfoCard extends SmartGraphButtonCard {
  setConfig(config) {
    super.setConfig({ ...(config || {}), variant: "info" });
  }

  static getStubConfig(hass) {
    const states = hass?.states || {};
    const ids = Object.keys(states);
    const byClass = (dc) => ids.find((id) => id.startsWith("sensor.") && states[id]?.attributes?.device_class === dc);
    const entity = byClass("temperature") || byClass("humidity") || ids.find((id) => id.startsWith("sensor.")) || "sensor.example";
    return { entity };
  }
}

if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, SmartGraphButtonCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: CARD_TAG,
    name: "Smart Graph Button Card",
    description: "Kompakte Button-Karte mit Symbol, Name, zwei Werten und integriertem Verlaufsgraphen – ohne Abhängigkeiten.",
    preview: true,
    documentationURL: "https://github.com/rest2178/smart-graph-button-card",
  });
  customElements.define(INFO_CARD_TAG, SmartGraphInfoCard);
  window.customCards.push({
    type: INFO_CARD_TAG,
    name: "Smart Graph Info Card",
    description: "Reine Info-Karte für Messwerte wie Temperatur oder Luftfeuchtigkeit: Symbol, Name, großer Wert und Verlaufsgraph.",
    preview: true,
    documentationURL: "https://github.com/rest2178/smart-graph-button-card",
  });
  registerOverviewCard();
  registerMediaCard();
  registerWeatherBadge();
  // eslint-disable-next-line no-console
  console.info(`%c SMART-GRAPH-BUTTON-CARD %c v${CARD_VERSION} `, "color:#fff;background:#0ea5e9;font-weight:700;border-radius:3px 0 0 3px", "color:#0ea5e9;background:#e0f2fe;border-radius:0 3px 3px 0");
}
return { CARD_TAG, INFO_CARD_TAG, CARD_VERSION, SmartGraphButtonCard, SmartGraphInfoCard };
})();
