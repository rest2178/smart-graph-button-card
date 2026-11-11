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

.probe { display: none; }
/* readable text over a graph: soft halo in the card background color */
ha-card.sgbc.text-halo .name,
ha-card.sgbc.text-halo .values {
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
