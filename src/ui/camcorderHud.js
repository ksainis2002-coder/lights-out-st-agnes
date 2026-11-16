// The camcorder's own display, while it is raised (approved still
// camcorder_night): corner marks, REC and the tape counter, NIGHT, its
// battery, the date and time of your own clock (the year never shows), the
// flash's state, and your pulse: once the camcorder is found, this is the
// only place the pulse is shown.
import { osdText, COLORS } from './osd.js';
import { drawPulseGlyph, sanityState } from './pulse.js';

const W = 480;
const H = 270;
const EDGE = 26;
const LOW = 15; // battery, out of 100

function corners(ctx) {
  ctx.strokeStyle = 'rgba(232,240,255,0.85)';
  ctx.lineWidth = 2;
  [[EDGE, EDGE, 1, 1], [W - EDGE, EDGE, -1, 1], [EDGE, H - EDGE, 1, -1], [W - EDGE, H - EDGE, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x + sx * 20, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * 20);
    ctx.stroke();
  });
  ctx.fillStyle = 'rgba(232,240,255,0.7)';
  ctx.fillRect(W / 2 - 5, H / 2, 11, 1);
  ctx.fillRect(W / 2, H / 2 - 5, 1, 11);
}

function batteryCell(ctx, x, y, level) {
  const bars = level <= 0 ? 0 : Math.ceil((level / 100) * 3);
  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, 30, 11);
  ctx.fillStyle = COLORS.text;
  ctx.fillRect(x + 31, y + 3, 3, 6);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < bars ? (level < LOW ? COLORS.red : COLORS.text) : 'rgba(232,240,255,0.2)';
    ctx.fillRect(x + 3 + i * 9, y + 3, 7, 6);
  }
}

const pad = (n) => String(n).padStart(2, '0');

export function drawCamcorder(ctx, game) {
  const { camcorder, i18n } = game;
  if (!camcorder.raised() || game.inventory.isOpen()) return false;
  const t = i18n.t;
  corners(ctx);
  const steady = game.settings.get('flickerOff') || game.settings.get('reduceEffects');
  if (steady || Math.floor(game.time * 1.5) % 2 === 0) {
    ctx.fillStyle = COLORS.red;
    ctx.beginPath();
    ctx.arc(EDGE + 14, EDGE + 16, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  osdText(ctx, 'REC', EDGE + 24, EDGE + 10, 12);
  if (camcorder.night()) osdText(ctx, t('camcorder.night'), EDGE + 10, EDGE + 28, 9, '#9dffb0');
  const s = Math.floor(game.session.playTime);
  osdText(ctx, `SP ${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`, W - EDGE - 10, EDGE + 10, 12, COLORS.text, 'right');
  batteryCell(ctx, W - EDGE - 44, EDGE + 29, camcorder.battery());
  if (camcorder.battery() < LOW) osdText(ctx, t('camcorder.batteryLow'), W - EDGE - 10, EDGE + 44, 8, COLORS.red, 'right');
  const now = game.world.now();
  const month = t('camcorder.months').split(',')[now.getMonth()];
  osdText(ctx, `${month} ${now.getDate()} 19--`, W - EDGE - 10, H - EDGE - 62, 10, COLORS.text, 'right');
  const hour = now.getHours() % 12 || 12;
  osdText(ctx, `${now.getHours() < 12 ? 'AM' : 'PM'} ${String(hour).padStart(2, ' ')}:${pad(now.getMinutes())}`, W - EDGE - 10, H - EDGE - 49, 10, COLORS.text, 'right');
  const ready = camcorder.flashReady();
  osdText(ctx, t(ready ? 'camcorder.flashReady' : 'camcorder.charging'), W / 2, EDGE + 10, 9, ready ? COLORS.osdValue : COLORS.dim, 'center');
  const state = sanityState(game.sanity.value());
  drawPulseGlyph(ctx, EDGE + 10, H - EDGE - 60, state, game.time); // above where subtitles sit
  osdText(ctx, t(`pulse.${state.name}`), EDGE + 80, H - EDGE - 58, 8, '#c9d2e0');
  return true;
}
