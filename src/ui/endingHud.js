// While an ending plays (approved stills ending_road, ending_lamp,
// ending_morning, ending_walls, ending_coal): black bars above and below the
// scene, its line in the lower one, "ENTER skip" in the corner.
import { osdText, wrapText, COLORS } from './osd.js';

const W = 480;
const H = 270;
const TOP = 34;
const BOTTOM = 46;

export function drawEnding(ctx, game) {
  if (!game.ending?.active()) return false;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, TOP);
  ctx.fillRect(0, H - BOTTOM, W, BOTTOM);
  const text = game.ending.line();
  if (text) {
    const lines = wrapText(ctx, text, 10, 440);
    const top = H - 32 - (lines.length - 1) * 6;
    lines.forEach((line, i) => osdText(ctx, line, W / 2, top + i * 12, 10, COLORS.text, 'center'));
  }
  osdText(ctx, game.i18n.t('intro.skip'), W - 12, 12, 8, COLORS.dim, 'right');
  return true;
}
