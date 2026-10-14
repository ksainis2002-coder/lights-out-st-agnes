// Dev-only mockups of the 0.3 in-game screens, drawn on the 480×270 UI layer.
// Copy here is mockup text, not game text.
import { osdText, COLORS } from '../ui/osd.js';
import { PIANO_STICKERS, drawSticker } from '../props/music.js';

const W = 480;
const H = 270;

function triangle(ctx, x, y, size, up) {
  ctx.beginPath();
  ctx.moveTo(x - size, up ? y + size : y - size);
  ctx.lineTo(x + size, up ? y + size : y - size);
  ctx.lineTo(x, up ? y - size * 0.4 : y + size * 0.4);
  ctx.closePath();
  ctx.fill();
}

// One brass number wheel: the digit in the window, its neighbours fading above and below.
function wheel(ctx, x, y, digit, selected) {
  ctx.fillStyle = '#2a2214';
  ctx.fillRect(x, y, 30, 58);
  ctx.fillStyle = selected ? '#e8d8a0' : '#c8b478';
  ctx.fillRect(x + 3, y + 3, 24, 52);
  ctx.fillStyle = 'rgba(40,30,10,0.35)'; // the curve of the wheel
  ctx.fillRect(x + 3, y + 3, 24, 10);
  ctx.fillRect(x + 3, y + 45, 24, 10);
  osdText(ctx, String((digit + 9) % 10), x + 15, y + 3, 9, 'rgba(60,44,16,0.5)', 'center');
  osdText(ctx, String(digit), x + 15, y + 20, 16, '#2a1e0c', 'center');
  osdText(ctx, String((digit + 1) % 10), x + 15, y + 44, 9, 'rgba(60,44,16,0.5)', 'center');
  if (!selected) return;
  ctx.strokeStyle = '#ffe27a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 2, y - 2, 34, 62);
  ctx.fillStyle = '#ffe27a';
  triangle(ctx, x + 15, y - 9, 5, true);
  triangle(ctx, x + 15, y + 67, 5, false);
}

// Proposal: the records cabinet's three-wheel lock, brought up close like the
// music box. Turn a wheel with the mouse wheel or ▲▼ (or click above/below it),
// ◀▶ picks the wheel, CLICK tries the drawer, ESC steps back.
export function codeLock(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#4a4e4a';
  ctx.fillRect(110, 50, 260, 170); // the drawer front
  ctx.fillStyle = '#5e625c';
  ctx.fillRect(116, 56, 248, 158);
  ctx.fillStyle = '#d8d0b4'; // card in the label holder
  ctx.fillRect(196, 66, 88, 20);
  ctx.strokeStyle = '#8a8a80';
  ctx.strokeRect(195.5, 65.5, 89, 21);
  osdText(ctx, 'RECORDS  A–Z', 240, 71, 9, '#3a3020', 'center');
  ctx.fillStyle = '#8a6a2a';
  ctx.fillRect(176, 100, 128, 88); // brass lock plate
  ctx.fillStyle = '#a8883a';
  ctx.fillRect(180, 104, 120, 80);
  [3, 5, 0].forEach((digit, i) => wheel(ctx, 189 + i * 36, 115, digit, i === 1));
  ctx.fillStyle = '#3a3a36'; // the drawer handle under the lock
  ctx.fillRect(208, 196, 64, 8);
  osdText(ctx, '▲ ▼ / WHEEL turn  ·  ◀ ▶ next wheel  ·  CLICK open  ·  ESC step back', W / 2, H - 22, 8, COLORS.dim, 'center');
}

// Twelve keys across the screen: A3 and B3 dimmed on the left, the eight keys
// you play (1–8, middle C to C), D5–E5 dimmed on the right.
const KEY_W = 34;
const KEYS_X = 36;
const BLACK_AFTER = [0, 2, 3, 5, 6, 7, 9, 10]; // a black key between this key and the next

// Proposal: the piano close-up, like the music box. Maggie's stickers sit on
// keys 1–6; the notes played so far show above (here blue, blue, yellow).
// shapes: every sticker also has its own shape, for colour-blind players.
export function pianoClose(ctx, { shapes = false } = {}) {
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2a160e'; // the case above the keys
  ctx.fillRect(KEYS_X - 8, 58, KEY_W * 12 + 16, 66);
  ctx.fillStyle = '#3a2016';
  ctx.fillRect(KEYS_X - 8, 112, KEY_W * 12 + 16, 10); // the fallboard
  for (let i = 0; i < 12; i++) {
    const x = KEYS_X + i * KEY_W;
    ctx.fillStyle = i === 4 ? '#f4ecd8' : '#d8d0b8';
    ctx.fillRect(x + 1, 122, KEY_W - 2, 106);
    const key = i - 1; // keys 1–8 are positions 2–9
    if (key >= 1 && key <= 6) drawSticker(ctx, PIANO_STICKERS[key - 1], x + KEY_W / 2, 210, shapes ? 8 : 7, shapes);
    if (key >= 1 && key <= 8) osdText(ctx, String(key), x + KEY_W / 2, 233, 8, COLORS.dim, 'center');
  }
  ctx.fillStyle = '#141010';
  BLACK_AFTER.forEach((i) => ctx.fillRect(KEYS_X + (i + 1) * KEY_W - 10, 122, 20, 62));
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; // the keys either side are not played
  ctx.fillRect(KEYS_X, 122, KEY_W * 2, 106);
  ctx.fillRect(KEYS_X + KEY_W * 10, 122, KEY_W * 2, 106);
  [4, 4, 2].forEach((sticker, i) => drawSticker(ctx, PIANO_STICKERS[sticker], W / 2 - 22 + i * 22, 36, shapes ? 8 : 7, shapes));
  osdText(ctx, 'CLICK a key  ·  1–8  ·  ESC step back', W / 2, H - 22, 8, COLORS.dim, 'center');
}
