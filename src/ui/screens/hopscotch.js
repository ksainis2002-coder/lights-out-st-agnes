// Hopscotch close-up (approved still ui_hopscotch): the gym's chalked grid
// seen from above, 1 to 9 and home. Click a square or press 1–9 to hop;
// the squares hopped so far are shaded and listed at the top. A line under
// the grid says what just happened (the rope slaps on a wrong square). ESC
// or a click outside steps back. The puzzle (puzzles/hopscotch.js) passes
// hop/hopped/note.
import { osdText, fittedSize, COLORS } from '../osd.js';

const W = 480;
const H = 270;
const SERIF = 'Georgia, "DejaVu Serif", serif';
const CHALK = 'rgba(236,236,226,0.92)';
const S = 34;
const MIDDLE = 111;
const COLUMNS = [[1], [2], [3], [4, 5], [6], [7, 8], [9]];

// Every square's box on screen, left to right.
function squares() {
  const list = [];
  let x = 104;
  for (const column of COLUMNS) {
    column.forEach((n, j) => list.push({ n, x, y: column.length === 1 ? MIDDLE - S / 2 : MIDDLE - S + j * S }));
    x += S;
  }
  return { list, home: x };
}
const GRID = squares();

export function createHopscotchScreen(ui, { hop, hopped, note }) {
  const { t } = ui;
  const openedAt = performance.now();

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#4a3624'; // the gym floor
    ctx.fillRect(56, 36, 368, 150);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = 46; y < 186; y += 14) ctx.fillRect(56, y, 368, 1);
    const done = hopped();
    ctx.strokeStyle = CHALK;
    ctx.lineWidth = 2.5;
    ctx.font = `bold 17px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const square of GRID.list) {
      if (done.includes(square.n)) {
        ctx.fillStyle = 'rgba(236,236,226,0.22)';
        ctx.fillRect(square.x, square.y, S, S);
      }
      ctx.strokeRect(square.x + 0.5, square.y + 0.5, S, S);
      ctx.fillStyle = CHALK;
      ctx.fillText(String(square.n), square.x + S / 2, square.y + S / 2 + 6);
    }
    ctx.beginPath(); // 10, home
    ctx.arc(GRID.home, MIDDLE, S, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.font = `bold 15px ${SERIF}`;
    ctx.fillText('10', GRID.home + 15, MIDDLE + 6);
    if (done.length) osdText(ctx, done.join('  ·  '), W / 2, 14, 12, '#e8e8dc', 'center');
    const line = note();
    if (line) osdText(ctx, t(line), W / 2, 214, fittedSize(ctx, t(line), 9, 440), COLORS.soft, 'center');
    osdText(ctx, t('hopscotch.footer'), W / 2, H - 22, 8, COLORS.dim, 'center');
  }

  function hits() {
    const list = GRID.list.map((square) => ({ x: square.x, y: square.y, w: S, h: S, click: () => hop(square.n) }));
    const outside = { x: 0, y: 0, w: W, h: H, click: () => performance.now() - openedAt > 400 && ui.resume() };
    return [...list, outside];
  }

  function key(code) {
    const digit = /^Digit([1-9])$/.exec(code);
    if (digit) hop(Number(digit[1]));
    else if (code === 'Escape') ui.resume();
    else return false;
    return true;
  }

  return { name: 'hopscotch', look: 'game', draw, hits, key, hopped, note };
}
