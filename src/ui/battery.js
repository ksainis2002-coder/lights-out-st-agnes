// Flashlight battery (approved still ui_battery, owner revision): a small
// torch beside a four-cell battery in the lower right. It stays on screen the
// whole time the flashlight is on. Cells turn amber at half and red when low,
// with "LOW" beside it. Steady, never blinking (flicker rules).
import { osdText } from './osd.js';
import { LOW } from '../player/battery.js';
import { keyName } from './settingsRows.js';

const INK = 'rgba(232,240,255,0.9)';
const CELL = { full: '#e8f0ff', half: '#ffc860', low: '#ff6a5a' };

// Side-on torch: body, wider head, and the beam glass.
function drawTorch(ctx, x, y) {
  ctx.fillStyle = INK;
  ctx.fillRect(x, y + 4, 10, 6);
  ctx.fillRect(x + 10, y + 2, 4, 10);
  ctx.fillStyle = '#ffe9a0';
  ctx.fillRect(x + 14, y + 3, 1, 8);
}

export function drawBattery(ctx, game, W, H) {
  if (!game.progress.hasFlag('tool_flashlight') || !game.battery.visible()) return false;
  const charge = game.battery.charge();
  const x = W - 50;
  const y = H - 30;
  drawTorch(ctx, x - 22, y);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, 34, 14);
  ctx.fillStyle = INK;
  ctx.fillRect(x + 35, y + 4, 3, 7);
  const color = charge < LOW ? CELL.low : charge < 0.5 ? CELL.half : CELL.full;
  ctx.fillStyle = color;
  const cells = Math.ceil(charge * 4);
  for (let i = 0; i < cells; i++) ctx.fillRect(x + 3 + i * 8, y + 3, 6, 9);
  if (charge < LOW) osdText(ctx, game.i18n.t('hud.batteryLow'), x - 28, y + 3, 9, CELL.low, 'right');
  // With a spare in the pockets and the cell half gone: which key swaps it.
  if (charge < 0.5 && game.inventory.has('battery')) {
    const key = keyName(game.settings.get('keys').battery);
    osdText(ctx, game.i18n.t('hud.batterySwap', { key }), x + 38, y - 12, 8, INK, 'right');
  }
  return true;
}
