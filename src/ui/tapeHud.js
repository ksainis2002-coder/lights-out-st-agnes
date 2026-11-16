// While Nora's tape plays (approved still ui_tape): the television's screen
// fills the view, a dark rounded bezel and the set's cabinet round it, her
// camcorder's REC and NIGHT on the footage, the VCR's counter in the corner,
// her words as subtitles inside the screen.
import { osdText, fittedSize, COLORS } from './osd.js';

const W = 480;
const H = 270;
const SCREEN = { x: 70, y: 22, w: 340, h: 212 };

const pad = (n) => String(n).padStart(2, '0');

export function drawTape(ctx, game) {
  if (!game.tape?.active()) return false;
  const { t } = game.i18n;
  const { x, y, w, h } = SCREEN;
  ctx.fillStyle = '#0c0c0e';
  ctx.fillRect(0, 0, W, y);
  ctx.fillRect(0, y + h, W, H - y - h);
  ctx.fillRect(0, 0, x, H);
  ctx.fillRect(x + w, 0, W - x - w, H);
  ctx.strokeStyle = '#2a2a2e'; // the tube's curved edge
  ctx.lineWidth = 10;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - 4, y - 4, w + 8, h + 8, 22);
  else ctx.rect(x - 4, y - 4, w + 8, h + 8);
  ctx.stroke();
  ctx.fillStyle = '#3a2a1c'; // the wooden cabinet under it and its knobs
  ctx.fillRect(x - 30, y + h + 14, w + 60, 20);
  ctx.fillStyle = '#b8b0a0';
  ctx.fillRect(x + w - 20, y + h + 19, 8, 8);
  ctx.fillRect(x + w - 6, y + h + 19, 8, 8);
  const steady = game.settings.get('flickerOff') || game.settings.get('reduceEffects');
  if (steady || Math.floor(game.time * 1.5) % 2 === 0) osdText(ctx, '● REC', x + 12, y + 10, 9, COLORS.red);
  osdText(ctx, t('camcorder.night'), x + 12, y + 22, 8, '#9dffb0');
  const s = Math.floor(game.tape.time());
  osdText(ctx, `${t('tape.play')} ▶  0:${pad(Math.floor(s / 60))}:${pad(s % 60)}`, W - 12, 6, 9, COLORS.text, 'right');
  const footer = t('tape.footer');
  osdText(ctx, footer, 12, 6, fittedSize(ctx, footer, 8, 220), COLORS.dim); // top left, opposite the counter
  game.subtitles.draw(ctx, { width: w - 20, bottom: y + h - 8 });
  return true;
}
