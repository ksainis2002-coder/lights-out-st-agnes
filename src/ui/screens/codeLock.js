// Records lock close-up (approved still ui_codeLock): the headmaster's records
// cabinet drawer up close, three brass number wheels in its lock plate. ▲▼
// or the mouse wheel turn the chosen wheel (up counts up), ◀▶ choose a wheel,
// 0–9 set it and move on to the next; a click on the top or bottom half of a
// wheel chooses and turns it. CLICK the drawer (or ENTER) tries it; a wrong
// try shakes it, with its line above. ESC or a click outside steps back. The
// puzzle (puzzles/recordsLock.js) passes wheels, turn, set, tryDrawer, note.
import { osdText, fittedSize, COLORS } from '../osd.js';

const W = 480;
const H = 270;
const DRAWER = { x: 110, y: 50, w: 260, h: 170 };
const WHEEL = { x: 189, y: 115, w: 30, h: 58, step: 36 };
const SHAKE_FOR = 320; // ms a wrong try shakes the drawer

function triangle(ctx, x, y, size, up) {
  ctx.beginPath();
  ctx.moveTo(x - size, up ? y + size : y - size);
  ctx.lineTo(x + size, up ? y + size : y - size);
  ctx.lineTo(x, up ? y - size * 0.4 : y + size * 0.4);
  ctx.closePath();
  ctx.fill();
}

// One wheel: its digit in the window, the neighbours fading above and below
// (rolling it up brings the one below into the window).
function drawWheel(ctx, x, y, digit, chosen) {
  ctx.fillStyle = '#2a2214';
  ctx.fillRect(x, y, WHEEL.w, WHEEL.h);
  ctx.fillStyle = chosen ? '#e8d8a0' : '#c8b478';
  ctx.fillRect(x + 3, y + 3, 24, 52);
  ctx.fillStyle = 'rgba(40,30,10,0.35)'; // the curve of the wheel
  ctx.fillRect(x + 3, y + 3, 24, 10);
  ctx.fillRect(x + 3, y + 45, 24, 10);
  osdText(ctx, String((digit + 9) % 10), x + 15, y + 3, 9, 'rgba(60,44,16,0.5)', 'center');
  osdText(ctx, String(digit), x + 15, y + 20, 16, '#2a1e0c', 'center');
  osdText(ctx, String((digit + 1) % 10), x + 15, y + 44, 9, 'rgba(60,44,16,0.5)', 'center');
  if (!chosen) return;
  ctx.strokeStyle = '#ffe27a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 2, y - 2, WHEEL.w + 4, WHEEL.h + 4);
  ctx.fillStyle = '#ffe27a';
  triangle(ctx, x + 15, y - 9, 5, true);
  triangle(ctx, x + 15, y + WHEEL.h + 9, 5, false);
}

function drawDrawer(ctx, t, dx) {
  const { x, y, w, h } = DRAWER;
  ctx.fillStyle = '#4a4e4a';
  ctx.fillRect(x + dx, y, w, h);
  ctx.fillStyle = '#5e625c';
  ctx.fillRect(x + dx + 6, y + 6, w - 12, h - 12);
  ctx.fillStyle = '#d8d0b4'; // the card in the label holder
  ctx.fillRect(196 + dx, 66, 88, 20);
  ctx.strokeStyle = '#8a8a80';
  ctx.lineWidth = 1;
  ctx.strokeRect(195.5 + dx, 65.5, 89, 21);
  const label = t('codeLock.label');
  osdText(ctx, label, 240 + dx, 71, fittedSize(ctx, label, 9, 82), '#3a3020', 'center');
  ctx.fillStyle = '#8a6a2a'; // the brass lock plate
  ctx.fillRect(176 + dx, 100, 128, 88);
  ctx.fillStyle = '#a88a3a';
  ctx.fillRect(180 + dx, 104, 120, 80);
  ctx.fillStyle = '#3a3a36'; // the handle under the lock
  ctx.fillRect(208 + dx, 196, 64, 8);
}

export function createCodeLockScreen(ui, { wheels, turn, set, tryDrawer, note }) {
  const { t } = ui;
  const openedAt = performance.now();
  let chosen = 0;
  let shakeAt = -Infinity;
  const count = () => wheels().length;
  const wheelX = (i) => WHEEL.x + i * WHEEL.step;

  function attempt() {
    tryDrawer();
    if (note()) shakeAt = performance.now();
  }

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    const since = performance.now() - shakeAt;
    const dx = since < SHAKE_FOR ? Math.round(Math.sin(since / 18) * 3) : 0;
    drawDrawer(ctx, t, dx);
    wheels().forEach((digit, i) => drawWheel(ctx, wheelX(i) + dx, WHEEL.y, digit, i === chosen));
    const line = note();
    if (line) osdText(ctx, t(line), W / 2, 26, fittedSize(ctx, t(line), 10, 440), COLORS.soft, 'center');
    osdText(ctx, t('codeLock.footer'), W / 2, H - 22, fittedSize(ctx, t('codeLock.footer'), 8, 460), COLORS.dim, 'center');
  }

  const turnWheel = (i, step) => () => {
    chosen = i;
    turn(i, step);
  };

  // A wheel's top half turns it up, its bottom half down; the drawer tries
  // the lock; anywhere else steps back.
  function hits() {
    const halves = wheels().flatMap((_, i) => [
      { x: wheelX(i), y: WHEEL.y - 14, w: WHEEL.w, h: WHEEL.h / 2 + 14, click: turnWheel(i, 1) },
      { x: wheelX(i), y: WHEEL.y + WHEEL.h / 2, w: WHEEL.w, h: WHEEL.h / 2 + 14, click: turnWheel(i, -1) },
    ]);
    const drawer = { ...DRAWER, click: attempt };
    const outside = { x: 0, y: 0, w: W, h: H, click: () => performance.now() - openedAt > 400 && ui.resume() };
    return [...halves, drawer, outside];
  }

  function key(code) {
    const digit = /^(?:Digit|Numpad)([0-9])$/.exec(code);
    if (digit) {
      set(chosen, Number(digit[1]));
      chosen = Math.min(count() - 1, chosen + 1);
    } else if (code === 'ArrowUp') turn(chosen, 1);
    else if (code === 'ArrowDown') turn(chosen, -1);
    else if (code === 'ArrowLeft') chosen = (chosen + count() - 1) % count();
    else if (code === 'ArrowRight') chosen = (chosen + 1) % count();
    else if (code === 'Enter' || code === 'NumpadEnter') attempt();
    else if (code === 'Escape') ui.resume();
    else return false;
    return true;
  }

  // Scrolling up turns the chosen wheel up, like the ▲ key.
  const wheel = (direction) => turn(chosen, -direction);

  return { name: 'codeLock', look: 'game', draw, hits, key, wheel, wheels, note, chosen: () => chosen };
}
