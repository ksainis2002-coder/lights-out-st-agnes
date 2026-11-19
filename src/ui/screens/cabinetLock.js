// The theatre cabinet's lock up close (0.5, part C; approved still
// cabinet_lock): a steel plate, its rivets, a keyhole that takes no key, and
// five little brass keys with the dorm music box's pictures. Click a key, or
// press 1–5, to play its note; the lock's answer shows above the plate a
// moment. ESC or a click outside steps back. The puzzle (puzzles/cabinet.js)
// passes press and line (the key of the answer showing, or null).
import { osdText, COLORS } from '../osd.js';
import { drawSymbol, TUNE_SYMBOLS } from '../../props/parts.js';

const W = 480;
const H = 270;
const KEY = { x: 130, y: 140, w: 38, h: 46, step: 46 };
const LIT_FOR = 180; // ms a pressed key stays down

function plate(ctx) {
  ctx.fillStyle = '#4a4e52';
  ctx.fillRect(110, 70, 260, 140);
  ctx.fillStyle = '#6c7074';
  ctx.fillRect(116, 76, 248, 128);
  ctx.fillStyle = '#3a3c40';
  [[122, 82], [352, 82], [122, 192], [352, 192]].forEach(([x, y]) => ctx.fillRect(x, y, 6, 6)); // rivets
  ctx.fillStyle = '#2a2a2c';
  ctx.fillRect(234, 96, 12, 22); // the keyhole that takes no key
}

export function createCabinetLockScreen(ui, { press, line }) {
  const { t } = ui;
  const openedAt = performance.now(); // the click that opened it must not press a key
  let down = -1;
  let downAt = 0;

  function play(i) {
    down = i;
    downAt = performance.now();
    press(i);
  }

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    plate(ctx);
    const pressed = performance.now() - downAt < LIT_FOR ? down : -1;
    TUNE_SYMBOLS.forEach((name, i) => {
      const x = KEY.x + i * KEY.step;
      const y = KEY.y + (i === pressed ? 2 : 0);
      ctx.fillStyle = i === pressed ? '#c49a58' : '#b0884a';
      ctx.fillRect(x, y, KEY.w, KEY.h);
      ctx.fillStyle = '#c8a462';
      ctx.fillRect(x + 2, y + 2, KEY.w - 4, 6);
      ctx.strokeStyle = '#3a2614';
      ctx.lineWidth = 2;
      drawSymbol(ctx, name, x + 5, y + 7, 28);
      osdText(ctx, String(i + 1), x + KEY.w / 2, KEY.y + KEY.h + 4, 8, COLORS.dim, 'center');
    });
    const said = line();
    if (said) osdText(ctx, t(said), W / 2, 48, 10, COLORS.text, 'center');
    osdText(ctx, t('musicBox.footer'), W / 2, H - 22, 8, COLORS.dim, 'center');
  }

  function hits() {
    const keys = TUNE_SYMBOLS.map((name, i) => ({ x: KEY.x + i * KEY.step, y: KEY.y, w: KEY.w, h: KEY.h, click: () => play(i) }));
    const outside = { x: 0, y: 0, w: W, h: H, click: () => performance.now() - openedAt > 400 && ui.resume() };
    return [...keys, outside];
  }

  function key(code) {
    const digit = /^Digit([1-5])$/.exec(code);
    if (digit) play(Number(digit[1]) - 1);
    else if (code === 'Escape') ui.resume();
    else return false;
    return true;
  }

  return { name: 'cabinetLock', look: 'paper', draw, hits, key };
}
