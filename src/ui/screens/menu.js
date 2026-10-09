// Main menu as a VHS player (approved still: menu). PLAY starts or resumes,
// SETUP opens settings. REWIND (load) and EJECT (extras) come later.
import { osdText, fittedSize, COLORS } from '../osd.js';

const W = 480;
const H = 270;
const ITEMS = [
  { id: 'play', icon: '▶', label: 'menu.play', hint: 'menu.play.hint', ready: true },
  { id: 'rewind', icon: '◀◀', label: 'menu.rewind', hint: 'menu.rewind.hint', ready: (ui) => ui.game.hasAnySave() },
  { id: 'setup', icon: '■', label: 'menu.setup', hint: 'menu.setup.hint', ready: true },
  { id: 'eject', icon: '⏏', label: 'menu.eject', hint: 'menu.eject.hint', ready: false },
];

function tapeCounter(seconds) {
  const s = Math.floor(seconds);
  const pad = (n) => String(n).padStart(2, '0');
  return `SP  ${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
}

export function createMenuScreen(ui) {
  const { t } = ui;
  let focus = 0;

  const isReady = (item) => (typeof item.ready === 'function' ? item.ready(ui) : item.ready);

  function activate(index) {
    const item = ITEMS[index];
    if (!isReady(item)) return;
    if (item.id === 'play') ui.hasSession() ? ui.play() : ui.newGame();
    if (item.id === 'rewind') ui.open('load', { returnTo: 'menu' });
    if (item.id === 'setup') ui.open('settings', { returnTo: 'menu' });
  }

  function hintFor(item) {
    if (!isReady(item)) return `${t(item.hint)}: ${t(item.id === 'rewind' ? 'menu.noTapes' : 'menu.notYet')}`;
    if (item.id === 'play' && ui.hasSession()) return t('menu.play.resume');
    return t(item.hint);
  }

  function draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, W, H);
    const paused = ui.hasSession();
    osdText(ctx, paused ? `❚❚ ${t('osd.pause')}` : `▶ ${t('osd.play')}`, 16, 12, 12);
    osdText(ctx, tapeCounter(ui.playTime()), W - 16, 12, 12, COLORS.text, 'right');
    osdText(ctx, t('menu.title1'), W / 2, 60, 26, '#f2efe6', 'center');
    osdText(ctx, t('menu.title2'), W / 2, 90, 14, '#c9c2b2', 'center');
    ITEMS.forEach((item, i) => drawItem(ctx, item, i));
    const hint = hintFor(ITEMS[focus]);
    osdText(ctx, hint, W / 2, 228, fittedSize(ctx, hint, 9, 440), COLORS.soft, 'center');
    osdText(ctx, `${t('menu.tracking')} ◀ ▮▮▮▮▮▯▯▯ ▶`, W / 2, H - 18, 8, COLORS.dim, 'center');
  }

  function drawItem(ctx, item, i) {
    const y = 136 + i * 22;
    const on = i === focus;
    if (on) {
      ctx.fillStyle = 'rgba(232,240,255,0.9)';
      ctx.fillRect(150, y - 3, 180, 18);
    }
    const base = on ? COLORS.ink : COLORS.text;
    const color = isReady(item) ? base : on ? '#4a5160' : COLORS.dim;
    osdText(ctx, item.icon, 172, y, 11, color);
    osdText(ctx, t(item.label), 206, y, fittedSize(ctx, t(item.label), 11, 118), color);
  }

  const hits = () =>
    ITEMS.map((item, i) => ({
      x: 150, y: 133 + i * 22, w: 180, h: 18,
      hover: () => (focus = i),
      click: () => activate(i),
    }));

  function key(code) {
    if (code === 'ArrowDown' || code === 'KeyS') focus = (focus + 1) % ITEMS.length;
    else if (code === 'ArrowUp' || code === 'KeyW') focus = (focus + ITEMS.length - 1) % ITEMS.length;
    else if (code === 'Enter' || code === 'Space') activate(focus);
    else if (code === 'Escape' && ui.hasSession()) ui.play();
    else return false;
    return true;
  }

  return { name: 'menu', look: 'menu', draw, hits, key, focusedItem: () => ITEMS[focus].id };
}
