// Piano close-up (approved still ui_piano_shapes): playing the music-room
// piano brings its keyboard up close, like the music box. Twelve keys across
// the screen; the eight in the middle play (1–8, middle C to C), Maggie's
// stickers on keys 1–6, each colour with its own shape. Click a key or press
// 1–8; the stickers of the notes played so far show above. ESC or a click
// outside steps back. The puzzle (puzzles/piano.js) passes press/played.
import { osdText, COLORS } from '../osd.js';
import { PIANO_STICKERS, drawSticker } from '../../props/music.js';

const W = 480;
const H = 270;
const KEY = { w: 34, x: 36, top: 122, h: 106 };
const BLACK_AFTER = [0, 2, 3, 5, 6, 7, 9, 10]; // a black key between this white key and the next
const LIT_FOR = 180; // ms a pressed key stays lit

// Screen position 2..9 is key 1..8; 0–1 and 10–11 are the dimmed keys either side.
const keyX = (key) => KEY.x + (key + 1) * KEY.w;

export function createPianoScreen(ui, { press, played }) {
  const { t } = ui;
  const openedAt = performance.now(); // the click that opened it must not play a key
  let lit = 0;
  let litAt = 0;

  function play(key) {
    lit = key;
    litAt = performance.now();
    press(key);
  }

  function drawKeys(ctx) {
    const glow = performance.now() - litAt < LIT_FOR ? lit : 0;
    for (let i = 0; i < 12; i++) {
      const key = i - 1;
      ctx.fillStyle = key === glow ? '#fff8e4' : '#d8d0b8';
      ctx.fillRect(KEY.x + i * KEY.w + 1, KEY.top, KEY.w - 2, KEY.h);
      if (key >= 1 && key <= 6) drawSticker(ctx, PIANO_STICKERS[key - 1], KEY.x + i * KEY.w + KEY.w / 2, 210, 8, true);
      if (key >= 1 && key <= 8) osdText(ctx, String(key), KEY.x + i * KEY.w + KEY.w / 2, 233, 8, COLORS.dim, 'center');
    }
    ctx.fillStyle = '#141010';
    BLACK_AFTER.forEach((i) => ctx.fillRect(KEY.x + (i + 1) * KEY.w - 10, KEY.top, 20, 62));
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; // the keys either side are not played
    ctx.fillRect(KEY.x, KEY.top, KEY.w * 2, KEY.h);
    ctx.fillRect(KEY.x + KEY.w * 10, KEY.top, KEY.w * 2, KEY.h);
  }

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2a160e'; // the case above the keys
    ctx.fillRect(KEY.x - 8, 58, KEY.w * 12 + 16, 66);
    ctx.fillStyle = '#3a2016';
    ctx.fillRect(KEY.x - 8, 112, KEY.w * 12 + 16, 10); // the fallboard
    drawKeys(ctx);
    const notes = played();
    notes.forEach((key, i) => {
      const sticker = PIANO_STICKERS[key - 1];
      const x = W / 2 - ((notes.length - 1) * 22) / 2 + i * 22;
      if (sticker) drawSticker(ctx, sticker, x, 36, 8, true);
      else osdText(ctx, String(key), x, 30, 10, COLORS.soft, 'center'); // keys 7 and 8 have no sticker
    });
    osdText(ctx, t('piano.footer'), W / 2, H - 22, 8, COLORS.dim, 'center');
  }

  function hits() {
    const keys = [1, 2, 3, 4, 5, 6, 7, 8].map((key) => ({ x: keyX(key), y: KEY.top, w: KEY.w, h: KEY.h, click: () => play(key) }));
    const outside = { x: 0, y: 0, w: W, h: H, click: () => performance.now() - openedAt > 400 && ui.resume() };
    return [...keys, outside];
  }

  function key(code) {
    const digit = /^Digit([1-8])$/.exec(code);
    if (digit) play(Number(digit[1]));
    else if (code === 'Escape') ui.resume();
    else return false;
    return true;
  }

  return { name: 'piano', look: 'paper', draw, hits, key, played };
}
