// Your breath held (approved still ui_breath; owner 2026-11-17: a ring, not a
// bar or lungs): a ring round the centre of your view that empties as you
// hold it, red at the end, the words under it. Only while you hold it.
import { osdText } from './osd.js';

const RADIUS = 16;
const LOW = 0.3; // under this share left, the ring turns red

export function drawBreath(ctx, game, W, H) {
  if (!game.breath?.holding()) return false;
  const left = game.breath.left();
  const cx = W / 2;
  const cy = H / 2;
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(232,240,255,0.18)';
  ctx.beginPath();
  ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = left < LOW ? '#ff8a7d' : '#e8f0ff';
  ctx.beginPath();
  ctx.arc(cx, cy, RADIUS, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  ctx.stroke();
  osdText(ctx, game.i18n.t('hud.holdingBreath'), cx, cy + 22, 9, '#e8f0ff', 'center');
  return true;
}
