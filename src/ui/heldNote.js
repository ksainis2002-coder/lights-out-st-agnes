// A document held at the player's side (approved still ui_heldNote): a small
// tilted paper in the lower left, readable while walking and using things.
// H in the journal's DOCUMENTS tab pulls one out; H in game puts it away.
// Hidden while the inventory strip is open.
import { osdText, COLORS } from './osd.js';
import { keyName } from './settingsRows.js';
import { PAPER, paperText, paperParagraph } from './paper.js';

const X = 10;
const Y = 78; // clear of the sanity pulse below
const W = 120;
const H = 154;

export function drawHeldNote(ctx, game) {
  const id = game.journal.held();
  if (!id || game.inventory.isOpen()) return false;
  const { t } = game.i18n;
  osdText(ctx, t('heldNote.putAway', { key: keyName(game.settings.get('keys').hold) }), X + 2, Y - 14, 8, COLORS.soft);
  ctx.save();
  ctx.translate(X, Y);
  ctx.rotate(-0.03);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(3, 3, W, H);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.beginPath();
  ctx.rect(0, 0, W, H - 4);
  ctx.clip(); // long documents run off the bottom of the paper
  const top = paperParagraph(ctx, t(`doc.${id}.title`), 7, 7, W - 14, 9, 11) + 4;
  paperParagraph(ctx, t(`doc.${id}.body`), 7, top, W - 14, 8, 10);
  ctx.restore();
  return true;
}
