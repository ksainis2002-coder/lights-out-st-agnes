// Card index close-up (approved still ui_cardIndex): 24 lettered drawers
// (A–W and XYZ in English, Α–Ω in Greek, from i18n). Click a drawer: the
// right one (the title's first letter) holds the card for Maggie's book,
// which comes up in front of the cabinet; any other drawer says so on the
// line underneath. ESC or a click outside steps back. The puzzle
// (puzzles/libraryIndex.js) passes pick/found/note.
import { osdText, fittedSize, COLORS } from '../osd.js';

const W = 480;
const H = 270;
const SERIF = 'Georgia, "DejaVu Serif", serif';
const DRAWER = { x: 96, y: 34, w: 44, h: 40, stepX: 48, stepY: 46 };

function serif(ctx, text, x, y, size, color, align = 'left', style = '') {
  ctx.font = `${style} ${size}px ${SERIF}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

const drawerAt = (i) => ({ x: DRAWER.x + (i % 6) * DRAWER.stepX, y: DRAWER.y + Math.floor(i / 6) * DRAWER.stepY });

// The card held up: shelf number, title, and who borrowed it.
function drawCard(ctx, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(134, 104, 216, 104);
  ctx.fillStyle = '#efe6cc';
  ctx.fillRect(130, 100, 216, 104);
  ctx.fillStyle = '#c84a3a';
  ctx.fillRect(130, 126, 216, 1);
  ctx.fillStyle = '#a8bcd0';
  for (let y = 144; y < 200; y += 16) ctx.fillRect(130, y, 216, 1);
  serif(ctx, '784', 140, 119, 14, '#1a1410', 'left', 'bold');
  const title = t('cardIndex.cardTitle');
  ctx.font = `italic 12px ${SERIF}`;
  const size = Math.min(12, (12 * 150) / Math.max(150, ctx.measureText(title).width));
  serif(ctx, title, 182, 119, size, '#1a1410', 'left', 'italic');
  serif(ctx, t('cardIndex.cardLent'), 146, 157, 11, '#2a3a6a', 'left', 'italic');
}

export function createCardIndexScreen(ui, { pick, found, note }) {
  const { t } = ui;
  const openedAt = performance.now();
  const labels = () => t('cardIndex.drawers').split(' ');

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#3a2618';
    ctx.fillRect(88, 26, 304, 196);
    const open = found();
    labels().forEach((label, i) => {
      const { x, y } = drawerAt(i);
      ctx.fillStyle = open === i ? '#120c08' : '#6a4a2e'; // the open drawer is an empty slot
      ctx.fillRect(x, y, DRAWER.w, DRAWER.h);
      if (open === i) return;
      ctx.fillStyle = '#b8944a';
      ctx.fillRect(x + 11, y + 6, 22, 12);
      serif(ctx, label, x + 22, y + 16, label.length > 1 ? 8 : 10, '#2a1e10', 'center', 'bold');
      ctx.fillStyle = '#c8a050';
      ctx.fillRect(x + 17, y + 25, 10, 4);
    });
    if (open !== null) drawCard(ctx, t);
    const line = note();
    if (line) osdText(ctx, t(line), W / 2, 230, fittedSize(ctx, t(line), 9, 440), COLORS.soft, 'center');
    osdText(ctx, t('cardIndex.footer'), W / 2, H - 22, 8, COLORS.dim, 'center');
  }

  function hits() {
    const drawers = labels().map((label, i) => ({ ...drawerAt(i), w: DRAWER.w, h: DRAWER.h, click: () => pick(i) }));
    const card = found() === null ? [] : [{ x: 130, y: 100, w: 216, h: 104 }]; // held up over the drawers
    const outside = { x: 0, y: 0, w: W, h: H, click: () => performance.now() - openedAt > 400 && ui.resume() };
    return [...card, ...drawers, outside];
  }

  function key(code) {
    if (code !== 'Escape') return false;
    ui.resume();
    return true;
  }

  return { name: 'cardIndex', look: 'game', draw, hits, key, found, note };
}
