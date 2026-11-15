// The fuse board close up (approved still ui_fuseBoard): a slate panel, six
// porcelain sockets with their circuit cards, a lamp beside each: amber for a
// live circuit, dark red where Sister M. has put that room's lamps out, dark
// for no fuse. Fuses in hand on the right. ◀▶▲▼ choose a socket; CLICK or
// ENTER puts a fuse in or pulls it out; a click on a socket does both. ESC or
// a click outside steps back. The puzzle (puzzles/wardFuses.js) passes
// circuits, state, inHand, toggle, note.
import { osdText, fittedSize, COLORS, UI_FONT } from '../osd.js';

const W = 480;
const H = 270;
const BOARD = { x: 48, y: 30, w: 322, h: 196 };
const LAMP = { empty: '#3a2a14', live: '#ffb040', out: '#8a1c14' };
const socketAt = (i) => ({ x: 86 + (i % 3) * 100, y: i < 3 ? 70 : 146 });

// Dark print on a cream card: plain, with no glow behind it, so it stays sharp.
function card(ctx, text, x, y, width) {
  let size = 9;
  ctx.font = `bold ${size}px ${UI_FONT}`;
  while (size > 6 && ctx.measureText(text).width > width) ctx.font = `bold ${(size -= 1)}px ${UI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#14100c';
  ctx.fillText(text, x, y);
}

function drawSocket(ctx, { x, y }, label, state, chosen, large) {
  ctx.fillStyle = '#d6d2c4'; // porcelain
  ctx.fillRect(x, y, 46, 40);
  if (large) {
    ctx.fillStyle = '#8a1c14'; // a red band: the heavy fuse goes here
    ctx.fillRect(x, y, 46, 4);
  }
  ctx.fillStyle = '#b8b4a6';
  ctx.fillRect(x, y + 36, 46, 4);
  if (state === 'empty') {
    ctx.fillStyle = '#141414';
    ctx.fillRect(x + (large ? 9 : 14), y + 8, large ? 28 : 18, 22);
    ctx.fillStyle = '#6a5a2a'; // contacts down in the socket
    ctx.fillRect(x + 16, y + 10, 3, 18);
    ctx.fillRect(x + 27, y + 10, 3, 18);
  } else {
    ctx.fillStyle = '#efece0';
    ctx.fillRect(x + (large ? 8 : 13), y + 6, large ? 30 : 20, 26);
    ctx.fillStyle = '#b8923a'; // the fuse's brass cap
    ctx.fillRect(x + 17, y + 12, 12, 12);
  }
  ctx.fillStyle = LAMP[state];
  ctx.fillRect(x + 52, y + 14, 8, 8);
  ctx.fillStyle = '#d8d0b0';
  ctx.fillRect(x - 14, y + 46, 88, 13);
  card(ctx, label, x + 30, y + 49, 84);
  if (!chosen) return;
  ctx.strokeStyle = COLORS.osdValue;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 5, y - 5, 56, 50);
}

export function createWardFusesScreen(ui, { circuits, large, state, inHand, toggle, note }) {
  const { t } = ui;
  const openedAt = performance.now();
  let chosen = 0;

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#4a3524'; // the wooden frame
    ctx.fillRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h);
    ctx.fillStyle = '#33363a'; // the slate
    ctx.fillRect(BOARD.x + 6, BOARD.y + 6, BOARD.w - 12, BOARD.h - 12);
    ctx.fillStyle = '#d8d0b0';
    ctx.fillRect(134, 42, 150, 14);
    card(ctx, t('fuse.title'), 209, 45, 146);
    circuits.forEach((circuit, i) => drawSocket(ctx, socketAt(i), t(`fuse.circuit.${circuit}`), state(i), i === chosen, large.includes(circuit)));
    osdText(ctx, t('fuse.inHand'), 426, 84, fittedSize(ctx, t('fuse.inHand'), 8, 100), COLORS.dim, 'center');
    osdText(ctx, String(inHand().small), 426, 98, 16, COLORS.osdValue, 'center');
    osdText(ctx, t('fuse.fuses'), 426, 122, fittedSize(ctx, t('fuse.fuses'), 8, 100), COLORS.dim, 'center');
    if (inHand().large) {
      osdText(ctx, String(inHand().large), 426, 146, 16, COLORS.osdValue, 'center');
      osdText(ctx, t('fuse.large'), 426, 170, fittedSize(ctx, t('fuse.large'), 8, 100), COLORS.dim, 'center');
    }
    const line = note();
    if (line) osdText(ctx, t(line), W / 2, 12, fittedSize(ctx, t(line), 10, 440), COLORS.soft, 'center');
    osdText(ctx, t('fuse.footer'), W / 2, H - 22, fittedSize(ctx, t('fuse.footer'), 8, 460), COLORS.dim, 'center');
  }

  function hits() {
    const sockets = circuits.map((_, i) => {
      const { x, y } = socketAt(i);
      return { x: x - 14, y: y - 6, w: 88, h: 66, click: () => { chosen = i; toggle(i); } };
    });
    const board = { ...BOARD, click: () => {} };
    const outside = { x: 0, y: 0, w: W, h: H, click: () => performance.now() - openedAt > 400 && ui.resume() };
    return [...sockets, board, outside];
  }

  function key(code) {
    if (code === 'ArrowLeft') chosen = chosen % 3 === 0 ? chosen + 2 : chosen - 1;
    else if (code === 'ArrowRight') chosen = chosen % 3 === 2 ? chosen - 2 : chosen + 1;
    else if (code === 'ArrowUp' || code === 'ArrowDown') chosen = (chosen + 3) % 6;
    else if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') toggle(chosen);
    else if (code === 'Escape') ui.resume();
    else return false;
    return true;
  }

  return { name: 'wardFuses', look: 'paper', draw, hits, key, chosen: () => chosen, states: () => circuits.map((_, i) => state(i)), inHand, note };
}
