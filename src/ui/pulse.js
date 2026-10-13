// Sanity pulse (approved still ui_sanityPulse): a heart and a heartbeat trace
// in the lower left with four pips for how much of the mind is left, and the
// state in words. Pale and slow when calm, amber, then red and fast. Always
// on while playing (owner pick), until the camcorder's own display (0.4).
// Steady, never blinking (flicker rules); the trace only scrolls.
import { osdText } from './osd.js';
import { feeling } from '../sanity/meter.js';

const STATES = {
  calm: { pips: 4, color: '#c9d2e0', beat: 1.1 },
  uneasy: { pips: 3, color: '#e8d9a0', beat: 0.85 },
  shaking: { pips: 2, color: '#ffb860', beat: 0.6 },
  fallingApart: { pips: 1, color: '#ff6a5a', beat: 0.4 },
};
const HEART = [[1, 0], [2, 0], [4, 0], [5, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [2, 4], [3, 4], [4, 4], [3, 5]];
const TRACE = 46; // px of trace after the heart
const SPIKE = [[0, 0], [3, -6], [6, 6], [9, -2], [12, 0]];
const SCROLL = 30; // px per second

export function sanityState(value) {
  return { name: feeling(value), ...STATES[feeling(value)] };
}

// The glyph alone (also drawn on the "your mind" card).
export function drawPulseGlyph(ctx, x, y, state, time) {
  ctx.fillStyle = state.color;
  HEART.forEach(([px, py]) => ctx.fillRect(x + px * 2, y + py * 2, 2, 2));
  const base = y + 6;
  const period = state.beat * SCROLL; // px between beats
  const offset = (time * SCROLL) % period;
  ctx.strokeStyle = state.color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 18, base);
  for (let start = -offset; start < TRACE; start += period) {
    for (const [dx, dy] of SPIKE) {
      const px = start + dx;
      if (px >= 0 && px <= TRACE) ctx.lineTo(x + 18 + px, base + dy);
    }
  }
  ctx.lineTo(x + 18 + TRACE, base);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i < state.pips ? state.color : 'rgba(232,240,255,0.18)';
    ctx.fillRect(x + 18 + i * 12, y + 14, 9, 3);
  }
}

export function drawPulse(ctx, game, H) {
  if (!game.session.active || game.inventory.isOpen() || game.progress.hasFlag('tool_camcorder')) return false;
  const state = sanityState(game.sanity.value());
  drawPulseGlyph(ctx, 14, H - 32, state, game.time);
  osdText(ctx, game.i18n.t(`pulse.${state.name}`), 84, H - 30, 8, '#c9d2e0');
  return true;
}
