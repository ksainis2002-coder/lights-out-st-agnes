// Flashlight battery cell (approved still ui_battery): lower right, four bars,
// "LOW" beside it when nearly empty. Shown for a moment after F, and always
// while low. Steady, never blinking (flicker rules).
import { osdText, COLORS } from './osd.js';
import { LOW } from '../player/battery.js';

const INK = 'rgba(232,240,255,0.85)';

export function drawBattery(ctx, game, W, H) {
  if (!game.progress.hasFlag('tool_flashlight') || !game.battery.visible()) return false;
  const charge = game.battery.charge();
  const x = W - 52;
  const y = H - 30;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, 30, 12);
  ctx.fillStyle = INK;
  ctx.fillRect(x + 31, y + 4, 2, 5);
  const bars = Math.ceil(charge * 4);
  for (let i = 0; i < bars; i++) ctx.fillRect(x + 3 + i * 7, y + 3, 6, 7);
  if (charge < LOW) osdText(ctx, game.i18n.t('hud.batteryLow'), x - 6, y + 2, 9, '#ff6a5a', 'right');
  return true;
}
