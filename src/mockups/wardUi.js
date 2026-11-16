// Mockups of the 0.4 displays, drawn on the 480×270 UI layer: the camcorder's
// own display (it takes over from the sanity pulse once the camcorder is
// found) and a use prompt. Copy here is mockup text, not game text.
import { osdText, COLORS, UI_FONT } from '../ui/osd.js';
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
  // As built (0.2.71): date, time and pulse lifted clear of the subtitles, the flash state at the top.
  osdText(ctx, 'OCT. 30 19--', W - EDGE - 10, H - EDGE - 62, 10, COLORS.text, 'right');
  osdText(ctx, 'AM  2:41', W - EDGE - 10, H - EDGE - 49, 10, COLORS.text, 'right');
  osdText(ctx, 'FLASH READY', W / 2, EDGE + 10, 9, COLORS.osdValue, 'center');
  const state = sanityState(62);
  drawPulseGlyph(ctx, EDGE + 10, H - EDGE - 60, state, 1.7);
  osdText(ctx, 'uneasy', EDGE + 80, H - EDGE - 58, 8, '#c9d2e0');
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

// Proposal: the fuse board close up (E at the board), like the code locks.
// Six sockets with their circuit cards; a fuse in two of them, the cursor on
// a third; a lamp by each socket shows a live circuit, or dark red where Sister
// M. has put that room's lamps out (owner pick). Fuses in hand on the right.
const CIRCUITS = ['WARD A', 'CHILDREN\'S WARD', 'DISPENSARY', 'CORRIDOR', 'STAIRS', 'UPSTAIRS'];

// Dark print on a cream card: plain, with no glow behind it, so it stays sharp.
function card(ctx, text, x, y) {
  ctx.font = `bold 9px ${UI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#14100c';
  ctx.fillText(text, x, y);
}

function socket(ctx, x, y, label, { fuse, selected, snuffed }) {
  ctx.fillStyle = '#d6d2c4'; // porcelain
  ctx.fillRect(x, y, 46, 40);
  ctx.fillStyle = '#b8b4a6';
  ctx.fillRect(x, y + 36, 46, 4);
  if (fuse) {
    ctx.fillStyle = '#efece0';
    ctx.fillRect(x + 13, y + 6, 20, 26);
    ctx.fillStyle = '#b8923a'; // its brass cap
    ctx.fillRect(x + 17, y + 12, 12, 12);
  } else {
    ctx.fillStyle = '#141414';
    ctx.fillRect(x + 14, y + 8, 18, 22);
    ctx.fillStyle = '#6a5a2a'; // contacts down in the socket
    ctx.fillRect(x + 16, y + 10, 3, 18);
    ctx.fillRect(x + 27, y + 10, 3, 18);
  }
  ctx.fillStyle = snuffed ? '#8a1c14' : fuse ? '#ffb040' : '#3a2a14'; // the circuit's lamp: live, dark, or red where she put the lamps out
  ctx.fillRect(x + 52, y + 14, 8, 8);
  ctx.fillStyle = '#d8d0b0'; // the card
  ctx.fillRect(x - 12, y + 46, 84, 13);
  card(ctx, label, x + 30, y + 49);
  if (selected) {
    ctx.strokeStyle = COLORS.osdValue;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 5, y - 5, 56, 50);
  }
}

export function fuseBoardClose(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, 480, 270);
  ctx.fillStyle = '#4a3524'; // the wooden frame
  ctx.fillRect(48, 30, 322, 196);
  ctx.fillStyle = '#33363a'; // the slate
  ctx.fillRect(54, 36, 310, 184);
  ctx.fillStyle = '#d8d0b0';
  ctx.fillRect(150, 42, 118, 14);
  card(ctx, 'WEST WING  LIGHTING', 209, 45);
  CIRCUITS.forEach((label, i) => {
    socket(ctx, 86 + (i % 3) * 100, i < 3 ? 70 : 146, label, { fuse: i === 0 || i === 2, selected: i === 4, snuffed: i === 0 });
  });
  osdText(ctx, 'IN HAND', 426, 84, 8, COLORS.dim, 'center');
  osdText(ctx, '0', 426, 98, 16, COLORS.osdValue, 'center');
  osdText(ctx, 'FUSES', 426, 122, 8, COLORS.dim, 'center');
  osdText(ctx, '◀ ▶ ▲ ▼ choose  ·  CLICK put in / pull out  ·  ESC step back', 240, 248, 8, COLORS.dim, 'center');
}

// Proposal: Nora's tape on the day room television (B2). The view fills with
// the set's screen: a dark rounded bezel, her camcorder's own overlay on the
// footage, a VCR counter in the corner, her words as subtitles.
export function tapePlayback(ctx, { line = '(Nora, on tape) Tape two. Ward A. Every lamp is on. Somebody keeps them on.' } = {}) {
  const inner = { x: 70, y: 22, w: 340, h: 212 };
  ctx.fillStyle = '#0c0c0e';
  ctx.fillRect(0, 0, W, inner.y);
  ctx.fillRect(0, inner.y + inner.h, W, H - inner.y - inner.h);
  ctx.fillRect(0, 0, inner.x, H);
  ctx.fillRect(inner.x + inner.w, 0, W - inner.x - inner.w, H);
  ctx.strokeStyle = '#2a2a2e'; // the tube's curved edge
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect?.(inner.x - 4, inner.y - 4, inner.w + 8, inner.h + 8, 22);
  ctx.stroke();
  ctx.fillStyle = '#3a2a1c'; // the wooden cabinet under it, its knobs
  ctx.fillRect(inner.x - 30, inner.y + inner.h + 14, inner.w + 60, 20);
  ctx.fillStyle = '#b8b0a0';
  ctx.fillRect(inner.x + inner.w - 20, inner.y + inner.h + 19, 8, 8);
  ctx.fillRect(inner.x + inner.w - 6, inner.y + inner.h + 19, 8, 8);
  osdText(ctx, '● REC', inner.x + 12, inner.y + 10, 9, COLORS.red);
  osdText(ctx, 'NIGHT', inner.x + 12, inner.y + 22, 8, '#9dffb0');
  osdText(ctx, 'PLAY ▶  0:00:07', W - 12, 6, 9, COLORS.text, 'right');
  osdText(ctx, 'ESC / CLICK  stop the tape', W - 12, H - 14, 8, COLORS.dim, 'right');
  const words = line;
  ctx.font = 'bold 10px monospace';
  const width = Math.min(330, ctx.measureText(words).width + 16);
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(W / 2 - width / 2, inner.y + inner.h - 34, width, 28);
  const half = words.length > 48 ? words.lastIndexOf(' ', 48) : words.length;
  osdText(ctx, words.slice(0, half), W / 2, inner.y + inner.h - 31, 10, '#e8f0ff', 'center');
  if (half < words.length) osdText(ctx, words.slice(half + 1), W / 2, inner.y + inner.h - 19, 10, '#e8f0ff', 'center');
}
