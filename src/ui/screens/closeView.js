// "Look closer" screens for things you read rather than play (owner request
// 2026-10-14: puzzles that read better up close are up close). The Classroom
// 2 counting board (approved still ui_countingBoard) and the class painting
// (ui_painting). Text comes from i18n keys in the level data. ESC or a click
// steps back.
//   game.openScreen('closeView', { view: 'board', lines: ['chalk.class2.title', …] })
//   game.openScreen('closeView', { view: 'painting', caption: 'art.paintingCaption' })
import { osdText, COLORS } from '../osd.js';
import { classPaintingTexture } from '../../props/art.js';

const W = 480;
const H = 270;
const SERIF = 'Georgia, "DejaVu Serif", serif';
const CHALK = 'rgba(236,236,226,0.92)';

function serif(ctx, text, x, y, size, color, align = 'left', style = '') {
  ctx.font = `${style} ${size}px ${SERIF}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// The board, its chalk lines shrunk to fit (Greek lines run longer).
function drawBoard(ctx, t, { lines = [] }) {
  ctx.fillStyle = '#5a3e28';
  ctx.fillRect(36, 20, 408, 212);
  ctx.fillStyle = '#1f2a24';
  ctx.fillRect(44, 28, 392, 196);
  ctx.fillStyle = 'rgba(220,220,210,0.05)'; // old wiped chalk
  [[120, 80], [300, 60], [380, 170], [90, 190], [250, 150]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, 60, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });
  const text = lines.map((key) => t(key));
  const step = Math.min(26, 180 / Math.max(1, text.length));
  let size = Math.min(13, step * 0.6);
  ctx.font = `italic ${size}px ${SERIF}`;
  while (size > 7 && Math.max(...text.map((line) => ctx.measureText(line).width)) > 360) {
    size -= 0.5;
    ctx.font = `italic ${size}px ${SERIF}`;
  }
  text.forEach((line, i) => serif(ctx, line, 60, 50 + i * step, size, CHALK, 'left', 'italic'));
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(36, 232, 408, 5); // the chalk ledge
  ctx.fillStyle = '#e8e8dc';
  ctx.fillRect(330, 228, 14, 4);
}

// The class painting, names readable, the caption card under the frame.
function drawPainting(ctx, t, { caption }) {
  ctx.fillStyle = '#3a2414';
  ctx.fillRect(62, 18, 356, 194);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(classPaintingTexture().image, 70, 26, 340, 178);
  ctx.imageSmoothingEnabled = true;
  if (!caption) return;
  const text = t(caption);
  ctx.font = `italic 10px ${SERIF}`;
  const width = Math.max(148, ctx.measureText(text).width + 20);
  ctx.fillStyle = '#e4dcc4';
  ctx.fillRect(W / 2 - width / 2, 220, width, 15);
  serif(ctx, text, W / 2, 231, 10, '#2a2018', 'center', 'italic');
}

const VIEWS = { board: drawBoard, painting: drawPainting };

export function createCloseViewScreen(ui, options) {
  const { t } = ui;
  const openedAt = performance.now();

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    VIEWS[options.view](ctx, t, options);
    osdText(ctx, t('closeView.footer'), W / 2, H - 22, 8, COLORS.dim, 'center');
  }

  const hits = () => [{ x: 0, y: 0, w: W, h: H, click: () => performance.now() - openedAt > 400 && ui.resume() }];

  function key(code) {
    if (code !== 'Escape') return false;
    ui.resume();
    return true;
  }

  return { name: 'closeView', view: options.view, look: 'game', draw, hits, key };
}
