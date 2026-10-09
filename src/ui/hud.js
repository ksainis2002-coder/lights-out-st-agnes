// In-game HUD on the 480×270 UI layer (approved still ui_prompt): a centre
// dot and one prompt line when something usable is in view. Nothing else.
import { osdText } from './osd.js';
import { keyName } from './settingsRows.js';

const W = 480;
const H = 270;

export function drawHud(ctx, game) {
  const target = game.interaction.target();
  if (!target) return false;
  const { key, params } = target.prompt();
  ctx.fillStyle = 'rgba(232,240,255,0.8)';
  ctx.fillRect(W / 2 - 1, H / 2 - 1, 2, 2);
  const text = `${keyName(game.settings.get('keys').use)}  ${game.i18n.t(key, params)}`;
  ctx.font = 'bold 10px monospace';
  const width = ctx.measureText(text).width + 16;
  ctx.fillStyle = 'rgba(5,7,10,0.55)';
  ctx.fillRect(W / 2 - width / 2, H / 2 + 22, width, 16);
  ctx.strokeStyle = 'rgba(232,240,255,0.35)';
  ctx.strokeRect(W / 2 - width / 2 + 0.5, H / 2 + 22.5, width - 1, 15);
  osdText(ctx, text, W / 2, H / 2 + 25, 10, '#e8f0ff', 'center');
  return true;
}
