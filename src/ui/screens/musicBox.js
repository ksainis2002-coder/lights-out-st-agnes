// Music box close-up (approved still ui_musicBoxClose): using the wound box
// brings it up in front of you. Click a picture key, or press 1–5, to play
// its note; the notes played so far show above the box. ESC or a click
// outside steps back. The puzzle (puzzles/musicBox.js) passes press/played.
import { osdText, COLORS } from '../osd.js';
import { drawSymbol, TUNE_SYMBOLS } from '../../props/parts.js';

const W = 480;
const H = 270;
const KEY = { x: 130, y: 140, w: 38, h: 46, step: 46 };
const LIT_FOR = 180; // ms a pressed key stays lit

export function createMusicBoxScreen(ui, { press, played }) {
  const { t } = ui;
  const openedAt = performance.now(); // the click that opened it must not play a key
  let lit = -1;
  let litAt = 0;

  function play(i) {
    lit = i;
    litAt = performance.now();
    press(i);
  }

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#3a1c10';
    ctx.fillRect(110, 70, 260, 140);
    ctx.fillStyle = '#5a2c1a';
    ctx.fillRect(116, 76, 248, 128);
    ctx.fillStyle = '#4a2214';
    ctx.fillRect(116, 76, 248, 46); // the lid, propped open
    ctx.fillStyle = '#b8a060';
    ctx.fillRect(232, 92, 16, 16); // the crank, fitted
    const glow = performance.now() - litAt < LIT_FOR ? lit : -1;
    TUNE_SYMBOLS.forEach((name, i) => {
      const x = KEY.x + i * KEY.step;
      ctx.fillStyle = i === glow ? '#fff8e4' : '#d8d0b8';
      ctx.fillRect(x, KEY.y, KEY.w, KEY.h);
      ctx.strokeStyle = '#3a2214';
      ctx.lineWidth = 2;
      drawSymbol(ctx, name, x + 5, KEY.y + 7, 28);
      osdText(ctx, String(i + 1), x + KEY.w / 2, KEY.y + KEY.h + 4, 8, COLORS.dim, 'center');
    });
    const notes = played();
    notes.forEach((name, i) => {
      ctx.strokeStyle = '#c9d2e0';
      ctx.lineWidth = 1.5;
      drawSymbol(ctx, name, W / 2 - (notes.length * 24) / 2 + i * 24 + 3, 40, 18);
    });
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

  return { name: 'musicBox', look: 'game', draw, hits, key };
}
