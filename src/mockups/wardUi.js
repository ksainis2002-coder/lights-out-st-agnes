// Mockups of the 0.4 displays, drawn on the 480×270 UI layer: the camcorder's
// own display (it takes over from the sanity pulse once the camcorder is
// found) and a use prompt. Copy here is mockup text, not game text.
import { osdText, COLORS } from '../ui/osd.js';
import { drawPulseGlyph, sanityState } from '../ui/pulse.js';

const W = 480;
const H = 270;
const EDGE = 26; // the viewfinder marks sit this far in

function corners(ctx) {
  ctx.strokeStyle = 'rgba(232,240,255,0.85)';
  ctx.lineWidth = 2;
  [[EDGE, EDGE, 1, 1], [W - EDGE, EDGE, -1, 1], [EDGE, H - EDGE, 1, -1], [W - EDGE, H - EDGE, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x + sx * 20, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * 20);
    ctx.stroke();
  });
  ctx.fillStyle = 'rgba(232,240,255,0.7)'; // the centre mark
  ctx.fillRect(W / 2 - 5, H / 2, 11, 1);
  ctx.fillRect(W / 2, H / 2 - 5, 1, 11);
}

function battery(ctx, x, y, bars) {
  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, 30, 11);
  ctx.fillStyle = COLORS.text;
  ctx.fillRect(x + 31, y + 3, 3, 6);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < bars ? COLORS.text : 'rgba(232,240,255,0.2)';
    ctx.fillRect(x + 3 + i * 9, y + 3, 7, 6);
  }
}

// The camcorder held up: REC, tape counter, battery, the time stamp, the
// flash's charge, and the pulse in its corner.
export function camcorder(ctx, { night = true } = {}) {
  corners(ctx);
  ctx.fillStyle = COLORS.red;
  ctx.beginPath();
  ctx.arc(EDGE + 14, EDGE + 16, 4, 0, Math.PI * 2);
  ctx.fill();
  osdText(ctx, 'REC', EDGE + 24, EDGE + 10, 12);
  if (night) osdText(ctx, 'NIGHT', EDGE + 10, EDGE + 28, 9, '#9dffb0');
  osdText(ctx, 'SP 0:12:47', W - EDGE - 10, EDGE + 10, 12, COLORS.text, 'right');
  battery(ctx, W - EDGE - 44, EDGE + 29, 2);
  osdText(ctx, 'OCT. 30 19--', W - EDGE - 10, H - EDGE - 36, 10, COLORS.text, 'right');
  osdText(ctx, 'AM  2:41', W - EDGE - 10, H - EDGE - 23, 10, COLORS.text, 'right');
  osdText(ctx, 'FLASH READY', W / 2, H - EDGE - 23, 9, COLORS.osdValue, 'center');
  const state = sanityState(62);
  drawPulseGlyph(ctx, EDGE + 10, H - EDGE - 34, state, 1.7);
  osdText(ctx, 'uneasy', EDGE + 80, H - EDGE - 32, 8, '#c9d2e0');
}

// A use prompt as the game draws it: centre dot and one line.
export function usePrompt(ctx, text) {
  ctx.fillStyle = 'rgba(232,240,255,0.8)';
  ctx.fillRect(W / 2 - 1, H / 2 - 1, 2, 2);
  ctx.font = 'bold 10px monospace';
  const width = ctx.measureText(text).width + 16;
  ctx.fillStyle = 'rgba(5,7,10,0.55)';
  ctx.fillRect(W / 2 - width / 2, H / 2 + 22, width, 16);
  ctx.strokeStyle = 'rgba(232,240,255,0.35)';
  ctx.strokeRect(W / 2 - width / 2 + 0.5, H / 2 + 22.5, width - 1, 15);
  osdText(ctx, text, W / 2, H / 2 + 25, 10, COLORS.text, 'center');
}
