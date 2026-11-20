// An ending's last card (approved still end_card): black, the tape's STOP in
// its corner, the ending's line, and how many of the endings you have found.
// A click or a key (after a moment, so the last one pressed does not skip
// it) takes you back to the title. The ending (cutscenes/ending.js) passes
// card, found, total and done.
import { osdText, fittedSize, COLORS } from '../osd.js';

const W = 480;
const H = 270;
const HOLD = 800; // ms before it can be left

export function createEndCardScreen(ui, { card, found, total, done }) {
  const { t } = ui;
  const openedAt = performance.now();
  const leave = () => performance.now() - openedAt > HOLD && done();

  function draw(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    osdText(ctx, `■ ${t('tape.stop')}`, 22, 20, 9, COLORS.text);
    const line = t(card);
    osdText(ctx, line, W / 2, 118, fittedSize(ctx, line, 14, 440), COLORS.text, 'center');
    osdText(ctx, t('ending.found', { n: found, total }), W / 2, 150, 9, COLORS.dim, 'center');
    osdText(ctx, t('hud.clickToContinue'), W / 2, H - 24, 8, COLORS.dim, 'center');
  }

  const hits = () => [{ x: 0, y: 0, w: W, h: H, click: leave }];

  function key(code) {
    if (!['Enter', 'Space', 'Escape'].includes(code)) return false;
    leave();
    return true;
  }

  return { name: 'endCard', look: 'game', draw, hits, key };
}
