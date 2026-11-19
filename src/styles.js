/**
 * Card styles. Layer order (z-index):
 *   0  base background (ha-card background)
 *   1/2 state background / graph (swappable via layers.graph_above_state_background)
 *   3  readability overlay
 *   4  content (icon, name, values)
 *   5  focus / hover / pressed effects
 */
export const CARD_STYLES = `
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
