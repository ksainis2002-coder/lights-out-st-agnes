// Fuse box close-up (owner request 2026-10-14, approved still ui_fuseBox):
// opening the sick-bay fuse box brings it up in front of you, like the music
// box. Click a lever, or press 1–4, to pull it; pulled levers stay down. A
// line under the box says why a lever would not move, or that they all
// snapped back. ESC or a click outside steps back. The puzzle
// (puzzles/fuses.js) passes pull, pulled and note.
import { osdText, fittedSize, COLORS } from '../osd.js';

const W = 480;
const H = 270;
const LEVER = { x: 174, step: 36, w: 24, plate: 74, top: 104, slot: 96, handle: 28 };

// The grey steel box and its warning sign: a bolt in a triangle, no words.
function drawBox(ctx) {
  ctx.fillStyle = '#4a4e48';
  ctx.fillRect(150, 30, 180, 196);
  ctx.fillStyle = '#8a8e88';
  ctx.fillRect(156, 36, 168, 184);
  ctx.fillStyle = '#d8b030';
  ctx.beginPath();
  ctx.moveTo(240, 42);
  ctx.lineTo(254, 64);
  ctx.lineTo(226, 64);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(239, 48, 3, 8);
  ctx.fillRect(237, 56, 3, 5);
}

function drawLever(ctx, number, down) {
  const x = LEVER.x + (number - 1) * LEVER.step;
  ctx.fillStyle = '#1c1c1e';
  ctx.fillRect(x, LEVER.plate, LEVER.w, 20);
  osdText(ctx, String(number), x + LEVER.w / 2, LEVER.plate + 4, 12, '#d8d4c8', 'center');
  ctx.fillStyle = '#26262a';
  ctx.fillRect(x + 8, LEVER.top, 8, LEVER.slot);
  const y = down ? LEVER.top + LEVER.slot - LEVER.handle : LEVER.top;
  ctx.fillStyle = '#a03028';
  ctx.fillRect(x + 2, y, 20, LEVER.handle);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 2, y, 20, 4);
}

export function createFuseBoxScreen(ui, { pull, pulled, note }) {
  const { t } = ui;
  const openedAt = performance.now(); // the click that opened it must not pull a lever

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    drawBox(ctx);
    const down = pulled();
    [1, 2, 3, 4].forEach((number) => drawLever(ctx, number, down.includes(number)));
    const line = note();
    if (line) osdText(ctx, t(line), W / 2, 232, fittedSize(ctx, t(line), 9, 440), COLORS.soft, 'center');
    osdText(ctx, t('fuseBox.footer'), W / 2, H - 22, 8, COLORS.dim, 'center');
  }

  function hits() {
    const levers = [1, 2, 3, 4].map((number) => ({
      x: LEVER.x + (number - 1) * LEVER.step,
      y: LEVER.plate,
      w: LEVER.w,
      h: LEVER.top + LEVER.slot - LEVER.plate,
      click: () => pull(number),
    }));
    const outside = { x: 0, y: 0, w: W, h: H, click: () => performance.now() - openedAt > 400 && ui.resume() };
    return [...levers, outside];
  }

  function key(code) {
    const digit = /^Digit([1-4])$/.exec(code);
    if (digit) pull(Number(digit[1]));
    else if (code === 'Escape') ui.resume();
    else return false;
    return true;
  }

  // pulled and note are read by tests.
  return { name: 'fuseBox', look: 'game', draw, hits, key, pulled, note };
}
