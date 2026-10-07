// Settings as a VCR on-screen-display menu (approved still: settings).
import { osdText, fittedSize, wrapText, COLORS } from '../osd.js';
import { buildTabs, rebind } from '../settingsRows.js';

const W = 480;
const H = 270;
const VISIBLE_ROWS = 6;
const ROW_TOP = 66;
const ROW_STEP = 22;

export function createSettingsScreen(ui, { returnTo = 'menu' } = {}) {
  const { t, settings } = ui;
  let tab = 0;
  let row = 0;
  let scroll = 0;
  let waiting = null;
  const screen = { waitingFor: () => waiting, waitForKey: (action) => (waiting = action) };
  const tabs = buildTabs(settings, t, screen);
  const rows = () => tabs[tab].rows;

  function selectTab(index) {
    tab = (index + tabs.length) % tabs.length;
    row = 0;
    scroll = 0;
  }

  function selectRow(index) {
    row = Math.max(0, Math.min(rows().length - 1, index));
    if (row < scroll) scroll = row;
    if (row >= scroll + VISIBLE_ROWS) scroll = row - VISIBLE_ROWS + 1;
  }

  function change(index, dir) {
    const item = rows()[index];
    if (!item.disabled && item.change) item.change(dir);
  }

  function activate(index) {
    const item = rows()[index];
    if (item.disabled) return;
    if (item.activate) item.activate();
    else item.change?.(1);
  }

  function draw(ctx) {
    ctx.fillStyle = COLORS.osdBlue;
    ctx.fillRect(0, 0, W, H);
    osdText(ctx, t('settings.title'), 20, 14, 13);
    tabs.forEach((item, i) => drawTab(ctx, item, i));
    ctx.fillStyle = COLORS.text;
    ctx.fillRect(16, 54, W - 32, 1);
    rows().slice(scroll, scroll + VISIBLE_ROWS).forEach((item, i) => drawRow(ctx, item, scroll + i, i));
    if (scroll > 0) osdText(ctx, '▲', W / 2, 56, 7, COLORS.osdSoft, 'center');
    if (scroll + VISIBLE_ROWS < rows().length) osdText(ctx, '▼', W / 2, ROW_TOP + VISIBLE_ROWS * ROW_STEP - 6, 7, COLORS.osdSoft, 'center');
    drawHelp(ctx, rows()[row].help());
    const footer = t('settings.footer');
    osdText(ctx, footer, W - 20, H - 18, fittedSize(ctx, footer, 9, 440), COLORS.osdSoft, 'right');
  }

  function drawTab(ctx, item, i) {
    const x = 20 + i * 112;
    if (i === tab) {
      ctx.fillStyle = COLORS.text;
      ctx.fillRect(x - 4, 36, 106, 16);
    }
    const label = t(`settings.tab.${item.id}`);
    osdText(ctx, label, x + 49, 38, fittedSize(ctx, label, 10, 100), i === tab ? COLORS.osdBlue : COLORS.text, 'center');
  }

  function drawRow(ctx, item, index, slot) {
    const y = ROW_TOP + slot * ROW_STEP;
    if (index === row) {
      ctx.fillStyle = 'rgba(232,240,255,0.18)';
      ctx.fillRect(16, y - 4, W - 32, 20);
      osdText(ctx, '▶', 22, y, 10);
    }
    const color = item.disabled ? COLORS.osdGrey : COLORS.text;
    const label = item.label();
    osdText(ctx, label, 40, y, fittedSize(ctx, label, 10, 220), color);
    const raw = item.value();
    const value = item.change && !item.disabled && waiting === null ? `◀ ${raw} ▶` : raw;
    osdText(ctx, value, W - 30, y, fittedSize(ctx, value, 10, 190), item.disabled ? COLORS.osdGrey : COLORS.osdValue, 'right');
  }

  function drawHelp(ctx, text) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(16, 204, W - 32, 30);
    wrapText(ctx, text, 9, W - 56).slice(0, 2).forEach((line, i) => osdText(ctx, line, 26, 208 + i * 12, 9, COLORS.osdSoft));
  }

  const hits = () => [
    ...tabs.map((item, i) => ({ x: 16 + i * 112, y: 36, w: 106, h: 16, click: () => selectTab(i) })),
    ...rows().slice(scroll, scroll + VISIBLE_ROWS).map((item, slot) => {
      const index = scroll + slot;
      const y = ROW_TOP + slot * ROW_STEP - 4;
      return {
        x: 16, y, w: W - 32, h: 20,
        hover: () => (row = index),
        click: (px) => (px < W - 120 || !item.change ? activate(index) : change(index, px < W - 90 ? -1 : 1)),
      };
    }),
  ];

  function captureKey(code) {
    if (code !== 'Escape') rebind(settings, waiting, code);
    waiting = null;
    return true;
  }

  function key(code, event) {
    if (waiting) return captureKey(code);
    if (code === 'Tab') selectTab(tab + (event?.shiftKey ? -1 : 1));
    else if (code === 'ArrowDown') selectRow(row + 1);
    else if (code === 'ArrowUp') selectRow(row - 1);
    else if (code === 'ArrowLeft') change(row, -1);
    else if (code === 'ArrowRight') change(row, 1);
    else if (code === 'Enter' || code === 'Space') activate(row);
    else if (code === 'Escape' || code === 'Backspace') ui.open(returnTo);
    else return false;
    return true;
  }

  return {
    name: 'settings',
    look: 'screen',
    draw,
    hits,
    key,
    wheel: (dir) => selectRow(row + dir),
    state: () => ({ tab: tabs[tab].id, row, waiting }),
  };
}
