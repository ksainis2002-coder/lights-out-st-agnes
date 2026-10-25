// "Your mind" card (approved still ui_sanityCard): what sanity is, what wears
// it down and what steadies it, where the pulse is, and what a blackout does.
// Shown the first time the mind slips and once after the first blackout.
import { osdText, wrapText, COLORS } from '../osd.js';
import { drawPulseGlyph, sanityState } from '../pulse.js';

const W = 480;
const H = 270;
const PANEL = { x: 110, y: 50, w: 260 }; // grows with its text

export function createSanityCardScreen(ui, { after = false } = {}) {
  const { t, game } = ui;
  const openedAt = performance.now();

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    const lines = t(after ? 'card.sanity.after' : 'card.sanity.body').split('\n').flatMap((part) => (part ? wrapText(ctx, part, 9, PANEL.w - 24) : ['']));
    const height = 70 + lines.length * 12 + 26;
    ctx.fillStyle = 'rgba(5,7,10,0.9)';
    ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, height);
    ctx.strokeStyle = 'rgba(232,240,255,0.35)';
    ctx.strokeRect(PANEL.x + 0.5, PANEL.y + 0.5, PANEL.w - 1, height - 1);
    osdText(ctx, t('card.sanity.title'), W / 2, PANEL.y + 8, 8, COLORS.dim, 'center');
    drawPulseGlyph(ctx, W / 2 - 34, PANEL.y + 26, sanityState(game.sanity.value()), game.time);
    lines.forEach((line, i) => osdText(ctx, line, W / 2, PANEL.y + 54 + i * 12, 9, COLORS.soft, 'center'));
    osdText(ctx, t('card.footer'), W / 2, PANEL.y + height - 18, 8, COLORS.dim, 'center');
  }

  const close = () => performance.now() - openedAt > 400 && ui.resume();
  const hits = () => [{ x: 0, y: 0, w: W, h: H, click: close }];
  function key(code) {
    if (!['Enter', 'Space', 'Escape'].includes(code)) return false;
    ui.resume();
    return true;
  }

  return { name: 'sanityCard', look: 'paper', draw, hits, key };
}
